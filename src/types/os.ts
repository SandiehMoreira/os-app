export type DocumentoTipo = "CPF" | "RG";

export interface Customer {
  id: string;
  storeId: string;
  nome: string;
  telefone: string;
  telefoneBusca: string; // apenas dígitos, para busca
  documento: {
    tipo: DocumentoTipo;
    numero: string;
  };
  endereco?: string;
  email?: string;
  createdAt: number;
}

export interface Model {
  id: string;
  nome: string;
  capacidades: string[];
  hasFaceId: boolean;
  hasTouchId: boolean;
  hasHomeButton: boolean;
}

export interface Brand {
  id: string;
  storeId: string;
  nome: string;
}

export const CORES_APARELHO = [
  "Preto",
  "Branco",
  "Prata",
  "Cinza",
  "Grafite",
  "Dourado",
  "Azul",
  "Verde",
  "Vermelho",
  "Roxo",
  "Rosa",
  "Titânio",
] as const;

export const ACESSORIOS = [
  "Carregador",
  "Cabo",
  "Capinha",
  "Chip",
  "Cartão de memória",
  "Fone",
] as const;

export type Acessorio = (typeof ACESSORIOS)[number];

export type ChecklistStatus = "ok" | "nao_ok";

export const CHECKLIST_ITEMS = [
  { key: "tela_toque", label: "Tela (toque)" },
  { key: "tela_imagem", label: "Tela (imagem/manchas)" },
  { key: "camera_traseira", label: "Câmera traseira" },
  { key: "camera_frontal", label: "Câmera frontal" },
  { key: "alto_falante", label: "Alto-falante" },
  { key: "microfone", label: "Microfone" },
  { key: "botao_volume", label: "Botão de volume" },
  { key: "botao_power", label: "Botão de power/liga-desliga" },
  { key: "vibracao", label: "Vibração" },
  { key: "carregamento", label: "Carregamento (entrada de carga)" },
  { key: "bateria", label: "Bateria (saúde/porcentagem)" },
  { key: "wifi", label: "Wi-Fi" },
  { key: "bluetooth", label: "Bluetooth" },
  { key: "sensor_proximidade", label: "Sensor de proximidade" },
] as const;

export type ChecklistItemKey = (typeof CHECKLIST_ITEMS)[number]["key"];

type ModelFlags = Pick<Model, "hasFaceId" | "hasTouchId" | "hasHomeButton">;

export const CHECKLIST_ITEMS_CONDICIONAIS = [
  { key: "face_id", label: "Face ID", condicao: (m: ModelFlags) => m.hasFaceId },
  { key: "touch_id", label: "Touch ID", condicao: (m: ModelFlags) => m.hasTouchId },
  { key: "botao_home", label: "Botão home", condicao: (m: ModelFlags) => m.hasHomeButton },
] as const;

export type ChecklistItemCondicionalKey =
  (typeof CHECKLIST_ITEMS_CONDICIONAIS)[number]["key"];

export type ChecklistCompletoKey = ChecklistItemKey | ChecklistItemCondicionalKey;

export type Checklist = Partial<Record<ChecklistCompletoKey, ChecklistStatus>>;

export type SenhaTipo = "numerica_alfanumerica" | "padrao";

export interface SenhaAparelho {
  temSenha: boolean;
  tipo?: SenhaTipo;
  valor?: string; // numérica/alfanumérica
  padrao?: number[]; // sequência de pontos 0-8 (grade 3x3)
}

export interface Foto {
  url: string;
  publicId: string;
}

export type OsStatus =
  | "recebido"
  | "em_diagnostico"
  | "aguardando_aprovacao"
  | "em_reparo"
  | "pronto"
  | "entregue"
  | "cancelado";

export const OS_STATUS_LABELS: Record<OsStatus, string> = {
  recebido: "Recebido",
  em_diagnostico: "Em diagnóstico",
  aguardando_aprovacao: "Aguardando aprovação do orçamento",
  em_reparo: "Em reparo",
  pronto: "Pronto",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export interface Device {
  brandId: string;
  brandName: string;
  modelId: string;
  modelName: string;
  cor: string;
  capacidade: string;
  imei?: string;
  acessorios: Acessorio[];
}

export interface ServicoOrcamento {
  descricao: string;
  valor: number;
}

export interface Orcamento {
  servicos?: ServicoOrcamento[];
  valorOrcado?: number;
  valorAprovado?: number;
  aprovadoEm?: number;
}

export interface ServiceOrder {
  id: string;
  storeId: string;
  number: number;
  customerId: string;
  customerSnapshot: {
    nome: string;
    telefone: string;
  };
  device: Device;
  queixaCliente: string;
  testavel: boolean;
  motivoNaoTestavel?: string;
  checklist?: Checklist;
  defeitosObservados?: string;
  observacoes?: string;
  fotos: Foto[];
  senha: SenhaAparelho;
  orcamento: Orcamento;
  tecnicoResponsavel: {
    uid: string;
    nome: string;
  };
  dataEntrada: number;
  prazoEntrega?: number;
  status: OsStatus;
  assinaturaUrl?: string;
  createdAt: number;
  updatedAt: number;
}
