import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ExternalLink, Loader2, LogIn, X } from 'lucide-react'
import { api, contato, ErroApi, type RespostaAcesso } from '../servicos/api'
import { cnpjValido, cpfValido, mascaraCpfCnpj, soDigitos } from '../servicos/documentos'

/**
 * "Acesse o sistema": a pessoa digita o CNPJ da associação e o ACTUSProt dela abre numa nova aba. Sem cadastro, a
 * janela avisa e sugere a avaliação gratuita.
 */
export function AcessarSistema({ aberto, aoFechar }: { aberto: boolean; aoFechar: () => void }) {
  const [cnpj, setCnpj] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [naoCadastrado, setNaoCadastrado] = useState(false)
  const [resposta, setResposta] = useState<RespostaAcesso | null>(null)
  const campo = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!aberto) return
    setCnpj(''); setErro(''); setNaoCadastrado(false); setResposta(null)
    window.setTimeout(() => campo.current?.focus(), 50)
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && aoFechar()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [aberto, aoFechar])
  if (!aberto) return null

  const acessar = async (e: FormEvent) => {
    e.preventDefault()
    setErro(''); setNaoCadastrado(false); setResposta(null)
    if (!cnpjValido(cnpj) && !cpfValido(cnpj)) { setErro('Informe um CNPJ (ou CPF) válido.'); return }
    // A aba nova é aberta já no clique (os navegadores bloqueiam a que abre depois da consulta)
    const aba = window.open('', '_blank')
    setEnviando(true)
    try {
      const r = await api.acesso(soDigitos(cnpj))
      setResposta(r)
      if (r.situacao === 'ativo' && r.endereco) {
        if (aba) { aba.opener = null; aba.location.href = r.endereco } else window.open(r.endereco, '_blank', 'noopener')
      } else aba?.close()
    } catch (falha) {
      aba?.close()
      const err = falha as ErroApi
      if (err.codigo === 'NAO_CADASTRADO') setNaoCadastrado(true)
      else setErro(err.message)
    } finally { setEnviando(false) }
  }

  const pedirTeste = () => { aoFechar(); window.setTimeout(() => document.getElementById('avaliacao')?.scrollIntoView({ behavior: 'smooth' }), 50) }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4" onMouseDown={aoFechar}>
      <div role="dialog" aria-modal="true" aria-label="Acesse o sistema" className="w-full max-w-md rounded-t-2xl bg-white sm:rounded-2xl" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-borda px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-brand"><LogIn className="size-5 text-primary-ink" /> Acesse o sistema</h2>
          <button type="button" onClick={aoFechar} className="rounded-md p-1.5 text-muted hover:bg-fundo" aria-label="Fechar"><X className="size-5" /></button>
        </div>
        <form onSubmit={acessar} noValidate className="space-y-4 px-6 py-5">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-texto">CNPJ da associação <span className="font-normal text-muted">(ou CPF)</span></span>
            <input ref={campo} className="campo" inputMode="numeric" autoComplete="off" placeholder="00.000.000/0000-00" value={cnpj} onChange={(e) => { setCnpj(mascaraCpfCnpj(e.target.value)); setErro(''); setNaoCadastrado(false); setResposta(null) }} />
            <span className="mt-1 block text-xs text-muted">O ACTUSProt da sua associação abre numa nova aba.</span>
          </label>
          {erro && <p className="rounded-lg bg-perigo-soft px-4 py-3 text-sm text-perigo">{erro}</p>}
          {naoCadastrado && (
            <div className="rounded-lg bg-accent-soft px-4 py-3 text-sm text-accent-escuro">
              {soDigitos(cnpj).length === 11 ? (
                <p><strong>Este CPF não está cadastrado no ACTUSProt.</strong> A avaliação com CPF é liberada pela nossa equipe{contato.whatsapp ? <>: <a className="font-medium underline" href={`https://wa.me/${contato.whatsapp}`} target="_blank" rel="noreferrer">fale no WhatsApp</a></> : contato.email ? <>: escreva para <a className="font-medium underline" href={`mailto:${contato.email}`}>{contato.email}</a></> : ''}.</p>
              ) : (
                <>
                  <p><strong>Este CNPJ não está cadastrado no ACTUSProt.</strong> Que tal conhecer o sistema? A avaliação é gratuita por 7 dias e fica pronta em minutos.</p>
                  <button type="button" onClick={pedirTeste} className="btn-destaque mt-3 w-full">Pedir um teste grátis</button>
                </>
              )}
            </div>
          )}
          {resposta && resposta.situacao !== 'ativo' && <p className="rounded-lg bg-fundo px-4 py-3 text-sm text-muted">{resposta.mensagem}</p>}
          {resposta?.situacao === 'ativo' && resposta.endereco && (
            <p className="rounded-lg bg-sucesso-soft px-4 py-3 text-sm text-sucesso">
              Abrindo o ACTUSProt{resposta.nome ? ` de ${resposta.nome}` : ''} numa nova aba. Não abriu? <a href={resposta.endereco} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium underline">Clique aqui <ExternalLink className="size-3.5" /></a>
            </p>
          )}
          <button type="submit" className="btn-primario h-11 w-full" disabled={enviando}>{enviando ? <><Loader2 className="size-4 animate-spin" /> Procurando…</> : 'Acessar'}</button>
        </form>
      </div>
    </div>
  )
}
