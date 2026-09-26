"use client";

import Link from "next/link";
import { useState } from "react";
import { OsActions } from "@/components/os-actions";
import { useAuth } from "@/lib/auth-context";
import { createCustomer, createServiceOrder } from "@/lib/data-service";
import { OS_STATUS_LABELS, type ServiceOrder } from "@/types/os";
import type { StepProps } from "./types";

export function StepRevisao({ state, onBack }: StepProps) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [slowSave, setSlowSave] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedOrder, setSavedOrder] = useState<ServiceOrder | null>(null);

  async function handleSalvar() {
    if (!user) return;
    setSaving(true);
    setSlowSave(false);
    setError(null);
    const slowTimer = setTimeout(() => setSlowSave(true), 8000);
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
        orcamento: (() => {
          const servicos = state.servicos
            .filter((s) => s.descricao.trim() && s.valor)
            .map((s) => ({ descricao: s.descricao.trim(), valor: Number(s.valor) || 0 }));
          return {
            servicos: servicos.length > 0 ? servicos : undefined,
            valorOrcado:
              servicos.length > 0
                ? servicos.reduce((sum, s) => sum + s.valor, 0)
                : undefined,
          };
        })(),
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
      clearTimeout(slowTimer);
      setSaving(false);
      setSlowSave(false);
    }
  }

  if (savedOrder !== null) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom)+28px)] text-center">
        <p className="text-sm text-black/60 dark:text-white/60">OS criada com sucesso</p>
        <p className="text-4xl font-semibold">
          #{String(savedOrder.number).padStart(4, "0")}
        </p>
        <p className="text-sm text-black/50 dark:text-white/50">
          Status: {OS_STATUS_LABELS.recebido}
        </p>

        <div className="mt-4 w-full max-w-xs">
          <OsActions order={savedOrder} />
        </div>

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

        <ResumoSecao titulo="Serviços e orçamento">
          {state.servicos.length === 0 && <p>A definir após diagnóstico.</p>}
          {state.servicos.map((s, i) => (
            <p key={i} className="flex justify-between">
              <span>{s.descricao || "-"}</span>
              <span>R$ {(Number(s.valor) || 0).toFixed(2)}</span>
            </p>
          ))}
          {state.servicos.length > 0 && (
            <p className="flex justify-between font-semibold">
              <span>Total</span>
              <span>
                R${" "}
                {state.servicos
                  .reduce((sum, s) => sum + (Number(s.valor) || 0), 0)
                  .toFixed(2)}
              </span>
            </p>
          )}
          <p className="text-black/60 dark:text-white/60">
            {state.prazoEntrega || "Sem prazo definido"}
          </p>
        </ResumoSecao>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {slowSave && (
          <p className="text-sm text-amber-600">
            Isso está demorando mais que o normal — parece que sua internet está fraca. Não feche
            o app: a OS salva assim que a conexão melhorar.
          </p>
        )}
      </div>

      <div className="flex gap-3 border-t border-black/10 p-4 pb-[calc(1rem+env(safe-area-inset-bottom)+28px)] dark:border-white/10">
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
          {saving ? (slowSave ? "Ainda salvando..." : "Salvando...") : "Gerar OS"}
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
