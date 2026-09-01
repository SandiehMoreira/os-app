"use client";

import { useState } from "react";
import { generateOsPdf, getOsPdfFile, getOsPhotoFiles } from "@/lib/generate-os-pdf";
import type { ServiceOrder } from "@/types/os";

export function OsActions({ order }: { order: ServiceOrder }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCompartilhar() {
    setError(null);
    setBusy("share");
    try {
      const [pdfFile, photoFiles] = await Promise.all([
        getOsPdfFile(order),
        getOsPhotoFiles(order),
      ]);
      const files = [pdfFile, ...photoFiles];
      if (navigator.canShare?.({ files })) {
        await navigator.share({ files, title: `OS #${String(order.number).padStart(4, "0")}` });
      } else if (navigator.canShare?.({ files: [pdfFile] })) {
        await navigator.share({ files: [pdfFile], title: `OS #${String(order.number).padStart(4, "0")}` });
      } else {
        setError('Compartilhamento não disponível neste navegador. Use "Baixar PDF".');
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError("Não foi possível compartilhar. Tente baixar o PDF.");
    } finally {
      setBusy(null);
    }
  }

  async function handleBaixar() {
    setError(null);
    setBusy("download");
    try {
      const doc = await generateOsPdf(order);
      doc.save(`OS-${String(order.number).padStart(4, "0")}.pdf`);
    } finally {
      setBusy(null);
    }
  }

  async function handleImprimir() {
    setError(null);
    setBusy("print");
    try {
      const doc = await generateOsPdf(order);
      doc.autoPrint();
      window.open(doc.output("bloburl"), "_blank");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <button
        type="button"
        onClick={handleCompartilhar}
        disabled={busy !== null}
        className="rounded-xl bg-blue-600 px-6 py-3 text-base font-medium text-white disabled:opacity-60"
      >
        {busy === "share" ? "Preparando..." : "Compartilhar (WhatsApp etc.)"}
      </button>
      <button
        type="button"
        onClick={handleBaixar}
        disabled={busy !== null}
        className="rounded-xl border border-black/15 px-6 py-3 text-base font-medium disabled:opacity-60 dark:border-white/15"
      >
        {busy === "download" ? "Gerando..." : "Baixar PDF"}
      </button>
      <button
        type="button"
        onClick={handleImprimir}
        disabled={busy !== null}
        className="rounded-xl border border-black/15 px-6 py-3 text-base font-medium disabled:opacity-60 dark:border-white/15"
      >
        {busy === "print" ? "Gerando..." : "Imprimir"}
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
