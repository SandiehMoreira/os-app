import type {
  Acessorio,
  Checklist,
  Customer,
  DocumentoTipo,
  Foto,
  SenhaTipo,
  ServiceOrder,
} from "@/types/os";

export interface WizardState {
  customerId?: string;
  customerNome: string;
  customerTelefone: string;
  customerDocumentoTipo: DocumentoTipo;
  customerDocumentoNumero: string;
  customerEndereco: string;
  customerEmail: string;

  brandId: string;
  brandName: string;
  modelId: string;
  modelName: string;
  modelFlags: { hasFaceId: boolean; hasTouchId: boolean; hasHomeButton: boolean };
  cor: string;
  capacidade: string;
  imei: string;
  acessorios: Acessorio[];

  queixaCliente: string;

  testavel: boolean | null;
  motivoNaoTestavel: string;

  checklist: Checklist;
  defeitosObservados: string;
  observacoes: string;
  fotos: Foto[];

  senhaTemSenha: boolean | null;
  senhaTipo?: SenhaTipo;
  senhaValor: string;
  senhaPadrao: number[];

  servicos: { descricao: string; valor: string }[];
  prazoEntrega: string;
}

export const WIZARD_STEPS = [
  "cliente",
  "aparelho",
  "queixa",
  "testavel",
  "diagnostico",
  "senha",
  "orcamento",
  "revisao",
] as const;

export type WizardStep = (typeof WIZARD_STEPS)[number];

export const initialWizardState: WizardState = {
  customerId: undefined,
  customerNome: "",
  customerTelefone: "",
  customerDocumentoTipo: "CPF",
  customerDocumentoNumero: "",
  customerEndereco: "",
  customerEmail: "",

  brandId: "",
  brandName: "",
  modelId: "",
  modelName: "",
  modelFlags: { hasFaceId: false, hasTouchId: false, hasHomeButton: false },
  cor: "",
  capacidade: "",
  imei: "",
  acessorios: [],

  queixaCliente: "",

  testavel: null,
  motivoNaoTestavel: "",

  checklist: {},
  defeitosObservados: "",
  observacoes: "",
  fotos: [],

  senhaTemSenha: null,
  senhaTipo: undefined,
  senhaValor: "",
  senhaPadrao: [],

  servicos: [],
  prazoEntrega: "",
};

export interface StepProps {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}

// Reconstrói o estado do assistente a partir de uma OS já existente, para
// pré-preencher a edição. `modelFlags` vem de uma consulta ao catálogo (o
// aparelho da OS só guarda ids de marca/modelo, não os recursos do modelo).
export function orderToWizardState(
  order: ServiceOrder,
  customer: Customer | null,
  modelFlags: { hasFaceId: boolean; hasTouchId: boolean; hasHomeButton: boolean },
): WizardState {
  return {
    customerId: order.customerId,
    customerNome: order.customerSnapshot.nome,
    customerTelefone: order.customerSnapshot.telefone,
    customerDocumentoTipo: customer?.documento.tipo ?? "CPF",
    customerDocumentoNumero: customer?.documento.numero ?? "",
    customerEndereco: customer?.endereco ?? "",
    customerEmail: customer?.email ?? "",

    brandId: order.device.brandId,
    brandName: order.device.brandName,
    modelId: order.device.modelId,
    modelName: order.device.modelName,
    modelFlags,
    cor: order.device.cor,
    capacidade: order.device.capacidade,
    imei: order.device.imei ?? "",
    acessorios: order.device.acessorios,

    queixaCliente: order.queixaCliente,

    testavel: order.testavel,
    motivoNaoTestavel: order.motivoNaoTestavel ?? "",

    checklist: order.checklist ?? {},
    defeitosObservados: order.defeitosObservados ?? "",
    observacoes: order.observacoes ?? "",
    fotos: order.fotos,

    senhaTemSenha: order.senha.temSenha,
    senhaTipo: order.senha.tipo,
    senhaValor: order.senha.valor ?? "",
    senhaPadrao: order.senha.padrao ?? [],

    servicos: (order.orcamento.servicos ?? []).map((s) => ({
      descricao: s.descricao,
      valor: String(s.valor),
    })),
    prazoEntrega: order.prazoEntrega
      ? new Date(order.prazoEntrega).toISOString().slice(0, 10)
      : "",
  };
}
