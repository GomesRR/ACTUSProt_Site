import { useCallback, useEffect, useState, type ReactNode } from 'react'
import {
  ArrowRight, BarChart3, Briefcase, Calculator, Camera, Car, Check, ChevronDown, Cloud, Coins, CreditCard, DatabaseBackup, Handshake, TrendingDown,
  FileText, Globe2, KeyRound, LifeBuoy, ListChecks, LockKeyhole, Mail, Menu, MessagesSquare, Radar, Receipt, Send, ShieldAlert, ShieldCheck, Smartphone, Sparkles, Trophy, UserCheck,
  Puzzle, Wallet, X, LogIn,
} from 'lucide-react'
import { Logo, LogoIcone } from './componentes/Logo'
import { FormularioAvaliacao } from './componentes/FormularioAvaliacao'
import { AcessarSistema } from './componentes/AcessarSistema'
import { PainelBoasVindas } from './componentes/PainelBoasVindas'
import { SecaoPrecos, Simulador, usePrecos } from './componentes/Precos'
import { api, contato, type Politica } from './servicos/api'

const NAV = [
  { href: '#recursos', rotulo: 'Recursos' },
  { href: '#rotina', rotulo: 'Eventos e rateio' },
  { href: '#nuvem', rotulo: 'Nuvem e segurança' },
  { href: '#como-funciona', rotulo: 'Como funciona' },
  { href: '#precos', rotulo: 'Preços', precos: true },
  { href: '#duvidas', rotulo: 'Dúvidas' },
]

/**
 * modulo: chave do módulo opcional no catálogo do gerenciador. O card só aparece se o módulo estiver ativo lá
 * (GET /publico/avaliacao/disponivel). Sem chave, é recurso do núcleo e aparece sempre.
 */
const RECURSOS: { icone: typeof Car; titulo: string; texto: string; modulo?: string; destaque?: boolean }[] = [
  { icone: Calculator, titulo: 'Cotação e adesão', texto: 'Cotação pela Tabela FIPE com os planos que aceitam o veículo, proposta para enviar e adesão que já gera a mensalidade e a vistoria.', destaque: true },
  { icone: Camera, titulo: 'Vistoria pelo celular', texto: 'O associado recebe um link e tira as fotos guiadas (lados, chassi, hodômetro, documento), com data, hora e localização. A equipe aprova e imprime o laudo.', destaque: true },
  { icone: ShieldAlert, titulo: 'Eventos com antifraude', texto: 'Colisão, roubo e furto com etapas, documentos, oficina da rede, custos e cota de participação. Alertas de evento logo após a adesão, carência, chassi repetido e mais.', destaque: true },
  { icone: Coins, titulo: 'Rateio mensal', texto: 'O custo dos eventos do mês, a taxa administrativa e o fundo de reserva divididos por cotas de FIPE, lançados nos boletos e mostrados ao associado no demonstrativo.', destaque: true },
  { icone: Car, titulo: 'Veículos e planos', texto: 'Placa, chassi, RENAVAM e FIPE; planos por faixa de FIPE com coberturas, carência, guincho, carro reserva e rastreador obrigatório.' },
  { icone: TrendingDown, titulo: 'Inadimplência automática', texto: 'Depois de X dias sem pagar, a cobertura é suspensa; a reativação pede nova vistoria. Lembretes por e-mail e WhatsApp.' },
  { icone: LifeBuoy, titulo: 'Assistência 24h', texto: 'Guincho, chaveiro, pane seca e pneu: o chamado vai para a rede credenciada, com previsão, custo e nota do prestador.' },
  { icone: Sparkles, titulo: 'IA na triagem', texto: 'Com a IA configurada pela associação, resumo do evento, documentos que faltam, sinais de fraude e análise das fotos do dano.' },
  { icone: BarChart3, titulo: 'Indicadores', texto: 'Sinistralidade, inadimplência, cancelamentos, custo médio por evento e a frota por faixa de FIPE.' },
  { icone: Trophy, titulo: 'Consultores e comissões', texto: 'Comissão na adesão e na recorrência, metas de adesões e a carteira de cada consultor.' },
  { icone: ListChecks, titulo: 'Tarefas e produtividade', texto: 'Boas-vindas automáticas ao associado novo, quadro de tarefas da equipe e pontuação por colaborador.' },
  { icone: FileText, titulo: 'Documentos e assinatura', texto: 'Termo de adesão, termo de vistoria e autorização de reparo preenchidos com os dados do veículo e assinados pelo celular.' },
  { icone: MessagesSquare, titulo: 'Chat e alertas', texto: 'Equipe conversando em tempo real e avisos de vistoria enviada, evento comunicado e cobertura suspensa.' },
  { icone: Wallet, titulo: 'Financeiro', texto: 'Mensalidades e rateios no A receber, boleto com Pix e baixa automática, contas a pagar dos eventos, nota fiscal e fluxo de caixa.', modulo: 'financeiro' },
  { icone: UserCheck, titulo: 'Área do associado', texto: 'O associado vê a carteirinha, os boletos e o rateio, comunica eventos, pede assistência 24h e faz a vistoria, com login próprio.', modulo: 'areaCliente' },
  { icone: Briefcase, titulo: 'Comercial', texto: 'Leads do CRM organizados, do primeiro contato à adesão.', modulo: 'comercial' },
  { icone: Handshake, titulo: 'Rede credenciada', texto: 'Oficinas, guinchos e vistoriadores lançam os serviços no portal próprio, com aprovação e fechamento do mês.', modulo: 'prestacao' },
  { icone: Radar, titulo: 'Rastreamento', texto: 'Rastreador de cada veículo e a lista dos que precisam pelo valor de FIPE do plano.', modulo: 'rastreamento' },
]

