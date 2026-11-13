import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, BadgePercent, Calculator, Check, GraduationCap, Puzzle, Sparkles, Tag } from 'lucide-react'
import { api, type FaixaCampanha, type Precos } from '../servicos/api'

/*
 * Seção "Preços" e simulador do site. Os valores vêm do gerenciador (GET /publico/precos) e a conta é a mesma da tela
 * de assinatura do ACTUSProt: mensalidade = núcleo + módulos escolhidos; a faixa da campanha dá desconto (%) em tudo
 * ou troca o valor do núcleo; adesão = uma mensalidade do núcleo pelo valor cheio; treinamentos à parte (os inclusos
 * na adesão não são cobrados). Só uma campanha aparece: a vigente mais vantajosa, escolhida pelo gerenciador.
 */

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const arred = (n: number) => Math.round(n * 100) / 100
const prazo = (m: number) => (m === 1 ? '1 mês' : m % 12 === 0 ? (m === 12 ? '12 meses (1 ano)' : `${m} meses (${m / 12} anos)`) : `${m} meses`)
const dataBr = (d: string) => d.split('-').reverse().join('/')

/** Mesma conta do gerenciador (servicos/precosSite.js, mensalidade) */
export function mensalidade(nucleo: number, modulos: { valorMensal: number }[], faixa: FaixaCampanha | null) {
  const n = faixa && faixa.tipo === 'valorNucleo' ? faixa.valor : nucleo
  const fator = faixa && faixa.tipo === 'desconto' ? (100 - faixa.valor) / 100 : 1
  return arred(arred(n * fator) + modulos.reduce((s, m) => s + arred(m.valorMensal * fator), 0))
}

/** Preços do gerenciador; null enquanto carrega, e { ok: false } quando desligados ou sem resposta */
export function usePrecos() {
  const [p, setP] = useState<Precos | null>(null)
  useEffect(() => { api.precos().then(setP).catch(() => setP({ ok: false } as Precos)) }, [])
  return p
}

/** Treinamentos mostrados: todos ou, com o card de treinamento desligado no gerenciador, só os inclusos na adesão */
const treinamentosVisiveis = (p: Precos) => (p.mostrarTreinamentos === false ? p.treinamentos.filter((t) => t.inclusoAdesao) : p.treinamentos)

/** A faixa com a menor mensalidade do pacote completo (a "melhor oferta" da campanha) */
const melhorFaixa = (p: Precos) => p.campanha?.faixas.reduce((a, b) => (b.pacoteMensal < a.pacoteMensal ? b : a)) || null

/** Desconto da faixa sobre a tabela, para o selo ("até 30% off") */
const pctOff = (de: number, por: number) => (de > 0 ? Math.round((1 - por / de) * 100) : 0)

