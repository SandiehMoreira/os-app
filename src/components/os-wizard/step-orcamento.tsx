"use client";

import type { StepProps } from "./types";
import { WizardFooter } from "./wizard-footer";

export function StepOrcamento({ state, update, onNext, onBack }: StepProps) {
  function addServico() {
    update({ servicos: [...state.servicos, { descricao: "", valor: "" }] });
  }

  function updateServico(index: number, patch: Partial<{ descricao: string; valor: string }>) {
    update({
      servicos: state.servicos.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    });
  }

  function removeServico(index: number) {
    update({ servicos: state.servicos.filter((_, i) => i !== index) });
  }

  const total = state.servicos.reduce((sum, s) => sum + (Number(s.valor) || 0), 0);

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <h2 className="text-lg font-semibold">Serviços e orçamento</h2>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            O que será necessário fazer no aparelho
          </label>

          {state.servicos.map((servico, index) => (
            <div key={index} className="flex items-start gap-2">
              <input
                type="text"
                value={servico.descricao}
                onChange={(e) => updateServico(index, { descricao: e.target.value })}
                placeholder="Ex: Troca de tela"
                className="flex-[2] rounded-lg border border-black/15 px-3 py-2.5 text-base outline-none focus:border-blue-600 dark:border-white/15"
              />
              <div className="flex flex-1 items-center gap-1">
                <span className="text-sm text-black/50 dark:text-white/50">R$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={servico.valor}
                  onChange={(e) => updateServico(index, { valor: e.target.value })}
                  className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-base outline-none focus:border-blue-600 dark:border-white/15"
                />
              </div>
              <button
                type="button"
                onClick={() => removeServico(index)}
                className="rounded-lg border border-black/15 px-3 py-2.5 text-base dark:border-white/15"
                aria-label="Remover serviço"
              >
                ×
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addServico}
            className="w-full rounded-lg border border-dashed border-black/25 px-3 py-2.5 text-sm font-medium text-black/60 dark:border-white/25 dark:text-white/60"
          >
            + Adicionar serviço
          </button>

          {state.servicos.length > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-blue-600/10 px-3 py-2.5 text-sm font-semibold">
              <span>Valor total estimado</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
          )}
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
