"use client";

import type { StepProps } from "./types";
import { WizardFooter } from "./wizard-footer";

export function StepOrcamento({ state, update, onNext, onBack }: StepProps) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 space-y-4 p-4">
        <h2 className="text-lg font-semibold">Orçamento e prazo</h2>

        <div className="space-y-1">
          <label className="text-sm font-medium">Orçamento estimado (opcional)</label>
          <div className="flex items-center gap-2">
            <span className="text-base text-black/50 dark:text-white/50">R$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={state.valorOrcado}
              onChange={(e) => update({ valorOrcado: e.target.value })}
              className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-base outline-none focus:border-blue-600 dark:border-white/15"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Prazo estimado de entrega</label>
          <input
            type="date"
            value={state.prazoEntrega}
            onChange={(e) => update({ prazoEntrega: e.target.value })}
            className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-base outline-none focus:border-blue-600 dark:border-white/15"
          />
        </div>
      </div>
      <WizardFooter onBack={onBack} onNext={onNext} />
    </div>
  );
}
