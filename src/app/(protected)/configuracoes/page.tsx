"use client";

import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  updatePassword,
} from "firebase/auth";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { getBackendMode, setBackendMode, type BackendMode } from "@/lib/backend-mode";
import { useAuth } from "@/lib/auth-context";
import { uploadPhotoToCloudinary } from "@/lib/cloudinary";
import { getStoreSettings, updateStoreSettings } from "@/lib/data-service";
import { useTheme, type Theme } from "@/lib/theme-context";
import { TERMO_RESPONSABILIDADE_PADRAO } from "@/types/os";

const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: "light", label: "Claro" },
  { value: "dark", label: "Escuro" },
  { value: "system", label: "Sistema" },
];

export default function ConfiguracoesPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pb-[calc(1rem+env(safe-area-inset-bottom)+28px)]">
      <h1 className="text-lg font-semibold">Configurações</h1>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">Tema do app</h2>
        <div className="grid grid-cols-3 gap-2">
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme(opt.value)}
              className={`rounded-lg border px-3 py-2.5 text-sm font-medium ${
                theme === opt.value
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-black/15 dark:border-white/15"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      <ArmazenamentoSection />
      <EmpresaSection />
      <ContaSection />
    </div>
  );
}

function ArmazenamentoSection() {
  const [mode, setMode] = useState<BackendMode>(() => getBackendMode());

  function handleChange(next: BackendMode) {
    setBackendMode(next);
    setMode(next);
  }

  return (
    <section className="space-y-2 border-t border-black/10 pt-4 dark:border-white/10">
      <h2 className="text-sm font-medium">Onde salvar os dados</h2>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => handleChange("local")}
          className={`rounded-lg border px-3 py-2.5 text-sm font-medium ${
            mode === "local"
              ? "border-blue-600 bg-blue-600 text-white"
              : "border-black/15 dark:border-white/15"
          }`}
        >
          Local (sem internet)
        </button>
        <button
          type="button"
          onClick={() => handleChange("cloud")}
          className={`rounded-lg border px-3 py-2.5 text-sm font-medium ${
            mode === "cloud"
              ? "border-blue-600 bg-blue-600 text-white"
              : "border-black/15 dark:border-white/15"
          }`}
        >
          Nuvem (com backup)
        </button>
      </div>
      <p className="text-xs text-black/50 dark:text-white/50">
        {mode === "local"
          ? "Os dados ficam só neste aparelho, funciona 100% sem internet. Sem backup — se desinstalar o app ou trocar de aparelho, os dados se perdem."
          : "Os dados ficam salvos na nuvem, com backup automático. Funciona offline no dia a dia (sincroniza sozinho quando a internet voltar)."}
      </p>
      <p className="text-xs text-amber-600">
        Trocar o modo não move os dados de um lado pro outro — cada modo guarda os
        dados separadamente. Escolha um e mantenha, se possível.
      </p>
    </section>
  );
}

function EmpresaSection() {
  const [nomeEmpresa, setNomeEmpresa] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
  const [termo, setTermo] = useState(TERMO_RESPONSABILIDADE_PADRAO);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getStoreSettings().then((settings) => {
      setNomeEmpresa(settings.nomeEmpresa);
      setLogoUrl(settings.logoUrl);
      setTermo(settings.termoResponsabilidade);
      setLoading(false);
    });
  }, []);

  async function handleLogoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const foto = await uploadPhotoToCloudinary(file);
      setLogoUrl(foto.url);
    } catch {
      setError("Não foi possível enviar a logo.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSalvar(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await updateStoreSettings({
        nomeEmpresa: nomeEmpresa.trim() || "OS Assistência Técnica",
        logoUrl,
        termoResponsabilidade: termo.trim() || TERMO_RESPONSABILIDADE_PADRAO,
      });
      setSaved(true);
    } catch {
      setError("Não foi possível salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-black/50 dark:text-white/50">Carregando...</p>;
  }

  return (
    <form onSubmit={handleSalvar} className="space-y-3 border-t border-black/10 pt-4 dark:border-white/10">
      <h2 className="text-sm font-medium">Empresa</h2>

      <div className="space-y-1">
        <label className="text-sm font-medium">Nome da empresa</label>
        <input
          type="text"
          value={nomeEmpresa}
          onChange={(e) => setNomeEmpresa(e.target.value)}
          className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-base outline-none focus:border-blue-600 dark:border-white/15"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Logo</label>
        <div className="flex items-center gap-3">
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Logo" className="h-14 w-14 rounded-lg object-contain border border-black/10 dark:border-white/10" />
          )}
          <label className="cursor-pointer rounded-lg border border-black/15 px-3 py-2.5 text-sm font-medium dark:border-white/15">
            {uploading ? "Enviando..." : logoUrl ? "Trocar logo" : "Enviar logo"}
            <input type="file" accept="image/*" onChange={handleLogoChange} disabled={uploading} className="hidden" />
          </label>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Termo de responsabilidade (aparece no PDF)</label>
        <textarea
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          rows={5}
          className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-base outline-none focus:border-blue-600 dark:border-white/15"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-green-600">Salvo com sucesso.</p>}

      <button
        type="submit"
        disabled={saving || uploading}
        className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-base font-medium text-white disabled:opacity-60"
      >
        {saving ? "Salvando..." : "Salvar dados da empresa"}
      </button>
    </form>
  );
}

function ContaSection() {
  const { user } = useAuth();
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novoEmail, setNovoEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSalvar(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    if (!user?.email) return;
    if (!senhaAtual) {
      setError("Digite sua senha atual para confirmar a alteração.");
      return;
    }
    if (!novoEmail.trim() && !novaSenha) {
      setError("Preencha o novo e-mail e/ou a nova senha.");
      return;
    }

    setSaving(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, senhaAtual);
      await reauthenticateWithCredential(user, credential);

      if (novoEmail.trim() && novoEmail.trim() !== user.email) {
        await updateEmail(user, novoEmail.trim());
      }
      if (novaSenha) {
        await updatePassword(user, novaSenha);
      }

      setSenhaAtual("");
      setNovoEmail("");
      setNovaSenha("");
      setSaved(true);
    } catch (err) {
      if (err && typeof err === "object" && "code" in err && err.code === "auth/wrong-password") {
        setError("Senha atual incorreta.");
      } else {
        setError("Não foi possível atualizar. Tente novamente.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSalvar} className="space-y-3 border-t border-black/10 pt-4 dark:border-white/10">
      <h2 className="text-sm font-medium">Conta</h2>
      <p className="text-xs text-black/50 dark:text-white/50">E-mail atual: {user?.email}</p>

      <div className="space-y-1">
        <label className="text-sm font-medium">Senha atual</label>
        <input
          type="password"
          value={senhaAtual}
          onChange={(e) => setSenhaAtual(e.target.value)}
          autoComplete="current-password"
          className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-base outline-none focus:border-blue-600 dark:border-white/15"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Novo e-mail (opcional)</label>
        <input
          type="email"
          value={novoEmail}
          onChange={(e) => setNovoEmail(e.target.value)}
          className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-base outline-none focus:border-blue-600 dark:border-white/15"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Nova senha (opcional)</label>
        <input
          type="password"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
          autoComplete="new-password"
          className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-base outline-none focus:border-blue-600 dark:border-white/15"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-green-600">Conta atualizada com sucesso.</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-xl border border-black/15 px-4 py-2.5 text-base font-medium disabled:opacity-60 dark:border-white/15"
      >
        {saving ? "Salvando..." : "Atualizar conta"}
      </button>
    </form>
  );
}
