"use client";

import { BrowserMultiFormatReader } from "@zxing/browser";
import type { IScannerControls } from "@zxing/browser";
import { useEffect, useRef, useState } from "react";

interface BarcodeScannerModalProps {
  onResult: (text: string) => void;
  onClose: () => void;
}

export function BarcodeScannerModal({ onResult, onClose }: BarcodeScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    let controls: IScannerControls | undefined;
    let cancelled = false;

    reader
      .decodeFromConstraints(
        { video: { facingMode: "environment" } },
        videoRef.current ?? undefined,
        (result) => {
          if (result && !cancelled) {
            onResult(result.getText());
          }
        },
      )
      .then((c) => {
        if (cancelled) {
          c.stop();
        } else {
          controls = c;
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Não foi possível acessar a câmera. Confere se a permissão foi liberada.");
        }
      });

    return () => {
      cancelled = true;
      controls?.stop();
    };
  }, [onResult]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex items-center justify-between p-4">
        <p className="text-sm font-medium text-white">Aponte a câmera para o código de barras</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-white/15 px-3 py-1.5 text-sm font-medium text-white"
        >
          Cancelar
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
        <div className="pointer-events-none absolute inset-x-8 top-1/2 h-24 -translate-y-1/2 rounded-lg border-2 border-white/70" />
      </div>

      {error && (
        <div className="bg-black p-4">
          <p className="text-center text-sm text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
