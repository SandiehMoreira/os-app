"use client";

import {
  CHECKLIST_ITEMS,
  CHECKLIST_ITEMS_CONDICIONAIS,
  type ChecklistCompletoKey,
  type ChecklistStatus,
} from "@/types/os";
import { FotosAparelho } from "./fotos-aparelho";
import type { StepProps } from "./types";
import { WizardFooter } from "./wizard-footer";

export function StepDiagnostico({ state, update, onNext, onBack }: StepProps) {
  const itensCondicionais = CHECKLIST_ITEMS_CONDICIONAIS.filter((item) =>
    item.condicao(state.modelFlags),
  );
  const todosItens = [...CHECKLIST_ITEMS, ...itensCondicionais];

  function setStatus(key: ChecklistCompletoKey, status: ChecklistStatus) {
    update({ checklist: { ...state.checklist, [key]: status } });
  }

  function preencherDefeitosComNaoOk() {
    const labels = todosItens
      .filter((item) => state.checklist[item.key] === "nao_ok")
      .map((item) => item.label);
    update({ defeitosObservados: labels.join(", ") });
  }

  if (state.testavel === false) {
    const canAdvance = state.motivoNaoTestavel.trim().length > 0;
    return (
      <div className="flex flex-1 flex-col">
        <div className="flex-1 space-y-4 p-4">
          <h2 className="text-lg font-semibold">Aparelho não testável</h2>
          <div className="space-y-1">
            <label className="text-sm font-medium">
              Motivo de não ter sido possível testar
            </label>
            <textarea
              value={state.motivoNaoTestavel}
              onChange={(e) => update({ motivoNaoTestavel: e.target.value })}
              rows={4}
              className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-base outline-none focus:border-blue-600 dark:border-white/15"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Observações</label>
            <textarea
              value={state.observacoes}
              onChange={(e) => update({ observacoes: e.target.value })}
              rows={4}
              className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-base outline-none focus:border-blue-600 dark:border-white/15"
            />
          </div>
        </div>
        <WizardFooter onBack={onBack} onNext={onNext} nextDisabled={!canAdvance} />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <h2 className="text-lg font-semibold">Checklist técnico</h2>

        <div className="space-y-2">
          {todosItens.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between rounded-lg border border-black/10 p-3 dark:border-white/10"
            >
              <span className="text-sm">{item.label}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStatus(item.key, "ok")}
                  className={`rounded-lg px-3 py-2 text-sm font-medium ${
                    state.checklist[item.key] === "ok"
                      ? "bg-green-600 text-white"
                      : "bg-black/5 dark:bg-white/10"
                  }`}
                >
                  OK
                </button>
                <button
                  type="button"
                  onClick={() => setStatus(item.key, "nao_ok")}
                  className={`rounded-lg px-3 py-2 text-sm font-medium ${
                    state.checklist[item.key] === "nao_ok"
                      ? "bg-red-600 text-white"
                      : "bg-black/5 dark:bg-white/10"
                  }`}
                >
                  Não OK
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">O que está com defeito</label>
            <button
              type="button"
              onClick={preencherDefeitosComNaoOk}
              className="text-xs font-medium text-blue-600"
            >
              Usar itens &quot;Não OK&quot;
            </button>
          </div>
          <textarea
            value={state.defeitosObservados}
            onChange={(e) => update({ defeitosObservados: e.target.value })}
            rows={3}
            className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-base outline-none focus:border-blue-600 dark:border-white/15"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Observações</label>
          <textarea
            value={state.observacoes}
            onChange={(e) => update({ observacoes: e.target.value })}
            rows={3}
            placeholder="Riscos estéticos, película, etc."
            className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-base outline-none focus:border-blue-600 dark:border-white/15"
          />
        </div>

        <FotosAparelho fotos={state.fotos} onChange={(fotos) => update({ fotos })} />
      </div>
      <WizardFooter onBack={onBack} onNext={onNext} />
    </div>
  );
}
