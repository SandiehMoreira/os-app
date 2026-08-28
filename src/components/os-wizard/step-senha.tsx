"use client";

import { PatternLock } from "./pattern-lock";
import type { StepProps } from "./types";
import { WizardFooter } from "./wizard-footer";

export function StepSenha({ state, update, onNext, onBack }: StepProps) {
  let canAdvance = state.senhaTemSenha !== null;
  if (state.senhaTemSenha) {
    if (state.senhaTipo === "numerica_alfanumerica") {
      canAdvance = state.senhaValor.trim().length > 0;
    } else if (state.senhaTipo === "padrao") {
      canAdvance = state.senhaPadrao.length >= 4;
    } else {
      canAdvance = false;
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 space-y-4 p-4">
        <h2 className="text-lg font-semibold">O cliente deixou a senha?</h2>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => update({ senhaTemSenha: true })}
            className={`rounded-xl border px-4 py-4 text-base font-medium ${
              state.senhaTemSenha === true
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-black/15 dark:border-white/15"
            }`}
          >
            Sim
          </button>
          <button
            type="button"
            onClick={() =>
              update({ senhaTemSenha: false, senhaTipo: undefined, senhaValor: "", senhaPadrao: [] })
            }
            className={`rounded-xl border px-4 py-4 text-base font-medium ${
              state.senhaTemSenha === false
                ? "border-blue-600 bg-blue-600 text-white"
                : "border-black/15 dark:border-white/15"
            }`}
          >
            Não
          </button>
        </div>

        {state.senhaTemSenha && (
          <>
            <div className="space-y-1">
              <label className="text-sm font-medium">Tipo</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => update({ senhaTipo: "numerica_alfanumerica", senhaPadrao: [] })}
                  className={`rounded-xl border px-3 py-3 text-sm font-medium ${
                    state.senhaTipo === "numerica_alfanumerica"
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-black/15 dark:border-white/15"
                  }`}
                >
                  Numérica/Alfanumérica
                </button>
                <button
                  type="button"
                  onClick={() => update({ senhaTipo: "padrao", senhaValor: "" })}
                  className={`rounded-xl border px-3 py-3 text-sm font-medium ${
                    state.senhaTipo === "padrao"
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-black/15 dark:border-white/15"
                  }`}
                >
                  Padrão de desenho
                </button>
              </div>
            </div>

            {state.senhaTipo === "numerica_alfanumerica" && (
              <div className="space-y-1">
                <label className="text-sm font-medium">Senha</label>
                <input
                  type="text"
                  value={state.senhaValor}
                  onChange={(e) => update({ senhaValor: e.target.value })}
                  className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-base outline-none focus:border-blue-600 dark:border-white/15"
                />
              </div>
            )}

            {state.senhaTipo === "padrao" && (
              <div className="flex justify-center pt-2">
                <PatternLock
                  value={state.senhaPadrao}
                  onChange={(padrao) => update({ senhaPadrao: padrao })}
                />
              </div>
            )}
          </>
        )}
      </div>
      <WizardFooter onBack={onBack} onNext={onNext} nextDisabled={!canAdvance} />
    </div>
  );
}
