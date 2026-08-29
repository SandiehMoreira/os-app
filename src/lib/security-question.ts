import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";

export const SECURITY_QUESTIONS = [
  "Qual o nome do seu primeiro animal de estimação?",
  "Qual a cidade onde você nasceu?",
  "Qual o nome de solteira da sua mãe?",
  "Qual foi o modelo do seu primeiro celular?",
  "Qual o nome do seu melhor amigo de infância?",
] as const;

export async function setSecurityQuestion(question: string, answer: string): Promise<void> {
  const fn = httpsCallable(functions, "setSecurityQuestion");
  await fn({ question, answer });
}

export async function getSecurityQuestion(email: string): Promise<string> {
  const fn = httpsCallable<{ email: string }, { question: string }>(
    functions,
    "getSecurityQuestion",
  );
  const result = await fn({ email });
  return result.data.question;
}

export async function resetPasswordWithAnswer(
  email: string,
  answer: string,
  newPassword: string,
): Promise<void> {
  const fn = httpsCallable(functions, "resetPasswordWithAnswer");
  await fn({ email, answer, newPassword });
}