type ModuloCatalogo = { chave: string; nome: string; descricao?: string | null }
/**
 * Cards dos módulos: todos os módulos opcionais ativos no catálogo do gerenciador para este sistema, na ordem dele.
 * Os conhecidos usam o ícone e o texto do site (RECURSOS); um módulo novo aparece sozinho, com o nome e a descrição
 * cadastrados no gerenciador.
 */
function cardsDosModulos(modulos: ModuloCatalogo[] | null) {
  return (modulos ?? []).map((m) => RECURSOS.find((r) => r.modulo === m.chave)
    ?? { icone: Puzzle, titulo: m.nome, texto: m.descricao || 'Módulo opcional, incluído na contratação conforme a necessidade.', modulo: m.chave })
}

const SEGURANCA = [
  { icone: Globe2, titulo: 'Seu endereço próprio', texto: 'Cada associação tem o seu endereço próprio e acessa de qualquer lugar, no computador ou no celular. O associado entra pelo celular.' },
  { icone: DatabaseBackup, titulo: 'Backup todo dia', texto: 'Cópia diária de todas as informações, guardada fora do servidor e cifrada.' },
  { icone: LockKeyhole, titulo: 'Conexão protegida', texto: 'Acesso sempre por HTTPS, senhas protegidas e verificação em duas etapas para quem quiser.' },
  { icone: ShieldCheck, titulo: 'LGPD na prática', texto: 'Permissões por cargo, auditoria de quem fez o quê e ferramentas para atender os titulares de dados.' },
]

const PASSOS = [
  { n: 1, titulo: 'Peça a avaliação', texto: 'Informe só o CNPJ da associação, o e-mail e o telefone. Leva menos de um minuto.' },
  { n: 2, titulo: 'Receba o acesso', texto: 'Em alguns minutos o seu ACTUSProt está pronto na nuvem e o login chega no seu e-mail.' },
  { n: 3, titulo: 'Use por 7 dias', texto: 'Cadastre os planos, os associados e os veículos e faça as primeiras vistorias. Gostou? Contrate pelo próprio sistema, com Pix ou cartão.' },
]

