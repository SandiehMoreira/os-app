"use client";

import { useEffect, useState } from "react";
import { addCustomBrandModel, getCatalog, type Catalog } from "@/lib/data-service";
import { ACESSORIOS, CORES_APARELHO, type Acessorio } from "@/types/os";
import type { StepProps } from "./types";
import { WizardFooter } from "./wizard-footer";

export function StepAparelho({ state, update, onNext, onBack }: StepProps) {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [capacidadeCustom, setCapacidadeCustom] = useState(false);
  const [corCustom, setCorCustom] = useState(
    state.cor !== "" && !(CORES_APARELHO as readonly string[]).includes(state.cor),
  );

  const [addingBrand, setAddingBrand] = useState(false);
  const [addingModel, setAddingModel] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [newModelName, setNewModelName] = useState("");
  const [newModelFaceId, setNewModelFaceId] = useState(false);
  const [newModelTouchId, setNewModelTouchId] = useState(false);
  const [newModelHomeButton, setNewModelHomeButton] = useState(false);
  const [savingNew, setSavingNew] = useState(false);

  useEffect(() => {
    getCatalog().then(setCatalog);
  }, []);

  function resetNewModelForm() {
    setNewBrandName("");
    setNewModelName("");
    setNewModelFaceId(false);
    setNewModelTouchId(false);
    setNewModelHomeButton(false);
  }

  async function handleSalvarNovaMarca() {
    if (!newBrandName.trim() || !newModelName.trim()) return;
    setSavingNew(true);
    try {
      const result = await addCustomBrandModel({
        brandName: newBrandName.trim(),
        modelName: newModelName.trim(),
        hasFaceId: newModelFaceId,
        hasTouchId: newModelTouchId,
        hasHomeButton: newModelHomeButton,
      });
      setCatalog(await getCatalog());
      update({
        brandId: result.brandId,
        brandName: result.brandName,
        modelId: result.modelId,
        modelName: result.modelName,
        capacidade: "",
        modelFlags: {
          hasFaceId: newModelFaceId,
          hasTouchId: newModelTouchId,
          hasHomeButton: newModelHomeButton,
        },
      });
      setAddingBrand(false);
      resetNewModelForm();
    } finally {
      setSavingNew(false);
    }
  }

  async function handleSalvarNovoModelo() {
    if (!newModelName.trim() || !state.brandId) return;
    setSavingNew(true);
    try {
      const result = await addCustomBrandModel({
        brandId: state.brandId,
        brandName: state.brandName,
        modelName: newModelName.trim(),
        hasFaceId: newModelFaceId,
        hasTouchId: newModelTouchId,
        hasHomeButton: newModelHomeButton,
      });
      setCatalog(await getCatalog());
      update({
        modelId: result.modelId,
        modelName: result.modelName,
        capacidade: "",
        modelFlags: {
          hasFaceId: newModelFaceId,
          hasTouchId: newModelTouchId,
          hasHomeButton: newModelHomeButton,
        },
      });
      setAddingModel(false);
      resetNewModelForm();
    } finally {
      setSavingNew(false);
    }
  }

  const loadingBrands = !catalog;
  const brands = catalog?.brands ?? [];
  const models = catalog && state.brandId ? (catalog.modelsByBrand[state.brandId] ?? []) : [];

  function handleBrandChange(brandId: string) {
    const brand = brands.find((b) => b.id === brandId);
    setCapacidadeCustom(false);
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
    setCapacidadeCustom(false);
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
          {addingBrand ? (
            <NovoModeloForm
              tituloMarca
              nomeModelo={newModelName}
              onNomeModeloChange={setNewModelName}
              nomeMarca={newBrandName}
              onNomeMarcaChange={setNewBrandName}
              hasFaceId={newModelFaceId}
              onFaceIdChange={setNewModelFaceId}
              hasTouchId={newModelTouchId}
              onTouchIdChange={setNewModelTouchId}
              hasHomeButton={newModelHomeButton}
              onHomeButtonChange={setNewModelHomeButton}
              saving={savingNew}
              onSalvar={handleSalvarNovaMarca}
              onCancelar={() => {
                setAddingBrand(false);
                resetNewModelForm();
              }}
            />
          ) : (
            <select
              value={state.brandId}
              onChange={(e) => {
                if (e.target.value === "__nova__") {
                  setAddingBrand(true);
                } else {
                  handleBrandChange(e.target.value);
                }
              }}
              disabled={loadingBrands}
              className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-base outline-none focus:border-blue-600 dark:border-white/15"
            >
              <option value="">{loadingBrands ? "Carregando..." : "Selecione"}</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nome}
                </option>
              ))}
              <option value="__nova__">+ Adicionar marca nova...</option>
            </select>
          )}
        </div>

        {!addingBrand && (
          <div className="space-y-1">
            <label className="text-sm font-medium">Modelo</label>
            {addingModel ? (
              <NovoModeloForm
                nomeModelo={newModelName}
                onNomeModeloChange={setNewModelName}
                hasFaceId={newModelFaceId}
                onFaceIdChange={setNewModelFaceId}
                hasTouchId={newModelTouchId}
                onTouchIdChange={setNewModelTouchId}
                hasHomeButton={newModelHomeButton}
                onHomeButtonChange={setNewModelHomeButton}
                saving={savingNew}
                onSalvar={handleSalvarNovoModelo}
                onCancelar={() => {
                  setAddingModel(false);
                  resetNewModelForm();
                }}
              />
            ) : (
              <select
                value={state.modelId}
                onChange={(e) => {
                  if (e.target.value === "__novo__") {
                    setAddingModel(true);
                  } else {
                    handleModelChange(e.target.value);
                  }
                }}
                disabled={!state.brandId}
                className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-base outline-none focus:border-blue-600 dark:border-white/15"
              >
                <option value="">Selecione</option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome}
                  </option>
                ))}
                {state.brandId && <option value="__novo__">+ Adicionar modelo novo...</option>}
              </select>
            )}
          </div>
        )}

        <div className="flex gap-3">
          <div className="flex-1 space-y-1">
            <label className="text-sm font-medium">Cor</label>
            {corCustom ? (
              <input
                type="text"
                autoFocus
                value={state.cor}
                onChange={(e) => update({ cor: e.target.value })}
                placeholder="Ex: Azul meia-noite"
                className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-base outline-none focus:border-blue-600 dark:border-white/15"
              />
            ) : (
              <select
                value={state.cor}
                onChange={(e) => {
                  if (e.target.value === "__outra__") {
                    setCorCustom(true);
                    update({ cor: "" });
                  } else {
                    update({ cor: e.target.value });
                  }
                }}
                className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-base outline-none focus:border-blue-600 dark:border-white/15"
              >
                <option value="">Selecione</option>
                {CORES_APARELHO.map((cor) => (
                  <option key={cor} value={cor}>
                    {cor}
                  </option>
                ))}
                <option value="__outra__">Outra...</option>
              </select>
            )}
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-sm font-medium">Capacidade</label>
            {capacidadeCustom ? (
              <input
                type="text"
                autoFocus
                value={state.capacidade}
                onChange={(e) => update({ capacidade: e.target.value })}
                placeholder="Ex: 32GB"
                className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-base outline-none focus:border-blue-600 dark:border-white/15"
              />
            ) : (
              <select
                value={state.capacidade}
                onChange={(e) => {
                  if (e.target.value === "__outra__") {
                    setCapacidadeCustom(true);
                    update({ capacidade: "" });
                  } else {
                    update({ capacidade: e.target.value });
                  }
                }}
                disabled={!selectedModel}
                className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-base outline-none focus:border-blue-600 dark:border-white/15"
              >
                <option value="">Selecione</option>
                {selectedModel?.capacidades.map((cap) => (
                  <option key={cap} value={cap}>
                    {cap}
                  </option>
                ))}
                <option value="__outra__">Outra...</option>
              </select>
            )}
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

