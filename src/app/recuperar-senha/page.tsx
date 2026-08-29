"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { getSecurityQuestion, resetPasswordWithAnswer } from "@/lib/security-question";

export default function RecuperarSenhaPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "resposta" | "sucesso">("email");
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleBuscarPergunta(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const q = await getSecurityQuestion(email);
      setQuestion(q);
      setStep("resposta");
    } catch {
      setError("Não encontramos uma conta com esse e-mail.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTrocarSenha(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setSubmitting(true);
    try {
      await resetPasswordWithAnswer(email, answer, newPassword);
      setStep("sucesso");
    } catch {
      setError("Resposta incorreta ou muitas tentativas. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-full flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-4 rounded-2xl border border-black/10 p-6 dark:border-white/10">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-semibold">Recuperar senha</h1>
        </div>

        {step === "email" && (
          <form onSubmit={handleBuscarPergunta} className="space-y-4">
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
              {submitting ? "Buscando..." : "Continuar"}
            </button>
          </form>
        )}

        {step === "resposta" && (
          <form onSubmit={handleTrocarSenha} className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">{question}</p>
              <input
                type="text"
                required
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Sua resposta"
                className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-base outline-none focus:border-blue-600 dark:border-white/15"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="newPassword" className="text-sm font-medium">
                Nova senha
              </label>
              <input
                id="newPassword"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-base outline-none focus:border-blue-600 dark:border-white/15"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmar nova senha
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-base outline-none focus:border-blue-600 dark:border-white/15"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-base font-medium text-white disabled:opacity-60"
            >
              {submitting ? "Trocando..." : "Trocar senha"}
            </button>
          </form>
        )}

        {step === "sucesso" && (
          <div className="space-y-4 text-center">
            <p className="text-sm">Senha alterada com sucesso.</p>
            <button
              type="button"
              onClick={() => router.replace("/login")}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-base font-medium text-white"
            >
              Ir para o login
            </button>
          </div>
        )}

        {step !== "sucesso" && (
          <Link
            href="/login"
            className="block text-center text-sm text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white"
          >
            Voltar para o login
          </Link>
        )}
      </div>
    </div>
  );
}