const DUVIDAS = [
  { p: 'Preciso instalar alguma coisa?', r: 'Não. O ACTUSProt roda na nuvem: basta o navegador, no computador ou no celular. A sua associação ganha um endereço próprio para acessar.' },
  { p: 'Como recebo o acesso?', r: 'Assim que você pede a avaliação, o sistema é preparado automaticamente. Em alguns minutos chega no seu e-mail o endereço, o usuário (nome.sobrenome; você também pode entrar com o e-mail) e uma senha inicial, que você troca no primeiro acesso.' },
  { p: 'Preciso informar cartão de crédito?', r: 'Não. A avaliação é gratuita e sem compromisso. Pedimos apenas o CNPJ da associação, o seu nome e sobrenome, um e-mail e um telefone.' },
  { p: 'O que acontece depois dos 7 dias?', r: 'Você pode contratar pelo próprio sistema, escolhendo os módulos e pagando com Pix ou cartão, e continua com tudo o que cadastrou. Se não contratar, o acesso é encerrado e, depois de um prazo, os dados da avaliação são eliminados, como explicamos na política de privacidade.' },
  { p: 'Funciona com rateio ou com mensalidade fixa?', r: 'Com os dois. A associação escolhe nas configurações: só mensalidade fixa por faixa de FIPE, só o rateio mensal dos eventos, ou a mensalidade mais o rateio. O associado vê o demonstrativo do rateio na área dele.' },
  { p: 'A vistoria precisa de aplicativo?', r: 'Não. O associado recebe um link e faz a vistoria pelo navegador do celular, com as fotos guiadas. Cada foto guarda a data, a hora e, se o celular permitir, a localização. Se preferir, o vistoriador faz a vistoria no próprio sistema.' },
  { p: 'Consulta a FIPE automaticamente?', r: 'Sim, por marca, modelo e ano (ou pelo código FIPE), na cotação e no cadastro do veículo. A consulta pela placa depende de um serviço pago de dados veiculares e não está incluída.' },
  { p: 'Posso ter mais de uma avaliação?', r: 'A avaliação gratuita é uma por CNPJ. Se precisar de mais tempo para testar, fale com a nossa equipe.' },
  { p: 'Os dados da minha associação ficam seguros?', r: 'Sim. Cada associação tem a sua base separada (associados, veículos, fotos das vistorias e eventos), o acesso é por HTTPS e há backup diário, cifrado, fora do servidor. Os dados são seus: você pode pedir uma cópia ou a exclusão a qualquer momento.' },
]

function Secao({ id, className = '', children }: { id?: string; className?: string; children: ReactNode }) {
  return <section id={id} className={`py-20 sm:py-24 ${className}`}><div className="container-site">{children}</div></section>
}
function Titulo({ selo, titulo, texto, claro = false }: { selo: string; titulo: string; texto?: string; claro?: boolean }) {
  return (
    <div className="mx-auto mb-12 max-w-3xl text-center">
      <span className={`text-xs font-semibold tracking-[0.2em] uppercase ${claro ? 'text-accent' : 'text-accent-escuro'}`}>{selo}</span>
      <h2 className={`mt-3 text-3xl font-semibold tracking-tight sm:text-4xl ${claro ? 'text-white' : 'text-brand'}`}>{titulo}</h2>
      {texto && <p className={`mt-4 text-lg ${claro ? 'text-slate-300' : 'text-muted'}`}>{texto}</p>}
    </div>
  )
}

/*
 * Política de privacidade: a versão publicada no gerenciador (Documentos legais, depois da revisão jurídica) ou, sem
 * versão publicada, o texto abaixo. O formulário de avaliação exige o aceite da versão publicada.
 */
