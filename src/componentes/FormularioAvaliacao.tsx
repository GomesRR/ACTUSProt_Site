import { useEffect, useState, type FormEvent } from 'react'
import { CheckCircle2, Loader2, Mail, MessagesSquare, ShieldCheck, UserRound } from 'lucide-react'
import { api, contato, ErroApi, type Politica, type RespostaAvaliacao } from '../servicos/api'
import { cnpjValido, cpfValido, emailValido, mascaraCpfCnpj, mascaraTelefone, soDigitos } from '../servicos/documentos'

type Campos = { cnpj: string; email: string; telefone: string; nome: string; escritorio: string; site: string }
/** Nome e sobrenome: ao menos duas palavras com letras (o usuário do sistema será nome.sobrenome) */
const nomeCompleto = (n: string) => n.trim().split(/\s+/).filter((p) => /\p{L}{2,}/u.test(p)).length >= 2
const VAZIO: Campos = { cnpj: '', email: '', telefone: '', nome: '', escritorio: '', site: '' }

/**
 * Pedido da avaliação gratuita: só CNPJ, e-mail e telefone são obrigatórios. O ACTUSProt é preparado na nuvem sozinho
 * e o acesso (endereço, login e senha inicial) chega por e-mail em alguns minutos.
 */
export function FormularioAvaliacao({ aoAbrirPrivacidade }: { aoAbrirPrivacidade: () => void }) {
  const [f, setF] = useState<Campos>(VAZIO)
  const [erros, setErros] = useState<Partial<Record<keyof Campos, string>>>({})
  const [erroGeral, setErroGeral] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [pronto, setPronto] = useState<RespostaAvaliacao | null>(null)
  const [indisponivel, setIndisponivel] = useState('')
  const [dias, setDias] = useState(7)
  // CPF digitado: o site não aceita; a avaliação com CPF é liberada pela equipe
  const [comCpf, setComCpf] = useState(false)
  // Aceite da política de privacidade (obrigatório). Com versão publicada no gerenciador, vai o id dela (prova do aceite).
  const [aceite, setAceite] = useState(false)
  const [erroAceite, setErroAceite] = useState('')
  const [politica, setPolitica] = useState<Politica | null>(null)

  useEffect(() => {
    api.disponibilidade().then((d) => { setDias(d.dias || 7); if (!d.ok) setIndisponivel(d.motivo || 'A avaliação online está indisponível no momento.') }).catch(() => {})
    api.politica().then(setPolitica)
  }, [])

  const campo = (k: keyof Campos, mascara?: (v: string) => string) => ({
    value: f[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => { setF((x) => ({ ...x, [k]: mascara ? mascara(e.target.value) : e.target.value })); setErros((x) => ({ ...x, [k]: undefined })); if (k === 'cnpj') setComCpf(false) },
  })

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    const novos: typeof erros = {}
    if (cpfValido(f.cnpj)) { setErros({}); setErroGeral(''); setComCpf(true); return }
    if (!cnpjValido(f.cnpj)) novos.cnpj = 'Informe um CNPJ válido.'
    if (!emailValido(f.email)) novos.email = 'Informe um e-mail válido.'
    if (soDigitos(f.telefone).length < 10) novos.telefone = 'Informe o telefone com DDD.'
    if (!nomeCompleto(f.nome)) novos.nome = 'Informe o nome e o sobrenome.'
    setErros(novos); setErroGeral('')
    setErroAceite(aceite ? '' : 'Para continuar, leia e aceite a política de privacidade.')
    if (Object.keys(novos).length || !aceite) return
    setEnviando(true)
    try {
      setPronto(await api.pedirAvaliacao({ cnpj: soDigitos(f.cnpj), email: f.email.trim(), telefone: soDigitos(f.telefone), nome: f.nome.trim().replace(/\s+/g, ' '), escritorio: f.escritorio.trim() || undefined, site: f.site || undefined, aceitePolitica: politica?.ok ? politica.id : undefined }))
    } catch (falha) {
      const err = falha as ErroApi
      if (err.codigo === 'CPF_NAO_ACEITO') { setComCpf(true); return }
      // Política nova publicada enquanto a página estava aberta: busca a versão atual e pede o aceite de novo
      if (err.codigo === 'ACEITE_POLITICA') { setPolitica(await api.politica(true)); setAceite(false); setErroAceite('A política de privacidade foi atualizada. Leia a versão atual e marque o aceite de novo.'); return }
      if (err.erros && Object.keys(err.erros).length) setErros(err.erros as typeof erros)
      setErroGeral(err.message)
    } finally { setEnviando(false) }
  }

  if (pronto) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-sucesso-soft text-sucesso"><CheckCircle2 className="size-9" /></span>
        <h3 className="text-2xl font-semibold text-brand">Pedido recebido!</h3>
        <p className="max-w-md text-muted">
          Estamos preparando o seu ACTUSProt{pronto.endereco ? <> em <strong className="text-texto">{pronto.endereco.replace(/^https?:\/\//, '')}</strong></> : ''}.
          Em alguns minutos você recebe no e-mail <strong className="text-texto">{pronto.email || f.email}</strong> o endereço, o login e a senha para entrar.
        </p>
        <p className="flex items-center gap-2 rounded-lg bg-fundo px-4 py-2 text-sm text-muted"><Mail className="size-4" /> Não chegou? Confira a caixa de spam.</p>
      </div>
    )
  }

  const rotulo = 'mb-1.5 block text-sm font-medium text-texto'
  const erro = (k: keyof Campos) => erros[k] && <span className="mt-1 block text-xs text-perigo">{erros[k]}</span>
  return (
    <form onSubmit={enviar} noValidate className="space-y-4">
      {indisponivel && <p className="rounded-lg bg-accent-soft px-4 py-3 text-sm text-accent-escuro">{indisponivel}{contato.email && <> Escreva para <a className="font-medium underline" href={`mailto:${contato.email}`}>{contato.email}</a>.</>}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={rotulo}>CNPJ da associação <span className="text-perigo">*</span></span>
          <input className="campo" inputMode="numeric" autoComplete="off" placeholder="00.000.000/0000-00" {...campo('cnpj', mascaraCpfCnpj)} aria-invalid={!!erros.cnpj || comCpf} />
          {erro('cnpj')}
        </label>
        <label className="block">
          <span className={rotulo}>Telefone / WhatsApp <span className="text-perigo">*</span></span>
          <input className="campo" inputMode="tel" autoComplete="tel" placeholder="(00) 00000-0000" {...campo('telefone', mascaraTelefone)} aria-invalid={!!erros.telefone} />
          {erro('telefone')}
        </label>
        <label className="block sm:col-span-2">
          <span className={rotulo}>E-mail <span className="text-perigo">*</span></span>
          <input className="campo" type="email" autoComplete="email" placeholder="voce@suaassociacao.com.br" {...campo('email')} aria-invalid={!!erros.email} />
          <span className="mt-1 block text-xs text-muted">É para este e-mail que enviamos o acesso. Você entra com ele ou com o usuário nome.sobrenome.</span>
          {erro('email')}
        </label>
        <label className="block">
          <span className={rotulo}>Nome e sobrenome <span className="text-perigo">*</span></span>
          <input className="campo" autoComplete="name" placeholder="Ex.: Maria Souza" {...campo('nome')} aria-invalid={!!erros.nome} />
          {erro('nome')}
        </label>
        <label className="block">
          <span className={rotulo}>Nome da associação <span className="font-normal text-muted">(opcional)</span></span>
          <input className="campo" autoComplete="organization" placeholder="Nome da associação" {...campo('escritorio')} />
        </label>
        {/* Campo para robôs: escondido de pessoas */}
        <label className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">Site<input tabIndex={-1} autoComplete="off" {...campo('site')} /></label>
      </div>
      {comCpf && (
        <div role="alert" className="rounded-xl border border-accent/40 bg-accent-soft p-4 text-sm text-texto">
          <p className="flex items-start gap-2"><UserRound className="mt-0.5 size-4 shrink-0 text-accent-escuro" /><span><strong>Não aceitamos CPF no cadastro pelo site.</strong> Ainda não tem CNPJ? Fale com a nossa equipe: avaliamos o seu caso e liberamos a avaliação para você.</span></p>
          {(contato.whatsapp || contato.email) ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {contato.whatsapp && <a className="btn-primario h-10 px-4 text-sm" href={`https://wa.me/${contato.whatsapp}?text=${encodeURIComponent('Olá! Quero avaliar o ACTUSProt, mas não tenho CNPJ (CPF).')}`} target="_blank" rel="noreferrer"><MessagesSquare className="size-4" /> Falar no WhatsApp</a>}
              {contato.email && <a className="btn-contorno h-10 px-4 text-sm" href={`mailto:${contato.email}?subject=${encodeURIComponent('Avaliação do ACTUSProt com CPF')}`} title={contato.email}><Mail className="size-4" /> Enviar e-mail</a>}
            </div>
          ) : <p className="mt-2 text-muted">Use os nossos canais de atendimento no fim da página.</p>}
        </div>
      )}
      <div>
        <label className="flex cursor-pointer items-start gap-2.5 text-sm text-texto">
          <input type="checkbox" className="mt-0.5 size-4 shrink-0 accent-[var(--color-primary)]" checked={aceite} onChange={(e) => { setAceite(e.target.checked); setErroAceite('') }} aria-invalid={!!erroAceite} />
          <span>Li e aceito a <button type="button" onClick={aoAbrirPrivacidade} className="font-medium text-primary-ink underline">política de privacidade</button>{politica?.ok && politica.versao ? ` (versão ${politica.versao})` : ''}. <span className="text-perigo">*</span></span>
        </label>
        {erroAceite && <span className="mt-1 block text-xs text-perigo">{erroAceite}</span>}
      </div>
      {erroGeral && <p className="rounded-lg bg-perigo-soft px-4 py-3 text-sm text-perigo">{erroGeral}</p>}
      <button type="submit" className="btn-primario h-12 w-full text-base" disabled={enviando || !!indisponivel}>
        {enviando ? <><Loader2 className="size-5 animate-spin" /> Preparando o seu ACTUSProt…</> : `Quero testar grátis por ${dias} dias`}
      </button>
      <p className="flex items-start gap-2 text-xs text-muted">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-sucesso" />
        <span>Sem cartão de crédito e sem compromisso. Uma avaliação por CNPJ.</span>
      </p>
    </form>
  )
}
