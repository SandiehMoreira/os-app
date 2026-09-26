"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { sendPasswordReset } from "@/lib/password-reset";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await sendPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar o e-mail.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-full flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4 rounded-2xl border border-black/10 p-6 dark:border-white/10">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-semibold">Recuperar senha</h1>
          <p className="text-sm text-black/60 dark:text-white/60">
            Enviamos um link por e-mail para você trocar a senha.
          </p>
        </div>

        {sent ? (
          <div className="space-y-4 text-center">
            <p className="text-sm">
              Se existir uma conta com o e-mail <strong>{email}</strong>, um link de
              redefinição de senha foi enviado. Confere sua caixa de entrada (e o spam).
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-base outline-none focus:border-blue-600 dark:border-white/15"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-base font-medium text-white disabled:opacity-60"
            >
              {submitting ? "Enviando..." : "Enviar link de recuperação"}
            </button>
          </form>
        )}

        <Link
          href="/login"
          className="block text-center text-sm text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white"
        >
          Voltar para o login
        </Link>
      </div>
    </div>
  );
}
