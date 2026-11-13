/*
 * Avaliação gratuita: o pedido vai para a API do gerenciador de licenças (rota pública /publico/avaliacao), que cria
 * o cadastro e prepara o ACTUSProt na nuvem sozinha. O acesso (endereço, login e senha) chega por e-mail.
 * O gerenciador atende o ACTUSPro e o ACTUSProt: toda chamada manda X-Produto: actusprot (o proxy da nuvem também põe).
 */
export const PRODUTO = 'actusprot'
const API = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, '') || '/api'

/** modulos: os módulos opcionais ativos no catálogo do gerenciador (o site só mostra estes) */
export interface Disponibilidade { ok: boolean; motivo?: string; dias: number; modulos?: { chave: string; nome: string; descricao?: string | null }[] }
/** escritorio: nome da empresa (o campo do gerenciador manteve o nome do ACTUSPro; aqui é o nome da associação) */
export interface PedidoAvaliacao { cnpj: string; email: string; telefone: string; nome?: string; escritorio?: string; site?: string; aceitePolitica?: number }
/** Política de Privacidade publicada no gerenciador (ok: false = nenhuma versão publicada; vale o texto do site) */
export interface Politica { ok: boolean; id?: number; versao?: number; titulo?: string; texto?: string; publicadoEm?: string }
export interface RespostaAvaliacao { ok: boolean; subdominio?: string; endereco?: string; dias?: number; email?: string }

export interface RespostaAcesso { situacao: 'ativo' | 'preparando' | 'inativo'; endereco?: string; nome?: string; mensagem?: string }

/** Preços públicos (GET /publico/precos): núcleo, módulos ativos, a campanha vigente mais vantajosa e os treinamentos */
export interface FaixaCampanha { meses: number; tipo: 'desconto' | 'valorNucleo'; valor: number; nucleoMensal: number; pacoteMensal: number }
export interface Precos {
  ok: boolean
  nucleo: number
  modulos: { chave: string; nome: string; descricao: string | null; valorMensal: number }[]
  campanha: { nome: string; descricao: string | null; fim: string | null; faixas: FaixaCampanha[] } | null
  adesao: number
  treinamentos: { id: number; nome: string; descricao: string | null; valor: number; inclusoAdesao: boolean; inclui: number[] }[]
  pacoteMensal: number
  /** Card de treinamento na seção Preços (o simulador sempre oferece os treinamentos) */
  mostrarTreinamentos?: boolean
  descontoPix: number
  dias: number
}

export class ErroApi extends Error {
  constructor(mensagem: string, public status: number, public erros: Record<string, string> = {}, public codigo?: string) { super(mensagem) }
}

async function chamar<T>(caminho: string, init?: RequestInit): Promise<T> {
  let resp: Response
  try {
    resp = await fetch(API + caminho, { ...init, headers: { 'Content-Type': 'application/json', 'X-Produto': PRODUTO, ...(init?.headers || {}) } })
  } catch {
    throw new ErroApi('Não foi possível falar com o servidor agora. Confira a sua internet e tente de novo.', 0)
  }
  const dados = await resp.json().catch(() => ({}))
  if (!resp.ok) throw new ErroApi(dados.mensagem || 'Não foi possível concluir agora. Tente de novo em instantes.', resp.status, dados.erros || {}, dados.codigo)
  return dados as T
}

/*
 * O catálogo de módulos do gerenciador é compartilhado (chaves iguais nos sistemas). Os nomes e as descrições de lá
 * podem falar de outro segmento; no site do ACTUSProt valem estes, pela chave.
 */
const MODULOS_FIT: Record<string, { nome: string; descricao: string }> = {
  financeiro: { nome: 'Financeiro', descricao: 'Mensalidades e rateios, boleto com Pix, a receber e a pagar, nota fiscal e fluxo de caixa.' },
  areaCliente: { nome: 'Área do associado', descricao: 'Carteirinha, boletos, rateio, eventos, assistência 24h e vistoria pelo celular.' },
  comercial: { nome: 'Comercial', descricao: 'Leads do CRM organizados, do primeiro contato à adesão.' },
  prestacao: { nome: 'Rede credenciada', descricao: 'Oficinas, guinchos e vistoriadores lançam os serviços no portal próprio.' },
  rastreamento: { nome: 'Rastreamento', descricao: 'Rastreador de cada veículo e a obrigatoriedade pelo valor de FIPE.' },
}
const nomeFit = <T extends { chave: string; nome: string }>(m: T): T => (MODULOS_FIT[m.chave] ? { ...m, nome: MODULOS_FIT[m.chave].nome } : m)

// Uma consulta só por página (o formulário e a lista de recursos usam a mesma resposta)
let disponibilidade: Promise<Disponibilidade> | null = null
let precos: Promise<Precos> | null = null
let politica: Promise<Politica> | null = null

export const api = {
  disponibilidade: () => (disponibilidade ??= chamar<Disponibilidade>('/publico/avaliacao/disponivel')
    .then((d) => ({ ...d, modulos: d.modulos?.map(nomeFit) }))
    .catch((e) => { disponibilidade = null; throw e })),
  precos: () => (precos ??= chamar<Precos>('/publico/precos')
    .then((p) => ({ ...p, modulos: (p.modulos || []).map((m) => (MODULOS_FIT[m.chave] ? { ...m, ...MODULOS_FIT[m.chave] } : m)) }))
    .catch((e) => { precos = null; throw e })),
  /** Sem resposta do servidor, vale o texto do site (ok: false) */
  politica: (atualizar = false) => {
    if (atualizar) politica = null
    return (politica ??= chamar<Politica>('/publico/politica-privacidade').catch(() => { politica = null; return { ok: false } }))
  },
  pedirAvaliacao: (p: PedidoAvaliacao) => chamar<RespostaAvaliacao>('/publico/avaliacao', { method: 'POST', body: JSON.stringify(p) }),
  /** Endereço do ACTUSProt da associação pelo CNPJ ("Acesse o sistema"); 404 NAO_CADASTRADO se não houver */
  acesso: (cnpj: string) => chamar<RespostaAcesso>(`/publico/acesso?cnpj=${encodeURIComponent(cnpj)}`),
}

export const contato = {
  email: (import.meta.env.VITE_CONTATO_EMAIL as string | undefined) || '',
  whatsapp: ((import.meta.env.VITE_CONTATO_WHATSAPP as string | undefined) || '').replace(/\D/g, ''),
}