function NovoModeloForm({
  tituloMarca,
  nomeMarca,
  onNomeMarcaChange,
  nomeModelo,
  onNomeModeloChange,
  hasFaceId,
  onFaceIdChange,
  hasTouchId,
  onTouchIdChange,
  hasHomeButton,
  onHomeButtonChange,
  saving,
  onSalvar,
  onCancelar,
}: {
  tituloMarca?: boolean;
  nomeMarca?: string;
  onNomeMarcaChange?: (value: string) => void;
  nomeModelo: string;
  onNomeModeloChange: (value: string) => void;
  hasFaceId: boolean;
  onFaceIdChange: (value: boolean) => void;
  hasTouchId: boolean;
  onTouchIdChange: (value: boolean) => void;
  hasHomeButton: boolean;
  onHomeButtonChange: (value: boolean) => void;
  saving: boolean;
  onSalvar: () => void;
  onCancelar: () => void;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-dashed border-black/25 p-3 dark:border-white/25">
      {tituloMarca && (
        <div className="space-y-1">
          <label className="text-sm font-medium">Nome da marca</label>
          <input
            type="text"
            autoFocus
            value={nomeMarca}
            onChange={(e) => onNomeMarcaChange?.(e.target.value)}
            placeholder="Ex: Blu"
            className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-base outline-none focus:border-blue-600 dark:border-white/15"
          />
        </div>
      )}

      <div className="space-y-1">
        <label className="text-sm font-medium">Nome do modelo</label>
        <input
          type="text"
          autoFocus={!tituloMarca}
          value={nomeModelo}
          onChange={(e) => onNomeModeloChange(e.target.value)}
          placeholder="Ex: Studio X10"
          className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-base outline-none focus:border-blue-600 dark:border-white/15"
        />
      </div>

      <div className="space-y-1">
        <p className="text-xs font-medium text-black/50 dark:text-white/50">
          O modelo tem algum desses recursos? (marque se tiver)
        </p>
        <div className="flex flex-wrap gap-2">
          <label className="flex items-center gap-1.5 rounded-lg border border-black/15 px-2.5 py-1.5 text-xs dark:border-white/15">
            <input
              type="checkbox"
              checked={hasFaceId}
              onChange={(e) => onFaceIdChange(e.target.checked)}
              className="h-3.5 w-3.5"
            />
            Face ID
          </label>
          <label className="flex items-center gap-1.5 rounded-lg border border-black/15 px-2.5 py-1.5 text-xs dark:border-white/15">
            <input
              type="checkbox"
              checked={hasTouchId}
              onChange={(e) => onTouchIdChange(e.target.checked)}
              className="h-3.5 w-3.5"
            />
            Touch ID
          </label>
          <label className="flex items-center gap-1.5 rounded-lg border border-black/15 px-2.5 py-1.5 text-xs dark:border-white/15">
            <input
              type="checkbox"
              checked={hasHomeButton}
              onChange={(e) => onHomeButtonChange(e.target.checked)}
              className="h-3.5 w-3.5"
            />
            Botão home físico
          </label>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancelar}
          disabled={saving}
          className="flex-1 rounded-lg border border-black/15 px-3 py-2 text-sm font-medium disabled:opacity-50 dark:border-white/15"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onSalvar}
          disabled={saving || !nomeModelo.trim() || (tituloMarca && !nomeMarca?.trim())}
          className="flex-[2] rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  );
}
