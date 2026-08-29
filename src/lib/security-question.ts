import { auth } from "@/lib/firebase";

export const SECURITY_QUESTIONS = [
  "Qual o nome do seu primeiro animal de estimação?",
  "Qual a cidade onde você nasceu?",
  "Qual o nome de solteira da sua mãe?",
  "Qual foi o modelo do seu primeiro celular?",
  "Qual o nome do seu melhor amigo de infância?",
] as const;

async function parseErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    return data.error ?? fallback;
  } catch {
    return fallback;
  }
}

export async function setSecurityQuestion(question: string, answer: string): Promise<void> {
  const idToken = await auth.currentUser?.getIdToken();
  if (!idToken) throw new Error("Não autenticado.");

  const res = await fetch("/api/auth/set-security-question", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ question, answer }),
  });

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Não foi possível salvar a pergunta de segurança."));
  }
}

export async function getSecurityQuestion(email: string): Promise<string> {
  const res = await fetch("/api/auth/security-question", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Não encontramos uma conta com esse e-mail."));
  }

  const data = await res.json();
  return data.question as string;
}

export async function resetPasswordWithAnswer(
  email: string,
  answer: string,
  newPassword: string,
): Promise<void> {
  const res = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, answer, newPassword }),
  });

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res, "Não foi possível trocar a senha."));
  }
}
