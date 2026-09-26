import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

export async function sendPasswordReset(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (err) {
    if (err && typeof err === "object" && "code" in err && err.code === "auth/user-not-found") {
      throw new Error("Não encontramos uma conta com esse e-mail.");
    }
    throw new Error("Não foi possível enviar o e-mail de recuperação. Tente novamente.");
  }
}
