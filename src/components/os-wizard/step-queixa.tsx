"use client";

import type { StepProps } from "./types";
import { WizardFooter } from "./wizard-footer";

export function StepQueixa({ state, update, onNext, onBack }: StepProps) {
  const canAdvance = state.queixaCliente.trim().length > 0;

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 space-y-4 p-4">
        <h2 className="text-lg font-semibold">Queixa do cliente</h2>
        <div className="space-y-1">
          <label className="text-sm font-medium">Qual o problema relatado pelo cliente?</label>
          <textarea
            value={state.queixaCliente}
            onChange={(e) => update({ queixaCliente: e.target.value })}
            rows={6}
            placeholder='Ex: "não carrega", "tela quebrada"...'
            className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-base outline-none focus:border-blue-600 dark:border-white/15"
          />
        </div>
      </div>
      <WizardFooter onBack={onBack} onNext={onNext} nextDisabled={!canAdvance} />
    </div>
  );
}