function Privacidade({ aberta, aoFechar }: { aberta: boolean; aoFechar: () => void }) {
  const [politica, setPolitica] = useState<Politica | null>(null)
  useEffect(() => { if (aberta) api.politica().then(setPolitica) }, [aberta])
  useEffect(() => {
    if (!aberta) return
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && aoFechar()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [aberta, aoFechar])
  if (!aberta) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4" onMouseDown={aoFechar}>
      <div role="dialog" aria-modal="true" aria-label="Política de privacidade" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white sm:rounded-2xl" onMouseDown={(e) => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between border-b border-borda bg-white px-6 py-4">
          <h2 className="text-lg font-semibold text-brand">{politica?.ok && politica.titulo ? politica.titulo : 'Política de privacidade'}</h2>
          <button type="button" onClick={aoFechar} className="rounded-md p-1.5 text-muted hover:bg-fundo" aria-label="Fechar"><X className="size-5" /></button>
        </div>
        {politica?.ok && politica.texto ? (
          <div className="px-6 py-5 text-sm leading-relaxed text-texto">
            <p className="mb-4 text-xs text-muted">Versão {politica.versao}{politica.publicadoEm ? `, publicada em ${new Date(politica.publicadoEm.replace(' ', 'T')).toLocaleDateString('pt-BR')}` : ''}.</p>
            <div className="whitespace-pre-wrap">{politica.texto}</div>
          </div>
        ) : (
          <div className="space-y-4 px-6 py-5 text-sm leading-relaxed text-texto">
            <p>Esta política explica como o ACTUSProt trata os dados pessoais informados no pedido da avaliação gratuita, conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018).</p>
            <h3 className="font-semibold text-brand">Quais dados coletamos</h3>
            <p>CNPJ da associação, e-mail e telefone (obrigatórios) e, se você quiser, o seu nome e o nome da associação. Com o CNPJ, consultamos os dados públicos da empresa na Receita Federal (razão social, situação e endereço) para preencher o cadastro. Registramos também a data e o endereço de internet (IP) do pedido, para segurança.</p>
            <h3 className="font-semibold text-brand">Para que usamos</h3>
            <p>Para criar e identificar a sua avaliação, enviar o acesso por e-mail, evitar mais de uma avaliação gratuita por CNPJ, prestar suporte e falar com você sobre a contratação. A base legal é a execução de procedimentos preliminares ao contrato, a seu pedido (art. 7º, V, da LGPD), e o legítimo interesse na prevenção de fraudes (art. 7º, IX).</p>
            <h3 className="font-semibold text-brand">Com quem compartilhamos</h3>
            <p>Não vendemos nem cedemos os seus dados. Eles ficam nos servidores que hospedam o ACTUSProt e podem ser tratados por fornecedores de infraestrutura e de envio de e-mail, só para prestar o serviço.</p>
            <h3 className="font-semibold text-brand">Por quanto tempo guardamos</h3>
            <p>Enquanto a avaliação ou a contratação estiver ativa. Se a avaliação terminar sem contratação, os dados dela são eliminados depois do prazo informado no sistema. O CNPJ fica registrado, com a data da avaliação, só para impedir uma nova avaliação gratuita com o mesmo documento.</p>
            <h3 className="font-semibold text-brand">Seus direitos</h3>
            <p>Você pode pedir a confirmação, o acesso, a correção, a portabilidade ou a eliminação dos seus dados, e informações sobre o compartilhamento (art. 18 da LGPD){contato.email ? <>, pelo e-mail <a className="text-primary-ink underline" href={`mailto:${contato.email}`}>{contato.email}</a></> : ', pelos nossos canais de atendimento'}.</p>
            <h3 className="font-semibold text-brand">Os dados da sua associação</h3>
            <p>O que você cadastrar dentro do ACTUSProt (associados, documentos, financeiro) é da sua associação. Tratamos essas informações só para operar o sistema, em base separada por associação, com acesso por HTTPS e backup diário cifrado.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function App() {
  const [menu, setMenu] = useState(false)
  const [privacidade, setPrivacidade] = useState(false)
  const [acessar, setAcessar] = useState(false)
  const fecharAcessar = useCallback(() => setAcessar(false), [])
  const [aberta, setAberta] = useState<number | null>(0)
  const [rolou, setRolou] = useState(false)
  // Módulos opcionais ativos no gerenciador; até a resposta chegar (ou se falhar), só os recursos do núcleo aparecem
  const [modulos, setModulos] = useState<ModuloCatalogo[] | null>(null)
  useEffect(() => { api.disponibilidade().then((d) => setModulos(d.modulos || [])).catch(() => setModulos([])) }, [])
  const recursos = [...RECURSOS.filter((r) => !r.modulo), ...cardsDosModulos(modulos)]
  const temModulo = recursos.some((r) => r.modulo)
  // Preços (gerenciador): sem eles (desligados nas Configurações ou sem resposta), a seção, o simulador e o link somem
  const precos = usePrecos()
  const comPrecos = Boolean(precos?.ok)
  const nav = NAV.filter((n) => !n.precos || comPrecos)
  useEffect(() => {
    const ouvir = () => setRolou(window.scrollY > 10)
    ouvir()
    window.addEventListener('scroll', ouvir, { passive: true })
    return () => window.removeEventListener('scroll', ouvir)
  }, [])
  useEffect(() => { if (window.location.hash === '#privacidade') setPrivacidade(true) }, [])

  return (
    <>
      <header className={`fixed inset-x-0 top-0 z-40 transition ${rolou || menu ? 'border-b border-borda bg-white/95 shadow-sm backdrop-blur' : 'bg-transparent'}`}>
        <div className="container-site flex h-16 items-center gap-6">
          <a href="#topo" aria-label="ACTUSProt, início"><Logo claro={!rolou && !menu} /></a>
          <nav className="ml-auto hidden items-center xl:flex">
            {nav.map((n) => <a key={n.href} href={n.href} className={`rounded-lg px-2.5 py-2 text-sm font-medium whitespace-nowrap transition ${rolou ? 'text-muted hover:text-brand' : 'text-slate-200 hover:text-white'}`}>{n.rotulo}</a>)}
          </nav>
          <button type="button" onClick={() => setAcessar(true)} className={`btn ml-auto hidden border md:inline-flex xl:ml-2 ${rolou ? 'border-borda text-brand hover:bg-fundo' : 'border-white/30 text-white hover:bg-white/10'}`}><LogIn className="size-4" /> Acesse o sistema</button>
          <a href="#avaliacao" className="btn-destaque hidden md:inline-flex">Teste grátis</a>
          <button type="button" className={`ml-auto rounded-md p-2 md:ml-0 xl:hidden ${rolou || menu ? 'text-brand' : 'text-white'}`} onClick={() => setMenu(!menu)} aria-label="Menu">{menu ? <X className="size-6" /> : <Menu className="size-6" />}</button>
        </div>
        {menu && (
          <nav className="container-site space-y-1 pb-4 xl:hidden">
            {nav.map((n) => <a key={n.href} href={n.href} onClick={() => setMenu(false)} className="block rounded-lg px-3 py-2.5 font-medium text-texto hover:bg-fundo">{n.rotulo}</a>)}
            <button type="button" onClick={() => { setMenu(false); setAcessar(true) }} className="btn mt-2 w-full border border-borda text-brand md:hidden"><LogIn className="size-4" /> Acesse o sistema</button>
            <a href="#avaliacao" onClick={() => setMenu(false)} className="btn-destaque mt-2 w-full md:hidden">Teste grátis por 7 dias</a>
          </nav>
        )}
      </header>

      <main id="topo">
        {/* Hero */}
        <section className="relative overflow-hidden bg-brand pt-32 pb-20 sm:pt-40 sm:pb-28">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(239,68,68,0.22),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(113,113,122,0.35),transparent_55%)]" aria-hidden="true" />
          <div className="container-site relative grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-12">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-medium text-accent"><Sparkles className="size-3.5" /> Gestão para associações</span>
              <h1 className="mt-6 text-4xl leading-tight font-semibold tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">Sua associação inteira, <span className="text-accent">num só lugar.</span></h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">Adesão com vistoria pelo celular, eventos com antifraude, rateio mensal, assistência 24h, cobrança e o app do associado no ACTUSProt: na nuvem, com o endereço da sua associação e os dados dos associados protegidos.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#avaliacao" className="btn-destaque h-12 px-6 text-base">Teste grátis por 7 dias <ArrowRight className="size-5" /></a>
                <a href="#recursos" className="btn h-12 border border-white/25 px-6 text-base text-white hover:bg-white/10">Conhecer os recursos</a>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
                {['Sem cartão de crédito', 'Pronto em minutos', 'Dados protegidos (LGPD)'].map((t) => <li key={t} className="flex items-center gap-2"><Check className="size-4 text-accent" />{t}</li>)}
              </ul>
            </div>
            <PainelBoasVindas />
          </div>
        </section>

        {/* Destaques */}
        <section className="border-b border-borda bg-white py-10">
          <div className="container-site grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[[Car, 'Feito para proteção veicular', 'Pensado com a rotina de associações e cooperativas de proteção.'], [Cloud, '100% na nuvem', 'Nada para instalar, acesso de qualquer lugar.'], [KeyRound, 'Cada associação isolada', 'Base de dados própria para a sua associação.'], [CreditCard, 'Contratação simples', 'Escolha os módulos e pague com Pix ou cartão.']].map(([I, t, d]) => {
              const Icone = I as typeof Car
              return (
                <div key={t as string} className="flex items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-ink"><Icone className="size-5" /></span>
                  <div><div className="font-semibold text-brand">{t as string}</div><div className="text-sm text-muted">{d as string}</div></div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Recursos */}
        <Secao id="recursos" className="bg-fundo">
          <Titulo selo="Recursos" titulo="Tudo o que a associação de proteção veicular usa no dia a dia" texto="Da cotação ao rateio: o ACTUSProt reúne o comercial, as vistorias, os eventos, a assistência e o financeiro da associação." />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {recursos.map((r) => (
              <div key={r.titulo} className={`group rounded-2xl border bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg ${r.destaque ? 'border-accent/50 ring-1 ring-accent/20' : 'border-borda'}`}>
                <div className="flex items-start justify-between">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-brand text-accent transition group-hover:bg-primary group-hover:text-brand"><r.icone className="size-5" /></span>
                  {r.modulo && <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent-escuro">módulo</span>}
                  {r.destaque && <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-medium text-primary-ink">destaque</span>}
                </div>
                <h3 className="mt-4 font-semibold text-brand">{r.titulo}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{r.texto}</p>
              </div>
            ))}
          </div>
          {temModulo && <p className="mt-8 text-center text-sm text-muted">Os módulos marcados podem ser incluídos na contratação, conforme a necessidade da associação.</p>}
        </Secao>

        {/* Rotina da associação */}
        <Secao id="rotina" className="bg-white">
          <Titulo selo="Rotina da associação" titulo="Menos planilha e WhatsApp solto, mais controle sobre os eventos" texto="O sistema guia a vistoria, organiza os eventos, calcula o rateio e acompanha quem está com a proteção em dia." />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {[
              { icone: ShieldAlert, titulo: 'Da adesão ao evento resolvido', itens: [
                'Adesão com a vistoria por link: a cobertura começa com as fotos aprovadas',
                'Evento comunicado pelo associado, com os documentos e as fotos do dano',
                'Alertas antifraude em cada evento: adesão recente, carência, chassi repetido',
                'Oficina da rede, custos lançados em A pagar e cota de participação cobrada',
                'Assistência 24h acionada pelo celular, com a rede credenciada',
              ], nota: 'Os fluxos e os modelos podem ser ajustados ao jeito da sua associação.' },
              { icone: Receipt, titulo: 'Rateio e cobrança sob controle', itens: [
                'Mensalidade fixa por faixa de FIPE, rateio mensal ou os dois',
                'Rateio calculado por cotas de FIPE, com taxa administrativa e fundo de reserva',
                'Boleto com Pix gerado pelo sistema e baixa automática quando o associado paga',
                'Cobertura suspensa sozinha na inadimplência e reativada com nova vistoria',
                'Sinistralidade, inadimplência e fluxo de caixa num só painel',
              ], nota: 'Cobrança pelo Asaas, configurada nas integrações da associação (módulo Financeiro).' },
            ].map((b) => (
              <div key={b.titulo} className="rounded-2xl border border-borda bg-fundo p-7 sm:p-8">
                <div className="flex items-center gap-3">
                  <span className="flex size-12 items-center justify-center rounded-xl bg-brand text-accent"><b.icone className="size-6" /></span>
                  <h3 className="text-xl font-semibold text-brand">{b.titulo}</h3>
                </div>
                <ul className="mt-6 space-y-3">
                  {b.itens.map((t) => <li key={t} className="flex items-start gap-3 text-texto"><Check className="mt-0.5 size-5 shrink-0 text-sucesso" /><span>{t}</span></li>)}
                </ul>
                <p className="mt-6 text-sm text-muted">{b.nota}</p>
              </div>
            ))}
          </div>
        </Secao>

        {/* Nuvem e segurança */}
        <Secao id="nuvem" className="bg-brand-escuro">
          <Titulo claro selo="Nuvem e segurança" titulo="Acesse de qualquer lugar, com tranquilidade" texto="Dados de associados, veículos e eventos exigem cuidado. A estrutura do ACTUSProt foi pensada para isso desde o primeiro dia." />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SEGURANCA.map((s) => (
              <div key={s.titulo} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <span className="flex size-11 items-center justify-center rounded-xl bg-accent/15 text-accent"><s.icone className="size-5" /></span>
                <h3 className="mt-4 font-semibold text-white">{s.titulo}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-300">{s.texto}</p>
              </div>
            ))}
          </div>
        </Secao>

        {/* Como funciona */}
        <Secao id="como-funciona" className="bg-white">
          <Titulo selo="Como funciona" titulo="Em poucos minutos você está usando" />
          <div className="relative grid gap-8 md:grid-cols-3">
            <div className="absolute top-7 right-[16%] left-[16%] hidden h-px bg-gradient-to-r from-accent/0 via-accent/60 to-accent/0 md:block" aria-hidden="true" />
            {PASSOS.map((p) => (
              <div key={p.n} className="relative text-center">
                <span className="relative mx-auto flex size-14 items-center justify-center rounded-full bg-brand font-brand text-2xl text-accent ring-8 ring-white">{p.n}</span>
                <h3 className="mt-5 text-lg font-semibold text-brand">{p.titulo}</h3>
                <p className="mx-auto mt-2 max-w-xs text-muted">{p.texto}</p>
              </div>
            ))}
          </div>
        </Secao>

        {/* Preços: depois das vantagens */}
        {comPrecos && precos && <SecaoPrecos p={precos} nucleoInclui={RECURSOS.filter((r) => !r.modulo).map((r) => r.titulo)} />}

        {/* Avaliação */}
        <Secao id="avaliacao" className="bg-fundo">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <div className="lg:pt-6">
              <span className="text-xs font-semibold tracking-[0.2em] text-accent-escuro uppercase">Avaliação gratuita</span>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-brand sm:text-4xl">Teste o ACTUSProt por 7 dias, sem pagar nada</h2>
              <p className="mt-4 text-lg text-muted">Peça agora e receba no seu e-mail o acesso ao seu ACTUSProt, já pronto na nuvem.</p>
              <ul className="mt-8 space-y-4">
                {[
                  [Send, 'Pronto em minutos', 'Sem formulários longos e sem esperar alguém liberar.'],
                  [Smartphone, 'Recursos completos', 'Cotação, vistoria, eventos, rateio, assistência 24h, financeiro e área do associado.'],
                  [Mail, 'Acesso pelo e-mail', 'O login é o seu e-mail; a senha inicial você troca no primeiro acesso.'],
                  [ShieldCheck, 'Sem compromisso', 'Sem cartão. Para continuar, é só contratar pelo próprio sistema.'],
                ].map(([I, t, d]) => {
                  const Icone = I as typeof Send
                  return (
                    <li key={t as string} className="flex items-start gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-primary-ink shadow-sm"><Icone className="size-4.5" /></span>
                      <div><div className="font-semibold text-brand">{t as string}</div><div className="text-sm text-muted">{d as string}</div></div>
                    </li>
                  )
                })}
              </ul>
            </div>
            <div className="min-w-0 rounded-2xl border border-borda bg-white p-5 shadow-xl sm:p-8">
              <h3 className="text-xl font-semibold text-brand">Peça a sua avaliação</h3>
              <p className="mt-1 mb-6 text-sm text-muted">Só CNPJ, nome e sobrenome, e-mail e telefone são obrigatórios.</p>
              <FormularioAvaliacao aoAbrirPrivacidade={() => setPrivacidade(true)} />
            </div>
          </div>
        </Secao>

        {/* Dúvidas */}
        <Secao id="duvidas" className="bg-white">
          <Titulo selo="Dúvidas" titulo="Perguntas frequentes" />
          <div className="mx-auto max-w-3xl divide-y divide-borda rounded-2xl border border-borda">
            {DUVIDAS.map((d, i) => (
              <div key={d.p}>
                <button type="button" onClick={() => setAberta(aberta === i ? null : i)} className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-medium text-brand" aria-expanded={aberta === i}>
                  {d.p}<ChevronDown className={`size-5 shrink-0 text-muted transition ${aberta === i ? 'rotate-180' : ''}`} />
                </button>
                {aberta === i && <p className="-mt-1 px-6 pb-5 leading-relaxed text-muted">{d.r}</p>}
              </div>
            ))}
          </div>
        </Secao>

        {/* Simulador: no fim da página */}
        {comPrecos && precos && <Simulador p={precos} />}

        {/* Chamada final */}
        <section className="bg-brand py-16">
          <div className="container-site flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
            <div>
              <h2 className="text-2xl font-semibold text-white sm:text-3xl">Pronto para organizar a sua associação?</h2>
              <p className="mt-2 text-slate-300">Comece hoje. Em alguns minutos o seu ACTUSProt está no ar.</p>
            </div>
            <a href="#avaliacao" className="btn-destaque h-12 px-6 text-base">Teste grátis por 7 dias <ArrowRight className="size-5" /></a>
          </div>
        </section>
      </main>

      <footer className="bg-brand-escuro py-10 text-sm text-slate-400">
        <div className="container-site flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <div className="flex items-center gap-3 text-white"><LogoIcone className="h-6 w-auto text-accent" /><span className="font-brand text-lg tracking-wide">ACTUS<span className="ml-1 align-super font-sans text-[9px] font-semibold tracking-[0.2em] text-accent">FIT</span></span></div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {contato.email && <a href={`mailto:${contato.email}`} className="flex items-center gap-1.5 hover:text-white"><Mail className="size-4" /> {contato.email}</a>}
            {contato.whatsapp && <a href={`https://wa.me/${contato.whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white"><MessagesSquare className="size-4" /> WhatsApp</a>}
            <button type="button" onClick={() => setPrivacidade(true)} className="hover:text-white">Política de privacidade</button>
          </div>
          <span>© {new Date().getFullYear()} ACTUSProt. Gestão para associações de proteção veicular.</span>
        </div>
      </footer>

      <Privacidade aberta={privacidade} aoFechar={() => setPrivacidade(false)} />
      <AcessarSistema aberto={acessar} aoFechar={fecharAcessar} />
    </>
  )
}
