import { Bell, Cake } from 'lucide-react'

/** Ilustração da página inicial: o painel de boas-vindas de uma gestora de associação fictícia (montado em HTML, não é captura de tela) */
export function PainelBoasVindas() {
  const agenda = [['08:30', 'Vistoria de entrada — Beatriz', 'bg-amber-400'], ['10:00', 'Evento EV-0412 — oficina', 'bg-emerald-400'], ['16:00', 'Visita de venda — Lucas', 'bg-sky-400']]
  return (
    <div className="relative mx-auto w-full max-w-xl lg:max-w-[38rem]">
      <div className="absolute -inset-6 rounded-[2rem] bg-accent/20 blur-3xl" aria-hidden="true" />
      <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-white shadow-2xl" role="img" aria-label="Painel do ACTUSProt com as boas-vindas à gestora, os números da proteção, a agenda do dia e os avisos">
        <div className="flex items-center gap-2 border-b border-borda bg-fundo px-4 py-3" aria-hidden="true">
          <span className="size-3 rounded-full bg-red-300" /><span className="size-3 rounded-full bg-amber-300" /><span className="size-3 rounded-full bg-emerald-300" />
          <span className="ml-3 truncate rounded-md bg-white px-3 py-1 text-xs text-muted">suaassociacao.actusprot.com.br</span>
        </div>
        <div className="space-y-5 p-5 sm:p-6" aria-hidden="true">
          <div className="flex items-center justify-between"><span className="text-lg font-semibold text-brand">Bom dia, Carla</span><Bell className="size-5 text-muted" /></div>
          <div className="grid grid-cols-3 gap-3">
            {[['Veículos protegidos', '1.284', 'text-primary-ink'], ['Sinistralidade', '58%', 'text-accent-escuro'], ['Em dia', '94%', 'text-sucesso']].map(([r, v, c]) => (
              <div key={r} className="rounded-xl border border-borda p-3 sm:p-4"><div className="text-[11px] text-muted sm:text-xs">{r}</div><div className={`mt-1 text-2xl font-semibold ${c}`}>{v}</div></div>
            ))}
          </div>
          <div className="rounded-xl border border-borda">
            <div className="border-b border-borda px-4 py-2.5 text-sm font-semibold text-texto">Agenda de hoje</div>
            {agenda.map(([h, t, c]) => (
              <div key={t} className="flex items-center justify-between px-4 py-2.5 text-sm"><span className="flex items-center gap-2"><span className={`size-2 rounded-full ${c}`} />{t}</span><span className="text-muted tabular-nums">{h}</span></div>
            ))}
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-primary-soft px-4 py-3 text-sm text-primary-ink"><Cake className="size-5" /> 2 associados fazem aniversário hoje</div>
        </div>
      </div>
    </div>
  )
}
