"use client";

import { useEffect, useState } from "react";
import { getCatalog, type Catalog } from "@/lib/firestore-service";
import { ACESSORIOS, type Acessorio } from "@/types/os";
import type { StepProps } from "./types";
import { WizardFooter } from "./wizard-footer";

export function StepAparelho({ state, update, onNext, onBack }: StepProps) {
  const [catalog, setCatalog] = useState<Catalog | null>(null);

  useEffect(() => {
    getCatalog().then(setCatalog);
  }, []);

  const loadingBrands = !catalog;
  const brands = catalog?.brands ?? [];
  const models = catalog && state.brandId ? (catalog.modelsByBrand[state.brandId] ?? []) : [];

  function handleBrandChange(brandId: string) {
    const brand = brands.find((b) => b.id === brandId);
    update({
      brandId,
      brandName: brand?.nome ?? "",
      modelId: "",
      modelName: "",
      capacidade: "",
      modelFlags: { hasFaceId: false, hasTouchId: false, hasHomeButton: false },
    });
  }

  function handleModelChange(modelId: string) {
    const model = models.find((m) => m.id === modelId);
    update({
      modelId,
      modelName: model?.nome ?? "",
      capacidade: "",
      modelFlags: {
        hasFaceId: model?.hasFaceId ?? false,
        hasTouchId: model?.hasTouchId ?? false,
        hasHomeButton: model?.hasHomeButton ?? false,
      },
    });
  }

  function toggleAcessorio(item: Acessorio) {
    const has = state.acessorios.includes(item);
    update({
      acessorios: has
        ? state.acessorios.filter((a) => a !== item)
        : [...state.acessorios, item],
    });
  }

  const selectedModel = models.find((m) => m.id === state.modelId);

  const canAdvance =
    state.brandId.length > 0 && state.modelId.length > 0 && state.cor.trim().length > 0;

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <h2 className="text-lg font-semibold">Dados do aparelho</h2>

        <div className="space-y-1">
          <label className="text-sm font-medium">Marca</label>
          <select
            value={state.brandId}
            onChange={(e) => handleBrandChange(e.target.value)}
            disabled={loadingBrands}
            className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-base outline-none focus:border-blue-600 dark:border-white/15"
          >
            <option value="">{loadingBrands ? "Carregando..." : "Selecione"}</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Modelo</label>
          <select
            value={state.modelId}
            onChange={(e) => handleModelChange(e.target.value)}
            disabled={!state.brandId}
            className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-base outline-none focus:border-blue-600 dark:border-white/15"
          >
            <option value="">Selecione</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 space-y-1">
            <label className="text-sm font-medium">Cor</label>
            <input
              type="text"
              value={state.cor}
              onChange={(e) => update({ cor: e.target.value })}
              className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-base outline-none focus:border-blue-600 dark:border-white/15"
            />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-sm font-medium">Capacidade</label>
            <input
              type="text"
              list="capacidades-sugeridas"
              value={state.capacidade}
              onChange={(e) => update({ capacidade: e.target.value })}
              placeholder="128GB"
              className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-base outline-none focus:border-blue-600 dark:border-white/15"
            />
            <datalist id="capacidades-sugeridas">
              {selectedModel?.capacidades.map((cap) => <option key={cap} value={cap} />)}
            </datalist>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">IMEI ou número de série (opcional)</label>
          <input
            type="text"
            value={state.imei}
            onChange={(e) => update({ imei: e.target.value })}
            className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-base outline-none focus:border-blue-600 dark:border-white/15"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Acessórios entregues junto</label>
          <div className="grid grid-cols-2 gap-2">
            {ACESSORIOS.map((item) => (
              <label
                key={item}
                className="flex items-center gap-2 rounded-lg border border-black/15 px-3 py-2.5 text-sm dark:border-white/15"
              >
                <input
                  type="checkbox"
                  checked={state.acessorios.includes(item)}
                  onChange={() => toggleAcessorio(item)}
                  className="h-4 w-4"
                />
                {item}
              </label>
            ))}
          </div>
        </div>
      </div>

      <WizardFooter onBack={onBack} onNext={onNext} nextDisabled={!canAdvance} />
    </div>
  );
}
