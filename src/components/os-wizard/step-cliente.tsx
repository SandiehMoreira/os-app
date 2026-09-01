"use client";

import { useEffect, useState } from "react";
import { searchCustomersByPhone } from "@/lib/firestore-service";
import type { Customer, DocumentoTipo } from "@/types/os";
import type { StepProps } from "./types";
import { WizardFooter } from "./wizard-footer";

function formatDocumento(rawDigits: string, tipo: DocumentoTipo): string {
  if (tipo === "CPF") {
    const d = rawDigits.slice(0, 11);
    let out = d.slice(0, 3);
    if (d.length > 3) out += "." + d.slice(3, 6);
    if (d.length > 6) out += "." + d.slice(6, 9);
    if (d.length > 9) out += "-" + d.slice(9, 11);
    return out;
  }

  const d = rawDigits.slice(0, 9);
  let out = d.slice(0, 2);
  if (d.length > 2) out += "." + d.slice(2, 5);
  if (d.length > 5) out += "." + d.slice(5, 8);
  if (d.length > 8) out += "-" + d.slice(8, 9);
  return out;
}

export function StepCliente({ state, update, onNext, onBack }: StepProps) {
  const [results, setResults] = useState<Customer[]>([]);
  const [searching, setSearching] = useState(false);

  const digits = state.customerTelefone.replace(/\D/g, "");
  const shouldSearch = !state.customerId && digits.length >= 4;

  useEffect(() => {
    if (!shouldSearch) return;
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const found = await searchCustomersByPhone(state.customerTelefone);
        setResults(found);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [shouldSearch, state.customerTelefone]);

  function selectCustomer(c: Customer) {
    update({
      customerId: c.id,
      customerNome: c.nome,
      customerTelefone: c.telefone,
      customerDocumentoTipo: c.documento.tipo,
      customerDocumentoNumero: c.documento.numero,
      customerEndereco: c.endereco ?? "",
      customerEmail: c.email ?? "",
    });
    setResults([]);
  }

  function clearSelection() {
    update({ customerId: undefined });
  }

  const canAdvance =
    state.customerNome.trim().length > 0 &&
    state.customerTelefone.trim().length > 0 &&
    state.customerDocumentoNumero.trim().length > 0;

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        <h2 className="text-lg font-semibold">Cliente</h2>

        <div className="space-y-1">
          <label className="text-sm font-medium">Telefone/WhatsApp</label>
          <input
            type="tel"
            value={state.customerTelefone}
            onChange={(e) => update({ customerTelefone: e.target.value, customerId: undefined })}
            placeholder="(11) 91234-5678"
            className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-base outline-none focus:border-blue-600 dark:border-white/15"
          />
          {searching && <p className="text-xs text-black/50 dark:text-white/50">Buscando...</p>}
        </div>

        {shouldSearch && results.length > 0 && (
          <div className="space-y-2 rounded-lg border border-black/10 p-2 dark:border-white/10">
            <p className="text-xs font-medium text-black/50 dark:text-white/50">
              Clientes encontrados:
            </p>
            {results.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => selectCustomer(c)}
                className="w-full rounded-lg border border-black/10 p-3 text-left text-sm hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
              >
                <p className="font-medium">{c.nome}</p>
                <p className="text-black/60 dark:text-white/60">{c.telefone}</p>
              </button>
            ))}
          </div>
        )}

        {state.customerId && (
          <div className="flex items-center justify-between rounded-lg bg-blue-600/10 p-3 text-sm">
            <span>Cliente já cadastrado selecionado.</span>
            <button type="button" onClick={clearSelection} className="font-medium text-blue-600">
              Trocar
            </button>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium">Nome completo</label>
          <input
            type="text"
            value={state.customerNome}
            onChange={(e) => update({ customerNome: e.target.value })}
            className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-base outline-none focus:border-blue-600 dark:border-white/15"
          />
        </div>

        <div className="flex gap-3">
          <div className="w-28 space-y-1">
            <label className="text-sm font-medium">Documento</label>
            <select
              value={state.customerDocumentoTipo}
              onChange={(e) => {
                const tipo = e.target.value as DocumentoTipo;
                const digits = state.customerDocumentoNumero.replace(/\D/g, "");
                update({
                  customerDocumentoTipo: tipo,
                  customerDocumentoNumero: formatDocumento(digits, tipo),
                });
              }}
              className="w-full rounded-lg border border-black/15 px-2 py-2.5 text-base outline-none focus:border-blue-600 dark:border-white/15"
            >
              <option value="CPF">CPF</option>
              <option value="RG">RG</option>
            </select>
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-sm font-medium">Número</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={state.customerDocumentoNumero}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, "");
                update({
                  customerDocumentoNumero: formatDocumento(digits, state.customerDocumentoTipo),
                });
              }}
              placeholder={state.customerDocumentoTipo === "CPF" ? "000.000.000-00" : "00.000.000-0"}
              className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-base outline-none focus:border-blue-600 dark:border-white/15"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Endereço (opcional)</label>
          <input
            type="text"
            value={state.customerEndereco}
            onChange={(e) => update({ customerEndereco: e.target.value })}
            className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-base outline-none focus:border-blue-600 dark:border-white/15"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">E-mail (opcional)</label>
          <input
            type="email"
            value={state.customerEmail}
            onChange={(e) => update({ customerEmail: e.target.value })}
            className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-base outline-none focus:border-blue-600 dark:border-white/15"
          />
        </div>
      </div>

      <WizardFooter onBack={onBack} onNext={onNext} nextDisabled={!canAdvance} hideBack />
    </div>
  );
}
