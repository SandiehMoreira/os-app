"use client";

import { useState, type ChangeEvent } from "react";
import { uploadPhotoToCloudinary } from "@/lib/cloudinary";
import type { Foto } from "@/types/os";

export function FotosAparelho({
  fotos,
  onChange,
}: {
  fotos: Foto[];
  onChange: (fotos: Foto[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    setError(null);
    try {
      const foto = await uploadPhotoToCloudinary(file);
      onChange([...fotos, foto]);
    } catch {
      setError("Não foi possível enviar a foto. Tente novamente.");
    } finally {
      setUploading(false);
    }
  }

  function removeFoto(publicId: string) {
    onChange(fotos.filter((f) => f.publicId !== publicId));
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Fotos do aparelho</label>
      <p className="text-xs text-black/50 dark:text-white/50">
        Tire 3-4 fotos na entrada (frente, verso, laterais, riscos/manchas).
      </p>
      <div className="grid grid-cols-3 gap-2">
        {fotos.map((foto) => (
          <div
            key={foto.publicId}
            className="relative aspect-square overflow-hidden rounded-lg border border-black/10 dark:border-white/10"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={foto.url} alt="Foto do aparelho" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeFoto(foto.publicId)}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white"
            >
              ×
            </button>
          </div>
        ))}

        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-black/25 text-xs text-black/50 dark:border-white/25 dark:text-white/50">
          {uploading ? "Enviando..." : "+ Foto"}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFile}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
