import type { Acessorio, Checklist, DocumentoTipo, SenhaTipo } from "@/types/os";

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

  senhaTemSenha: boolean | null;
  senhaTipo?: SenhaTipo;
  senhaValor: string;
  senhaPadrao: number[];

  valorOrcado: string;
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

  senhaTemSenha: null,
  senhaTipo: undefined,
  senhaValor: "",
  senhaPadrao: [],

  valorOrcado: "",
  prazoEntrega: "",
};

export interface StepProps {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
  onNext: () => void;
  onBack: () => void;
}