export function SecaoPrecos({ p, nucleoInclui }: { p: Precos; nucleoInclui: string[] }) {
  const melhor = melhorFaixa(p)
  const treinamentos = treinamentosVisiveis(p)
  const nucleoPor = melhor ? melhor.nucleoMensal : p.nucleo
  const off = melhor ? pctOff(p.pacoteMensal, melhor.pacoteMensal) : 0
  const fatorMod = melhor && melhor.tipo === 'desconto' ? (100 - melhor.valor) / 100 : 1
  return (
    <section id="precos" className="relative overflow-clip bg-brand-escuro py-20 sm:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(239,68,68,0.18),transparent_60%)]" aria-hidden="true" />
      <div className="container-site relative">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <span className="text-xs font-semibold tracking-[0.2em] text-accent uppercase">Preços</span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Tudo isso por um valor que cabe na associação</h2>
          <p className="mt-4 text-lg text-slate-300">Comece pelo núcleo, que já resolve a rotina, e inclua só os módulos de que precisar. Sem fidelidade escondida, sem surpresa na fatura.</p>
        </div>

        {p.campanha && melhor && (
          <div className="mx-auto mb-10 flex max-w-4xl flex-col items-center gap-3 rounded-2xl border border-accent/40 bg-accent/10 px-5 py-4 text-center sm:flex-row sm:text-left">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-brand-escuro"><BadgePercent className="size-6" /></span>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-white">{p.campanha.nome}{off > 0 && <span className="ml-2 rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-brand-escuro">até {off}% off</span>}</div>
              <div className="text-sm text-slate-300">{p.campanha.descricao || `Contratando por ${prazo(melhor.meses)}, a mensalidade fica bem menor.`}{p.campanha.fim && <> Válida até {dataBr(p.campanha.fim)}.</>}</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
          {/* Núcleo */}
          <div className="relative flex min-w-0 flex-col rounded-3xl bg-white p-5 shadow-2xl ring-1 ring-accent/30 sm:p-9 lg:sticky lg:top-24">
            <span className="absolute -top-3 left-7 inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-brand-escuro"><Sparkles className="size-3.5" /> O essencial da associação</span>
            <h3 className="text-xl font-semibold text-brand">Núcleo ACTUSProt</h3>
            <div className="mt-4 flex flex-wrap items-end gap-x-3 gap-y-1">
              {melhor && nucleoPor < p.nucleo && <span className="text-lg text-muted line-through">{brl(p.nucleo)}</span>}
              <span className="font-brand text-4xl leading-none text-brand sm:text-5xl">{brl(nucleoPor)}</span>
              <span className="pb-1 text-muted">/mês</span>
            </div>
            <p className="mt-2 text-sm text-muted">{melhor && nucleoPor < p.nucleo ? `Na campanha, contratando por ${prazo(melhor.meses)}. Sem campanha: ${brl(p.nucleo)}/mês.` : 'Mensalidade do núcleo, com os recursos abaixo.'}</p>
            <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {nucleoInclui.map((t) => <li key={t} className="flex items-start gap-2 text-sm text-texto"><Check className="mt-0.5 size-4 shrink-0 text-sucesso" />{t}</li>)}
            </ul>
            <div className="pt-8">
              <div className="flex flex-col gap-3 sm:flex-row">
                <a href="#avaliacao" className="btn-destaque h-auto min-h-12 flex-1 py-2 text-base whitespace-normal">Teste grátis por {p.dias || 7} dias <ArrowRight className="size-5" /></a>
                <a href="#simulador" className="btn-contorno h-auto min-h-12 flex-1 py-2 text-base whitespace-normal"><Calculator className="size-5" /> Simular o meu valor</a>
              </div>
              <p className="mt-3 text-xs text-muted">Adesão na contratação: {brl(p.adesao)} (uma mensalidade do núcleo){p.descontoPix > 0 ? `. No Pix, ${p.descontoPix}% de desconto.` : '.'}</p>
            </div>
          </div>

          {/* Módulos e treinamentos */}
          <div className="flex min-w-0 flex-col gap-6">
            {p.modulos.length > 0 && (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-8">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-white"><Puzzle className="size-5 text-accent" /> Módulos opcionais</h3>
                <p className="mt-1 text-sm text-slate-300">Inclua quando precisar, na contratação ou depois.</p>
                <ul className="mt-5 divide-y divide-white/10">
                  {p.modulos.map((m) => {
                    const por = arred(m.valorMensal * fatorMod)
                    return (
                      <li key={m.chave} className="flex items-center justify-between gap-4 py-3">
                        <div className="min-w-0">
                          <div className="font-medium text-white">{m.nome}</div>
                          {m.descricao && <div className="truncate text-xs text-slate-400" title={m.descricao}>{m.descricao}</div>}
                        </div>
                        <div className="shrink-0 text-right">
                          {por < m.valorMensal && <div className="text-xs text-slate-400 line-through">{brl(m.valorMensal)}</div>}
                          <div className="font-semibold whitespace-nowrap text-accent">{m.valorMensal > 0 ? <>+ {brl(por)}<span className="text-xs font-normal text-slate-400">/mês</span></> : 'Incluso'}</div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
            {p.campanha && p.campanha.faixas.length > 1 && (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-8">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-white"><Tag className="size-5 text-accent" /> Prazos da campanha</h3>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {p.campanha.faixas.map((f) => (
                    <li key={f.meses} className={`rounded-xl px-4 py-3 ${f === melhor ? 'bg-accent text-brand-escuro' : 'bg-white/5 text-white'}`}>
                      <div className="text-sm font-semibold">{prazo(f.meses)}</div>
                      <div className={`text-xs ${f === melhor ? 'text-brand-escuro/80' : 'text-slate-300'}`}>{f.tipo === 'desconto' ? `${f.valor}% de desconto em tudo` : `núcleo por ${brl(f.valor)}/mês`}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {treinamentos.length > 0 && (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5 sm:p-8">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-white"><GraduationCap className="size-5 text-accent" /> Treinamento da equipe</h3>
                <ul className="mt-4 space-y-2 text-sm">
                  {treinamentos.map((t) => (
                    <li key={t.id} className="flex items-center justify-between gap-4 text-slate-200">
                      <span className="min-w-0">{t.nome}</span>
                      <span className="shrink-0 font-medium whitespace-nowrap text-white">{t.inclusoAdesao ? <span className="text-accent">incluso na adesão</span> : brl(t.valor)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

/** Opção de prazo do simulador: sem campanha (tabela) ou uma faixa da campanha */
type Opcao = { id: string; rotulo: string; detalhe: string; faixa: FaixaCampanha | null; meses: number | null }

export function Simulador({ p }: { p: Precos }) {
  const opcoes = useMemo<Opcao[]>(() => [
    ...(p.campanha?.faixas || []).map((f) => ({ id: `f${f.meses}`, rotulo: prazo(f.meses), detalhe: f.tipo === 'desconto' ? `${f.valor}% de desconto (${p.campanha!.nome})` : `núcleo por ${brl(f.valor)}/mês (${p.campanha!.nome})`, faixa: f, meses: f.meses })),
    { id: 'tabela', rotulo: 'Mensal, sem campanha', detalhe: 'Preço de tabela', faixa: null, meses: null },
  ], [p])
  const melhor = melhorFaixa(p)
  const [opcao, setOpcao] = useState(melhor ? `f${melhor.meses}` : 'tabela')
  const [mods, setMods] = useState<Set<string>>(new Set())
  const [trs, setTrs] = useState<Set<number>>(new Set())
  const escolhida = opcoes.find((o) => o.id === opcao) || opcoes[opcoes.length - 1]

  const alternar = <T,>(set: Set<T>, v: T) => { const n = new Set(set); if (n.has(v)) n.delete(v); else n.add(v); return n }
  const escolhidos = p.modulos.filter((m) => mods.has(m.chave))
  const mensal = mensalidade(p.nucleo, escolhidos, escolhida.faixa)
  const tabela = mensalidade(p.nucleo, escolhidos, null)
  // Treinamentos: o mais completo cobre os que ele inclui; os inclusos na adesão não são cobrados
  const treinamentosSimulador = treinamentosVisiveis(p)
  const porId = new Map(p.treinamentos.map((t) => [t.id, t]))
  const cobertos = new Set<number>()
  const fila = [...trs].flatMap((id) => porId.get(id)?.inclui || [])
  while (fila.length) { const x = fila.pop()!; if (!cobertos.has(x)) { cobertos.add(x); fila.push(...(porId.get(x)?.inclui || [])) } }
  const cobrados = [...trs].filter((id) => !cobertos.has(id)).map((id) => porId.get(id)!).filter(Boolean)
  const treinamento = arred(cobrados.reduce((s, t) => s + (t.inclusoAdesao ? 0 : t.valor), 0))
  const hoje = arred(p.adesao + treinamento)

  return (
    <section id="simulador" className="bg-fundo py-20 sm:py-24">
      <div className="container-site">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <span className="text-xs font-semibold tracking-[0.2em] text-accent-escuro uppercase">Simulador</span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-brand sm:text-4xl">Quanto a sua associação pagaria?</h2>
          <p className="mt-4 text-lg text-muted">Escolha o prazo, os módulos e o treinamento, como na tela de contratação do sistema.</p>
        </div>
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="min-w-0 space-y-6 rounded-3xl border border-borda bg-white p-4 sm:p-8">
            <fieldset>
              <legend className="mb-3 font-semibold text-brand">1. Prazo</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {opcoes.map((o) => (
                  <label key={o.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${opcao === o.id ? 'border-primary bg-primary-soft ring-1 ring-primary' : 'border-borda hover:bg-fundo'}`}>
                    <input type="radio" name="prazo" className="mt-1 accent-primary" checked={opcao === o.id} onChange={() => setOpcao(o.id)} />
                    <span className="min-w-0"><span className="block font-medium text-texto">{o.rotulo}{o.faixa && o.faixa === melhor && <span className="ml-2 inline-block rounded-full bg-accent px-2 py-0.5 align-middle text-[11px] font-semibold whitespace-nowrap text-brand-escuro">melhor preço</span>}</span><span className="block text-xs text-muted">{o.detalhe}</span></span>
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="mb-3 font-semibold text-brand">2. Módulos</legend>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3 rounded-xl bg-fundo px-4 py-3 text-sm"><span className="flex items-center gap-2 font-medium text-texto"><Check className="size-4 text-sucesso" /> Núcleo ACTUSProt</span><span className="text-muted">sempre incluso</span></div>
                {p.modulos.map((m) => (
                  <label key={m.chave} className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm transition ${mods.has(m.chave) ? 'border-primary bg-primary-soft' : 'border-borda hover:bg-fundo'}`}>
                    <span className="flex min-w-0 items-center gap-3"><input type="checkbox" className="accent-primary" checked={mods.has(m.chave)} onChange={() => setMods(alternar(mods, m.chave))} /><span className="font-medium text-texto">{m.nome}</span></span>
                    <span className="shrink-0 whitespace-nowrap text-muted">+ {brl(mensalidade(0, [m], escolhida.faixa && escolhida.faixa.tipo === 'desconto' ? escolhida.faixa : null))}/mês</span>
                  </label>
                ))}
              </div>
            </fieldset>
            {treinamentosSimulador.length > 0 && (
              <fieldset>
                <legend className="mb-3 font-semibold text-brand">3. Treinamento <span className="font-normal text-muted">(opcional)</span></legend>
                <div className="space-y-2">
                  {treinamentosSimulador.map((t) => {
                    const coberto = cobertos.has(t.id)
                    return (
                      <label key={t.id} className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm transition ${trs.has(t.id) ? 'border-primary bg-primary-soft' : 'border-borda hover:bg-fundo'} ${coberto ? 'opacity-60' : ''}`}>
                        <span className="flex min-w-0 items-center gap-3"><input type="checkbox" className="accent-primary" checked={trs.has(t.id) || coberto} disabled={coberto} onChange={() => setTrs(alternar(trs, t.id))} /><span className="font-medium text-texto">{t.nome}</span></span>
                        <span className="max-w-[45%] shrink-0 text-right text-muted sm:max-w-none sm:whitespace-nowrap">{coberto ? 'já incluso' : t.inclusoAdesao ? 'incluso na adesão' : brl(t.valor)}</span>
                      </label>
                    )
                  })}
                </div>
              </fieldset>
            )}
          </div>

          <div className="min-w-0 rounded-3xl bg-brand p-5 text-white shadow-2xl sm:p-8 lg:sticky lg:top-24">
            <div className="text-sm text-slate-300">Mensalidade</div>
            <div className="mt-1 flex flex-wrap items-end gap-x-3">
              {mensal < tabela && <span className="text-lg text-slate-400 line-through">{brl(tabela)}</span>}
              <span className="font-brand text-4xl leading-none text-accent sm:text-5xl">{brl(mensal)}</span>
              <span className="pb-1 text-slate-300">/mês</span>
            </div>
            {mensal < tabela && <div className="mt-2 inline-flex rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-accent">Economia de {brl(arred((tabela - mensal) * (escolhida.meses || 1)))}{escolhida.meses ? ` em ${prazo(escolhida.meses)}` : ''}</div>}
            <dl className="mt-6 space-y-3 border-t border-white/10 pt-6 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-slate-300">Núcleo</dt><dd>{brl(mensalidade(p.nucleo, [], escolhida.faixa))}</dd></div>
              {escolhidos.map((m) => <div key={m.chave} className="flex justify-between gap-4"><dt className="text-slate-300">{m.nome}</dt><dd>{brl(mensalidade(0, [m], escolhida.faixa && escolhida.faixa.tipo === 'desconto' ? escolhida.faixa : null))}</dd></div>)}
              {escolhida.meses && <div className="flex justify-between gap-4 border-t border-white/10 pt-3 font-medium"><dt>Total em {prazo(escolhida.meses)}</dt><dd>{brl(arred(mensal * escolhida.meses))}</dd></div>}
            </dl>
            <dl className="mt-6 space-y-3 rounded-2xl bg-white/5 p-4 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-slate-300">Adesão (uma vez)</dt><dd>{brl(p.adesao)}</dd></div>
              {treinamento > 0 && <div className="flex justify-between gap-4"><dt className="text-slate-300">Treinamento</dt><dd>{brl(treinamento)}</dd></div>}
              <div className="flex justify-between gap-4 border-t border-white/10 pt-3 font-semibold"><dt>Na contratação</dt><dd className="text-accent">{brl(hoje)}</dd></div>
            </dl>
            <p className="mt-4 text-xs text-slate-400">Valores de hoje, para referência. A mensalidade começa a ser cobrada depois da adesão paga{p.descontoPix > 0 ? `; no Pix, ${p.descontoPix}% de desconto` : ''}.</p>
            <a href="#avaliacao" className="btn-destaque mt-6 h-12 w-full text-base">Começar o teste grátis <ArrowRight className="size-5" /></a>
          </div>
        </div>
      </div>
    </section>
  )
}
