"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { StepAparelho } from "@/components/os-wizard/step-aparelho";
import { StepCliente } from "@/components/os-wizard/step-cliente";
import { StepDiagnostico } from "@/components/os-wizard/step-diagnostico";
import { StepOrcamento } from "@/components/os-wizard/step-orcamento";
import { StepQueixa } from "@/components/os-wizard/step-queixa";
import { StepRevisao } from "@/components/os-wizard/step-revisao";
import { StepSenha } from "@/components/os-wizard/step-senha";
import { StepTestavel } from "@/components/os-wizard/step-testavel";
import { initialWizardState, WIZARD_STEPS, type WizardState } from "@/components/os-wizard/types";

export default function NovaOsPage() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [state, setState] = useState<WizardState>(initialWizardState);

  const step = WIZARD_STEPS[stepIndex];

  function update(patch: Partial<WizardState>) {
    setState((prev) => ({ ...prev, ...patch }));
  }

  function onNext() {
    if (stepIndex < WIZARD_STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    }
  }

  function onBack() {
    if (stepIndex === 0) {
      router.replace("/");
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
      {step === "revisao" && <StepRevisao {...stepProps} />}
    </div>
  );
}
