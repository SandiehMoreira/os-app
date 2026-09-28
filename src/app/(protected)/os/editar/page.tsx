"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { StepAparelho } from "@/components/os-wizard/step-aparelho";
import { StepCliente } from "@/components/os-wizard/step-cliente";
import { StepDiagnostico } from "@/components/os-wizard/step-diagnostico";
import { StepOrcamento } from "@/components/os-wizard/step-orcamento";
import { StepQueixa } from "@/components/os-wizard/step-queixa";
import { StepRevisao } from "@/components/os-wizard/step-revisao";
import { StepSenha } from "@/components/os-wizard/step-senha";
import { StepTestavel } from "@/components/os-wizard/step-testavel";
import { orderToWizardState, WIZARD_STEPS, type WizardState } from "@/components/os-wizard/types";
import { getCatalog, getCustomer, getServiceOrder } from "@/lib/data-service";
import type { ServiceOrder } from "@/types/os";

function EditarOsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [order, setOrder] = useState<ServiceOrder | null | undefined>(undefined);
  const [initialState, setInitialState] = useState<WizardState | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [state, setState] = useState<WizardState | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const loadedOrder = await getServiceOrder(id);
        if (!loadedOrder) {
          setOrder(null);
          return;
        }

        const [customer, catalog] = await Promise.all([
          getCustomer(loadedOrder.customerId),
          getCatalog(),
        ]);

        const model = catalog.modelsByBrand[loadedOrder.device.brandId]?.find(
          (m) => m.id === loadedOrder.device.modelId,
        );
        const modelFlags = model
          ? { hasFaceId: model.hasFaceId, hasTouchId: model.hasTouchId, hasHomeButton: model.hasHomeButton }
          : { hasFaceId: false, hasTouchId: false, hasHomeButton: false };

        const wizardState = orderToWizardState(loadedOrder, customer, modelFlags);
        setOrder(loadedOrder);
        setInitialState(wizardState);
        setState(wizardState);
      } catch {
        setOrder(null);
      }
    })();
  }, [id]);

  if (!id || order === null) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-sm text-black/50 dark:text-white/50">OS não encontrada.</p>
      </div>
    );
  }

  if (order === undefined || !state || !initialState) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-sm text-black/50 dark:text-white/50">Carregando...</p>
      </div>
    );
  }

  const step = WIZARD_STEPS[stepIndex];

  function update(patch: Partial<WizardState>) {
    setState((prev) => (prev ? { ...prev, ...patch } : prev));
  }

  function onNext() {
    if (stepIndex < WIZARD_STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    }
  }

  function onBack() {
    if (stepIndex === 0) {
      router.replace(`/os/detalhe?id=${id}`);
      return;
    }
    setStepIndex(stepIndex - 1);
  }

  const stepProps = { state, update, onNext, onBack };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-2 border-b border-black/10 px-4 py-2 dark:border-white/10">
        {WIZARD_STEPS.map((s, i) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full ${
              i <= stepIndex ? "bg-blue-600" : "bg-black/10 dark:bg-white/10"
            }`}
          />
        ))}
      </div>

      {step === "cliente" && <StepCliente {...stepProps} />}
      {step === "aparelho" && <StepAparelho {...stepProps} />}
      {step === "queixa" && <StepQueixa {...stepProps} />}
      {step === "testavel" && <StepTestavel {...stepProps} />}
      {step === "diagnostico" && <StepDiagnostico {...stepProps} />}
      {step === "senha" && <StepSenha {...stepProps} />}
      {step === "orcamento" && <StepOrcamento {...stepProps} />}
      {step === "revisao" && <StepRevisao {...stepProps} existingOrder={order} />}
    </div>
  );
}

export default function EditarOsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center p-6">
          <p className="text-sm text-black/50 dark:text-white/50">Carregando...</p>
        </div>
      }
    >
      <EditarOsContent />
    </Suspense>
  );
}
