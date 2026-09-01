"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { createCustomer, createServiceOrder } from "@/lib/firestore-service";
import { generateOsPdf, getOsPdfFile } from "@/lib/generate-os-pdf";
import { OS_STATUS_LABELS, type ServiceOrder } from "@/types/os";
import type { StepProps } from "./types";

export function StepRevisao({ state, onBack }: StepProps) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedOrder, setSavedOrder] = useState<ServiceOrder | null>(null);
  const [shareError, setShareError] = useState<string | null>(null);

  async function handleSalvar() {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      let customerId = state.customerId;
      if (!customerId) {
        const customer = await createCustomer({
          nome: state.customerNome,
          telefone: state.customerTelefone,
          documento: {
            tipo: state.customerDocumentoTipo,
            numero: state.customerDocumentoNumero,
          },
          endereco: state.customerEndereco || undefined,
          email: state.customerEmail || undefined,
        });
        customerId = customer.id;
      }

      const order = await createServiceOrder({
        customerId,
        customerSnapshot: { nome: state.customerNome, telefone: state.customerTelefone },
        device: {
          brandId: state.brandId,
          brandName: state.brandName,
          modelId: state.modelId,
          modelName: state.modelName,
          cor: state.cor,
          capacidade: state.capacidade,
          imei: state.imei || undefined,
          acessorios: state.acessorios,
        },
        queixaCliente: state.queixaCliente,
        testavel: state.testavel ?? false,
        motivoNaoTestavel: state.testavel === false ? state.motivoNaoTestavel : undefined,
        checklist: state.testavel ? state.checklist : undefined,
        defeitosObservados: state.testavel ? state.defeitosObservados : undefined,
        observacoes: state.observacoes || undefined,
        fotos: state.fotos,
        senha: {
          temSenha: !!state.senhaTemSenha,
          tipo: state.senhaTemSenha ? state.senhaTipo : undefined,
          valor:
            state.senhaTemSenha && state.senhaTipo === "numerica_alfanumerica"
              ? state.senhaValor
              : undefined,
          padrao:
            state.senhaTemSenha && state.senhaTipo === "padrao" ? state.senhaPadrao : undefined,
        },
        orcamento: {
          valorOrcado: state.valorOrcado ? Number(state.valorOrcado) : undefined,
        },
        tecnicoResponsavel: {
          uid: user.uid,
          nome: user.displayName || user.email || "Técnico",
        },
        dataEntrada: Date.now(),
        prazoEntrega: state.prazoEntrega ? new Date(state.prazoEntrega).getTime() : undefined,
        status: "recebido",
      });

      setSavedOrder(order);
    } catch {
      setError("Não foi possível salvar a OS. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  async function handleCompartilhar() {
    if (!savedOrder) return;
    setShareError(null);
    const file = getOsPdfFile(savedOrder);
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `OS #${String(savedOrder.number).padStart(4, "0")}`,
        });
        return;
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
    }
    setShareError("Compartilhamento não disponível neste navegador. Use \"Baixar PDF\".");
  }

  function handleBaixar() {
    if (!savedOrder) return;
    generateOsPdf(savedOrder).save(`OS-${String(savedOrder.number).padStart(4, "0")}.pdf`);
  }

  function handleImprimir() {
    if (!savedOrder) return;
    const doc = generateOsPdf(savedOrder);
    doc.autoPrint();
    window.open(doc.output("bloburl"), "_blank");
  }

  if (savedOrder !== null) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-sm text-black/60 dark:text-white/60">OS criada com sucesso</p>
        <p className="text-4xl font-semibold">
          #{String(savedOrder.number).padStart(4, "0")}
        </p>
        <p className="text-sm text-black/50 dark:text-white/50">
          Status: {OS_STATUS_LABELS.recebido}
        </p>

        <div className="mt-4 flex w-full max-w-xs flex-col gap-2">
          <button
            type="button"
            onClick={handleCompartilhar}
            className="rounded-xl bg-blue-600 px-6 py-3 text-base font-medium text-white"
          >
            Compartilhar (WhatsApp etc.)
          </button>
          <button
            type="button"
            onClick={handleBaixar}
            className="rounded-xl border border-black/15 px-6 py-3 text-base font-medium dark:border-white/15"
          >
            Baixar PDF
          </button>
          <button
            type="button"
            onClick={handleImprimir}
            className="rounded-xl border border-black/15 px-6 py-3 text-base font-medium dark:border-white/15"
          >
            Imprimir
          </button>
        </div>

        {shareError && <p className="text-sm text-red-600">{shareError}</p>}

        <Link
          href="/"
          className="mt-2 text-sm text-black/60 underline dark:text-white/60"
        >
          Voltar ao início
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <h2 className="text-lg font-semibold">Revisão</h2>

        <ResumoSecao titulo="Cliente">
          <p>{state.customerNome}</p>
          <p className="text-black/60 dark:text-white/60">{state.customerTelefone}</p>
        </ResumoSecao>

        <ResumoSecao titulo="Aparelho">
          <p>
            {state.brandName} {state.modelName}
          </p>
          <p className="text-black/60 dark:text-white/60">
            {state.cor} · {state.capacidade || "—"}
            {state.imei && ` · IMEI ${state.imei}`}
          </p>
        </ResumoSecao>

        <ResumoSecao titulo="Queixa do cliente">
          <p>{state.queixaCliente}</p>
        </ResumoSecao>

        <ResumoSecao titulo="Diagnóstico">
          {state.testavel ? (
            <>
              <p>{state.defeitosObservados || "Nenhum defeito informado."}</p>
              {state.observacoes && (
                <p className="text-black/60 dark:text-white/60">{state.observacoes}</p>
              )}
            </>
          ) : (
            <p>Não testável: {state.motivoNaoTestavel}</p>
          )}
          <p className="text-black/60 dark:text-white/60">
            {state.fotos.length} foto{state.fotos.length === 1 ? "" : "s"} do aparelho
          </p>
        </ResumoSecao>

        <ResumoSecao titulo="Senha">
          <p>
            {state.senhaTemSenha
              ? `Registrada (${state.senhaTipo === "padrao" ? "padrão de desenho" : "numérica/alfanumérica"})`
              : "Não informada"}
          </p>
        </ResumoSecao>

        <ResumoSecao titulo="Orçamento e prazo">
          <p>{state.valorOrcado ? `R$ ${state.valorOrcado}` : "A definir"}</p>
          <p className="text-black/60 dark:text-white/60">
            {state.prazoEntrega || "Sem prazo definido"}
          </p>
        </ResumoSecao>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <div className="flex gap-3 border-t border-black/10 p-4 dark:border-white/10">
        <button
          type="button"
          onClick={onBack}
          disabled={saving}
          className="flex-1 rounded-xl border border-black/15 px-4 py-3 text-base font-medium disabled:opacity-50 dark:border-white/15"
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={handleSalvar}
          disabled={saving}
          className="flex-[2] rounded-xl bg-blue-600 px-4 py-3 text-base font-medium text-white disabled:opacity-50"
        >
          {saving ? "Salvando..." : "Gerar OS"}
        </button>
      </div>
    </div>
  );
}

function ResumoSecao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1 rounded-lg border border-black/10 p-3 text-sm dark:border-white/10">
      <p className="text-xs font-medium uppercase tracking-wide text-black/40 dark:text-white/40">
        {titulo}
      </p>
      {children}
    </div>
  );
}
