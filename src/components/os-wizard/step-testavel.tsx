"use client";

import type { StepProps } from "./types";
import { WizardFooter } from "./wizard-footer";

export function StepTestavel({ state, update, onNext, onBack }: StepProps) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 space-y-4 p-4">
        <h2 className="text-lg font-semibold">É possível testar o aparelho agora?</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => update({ testavel: true })}
            className={`rounded-xl border px-4 py-6 text-lg font-medium ${
              state.testavel === true
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-black/15 dark:border-white/15"
            }`}
          >
            Sim
          </button>
          <button
            type="button"
            onClick={() => update({ testavel: false })}
            className={`rounded-xl border px-4 py-6 text-lg font-medium ${
              state.testavel === false
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-black/15 dark:border-white/15"
            }`}
          >
            Não
          </button>
        </div>
      </div>
      <WizardFooter onBack={onBack} onNext={onNext} nextDisabled={state.testavel === null} />
    </div>
  );
}
