import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { hashAnswer, normalizeEmail } from "@/lib/security-answer-hash";

const MAX_ATTEMPTS = 5;

export async function POST(request: Request) {
  const { email, answer, newPassword } = await request.json();

  if (!email?.trim() || !answer?.trim() || !newPassword) {
    return NextResponse.json({ error: "Preencha todos os campos." }, { status: 400 });
  }
  if (newPassword.length < 6) {
    return NextResponse.json(
      { error: "A nova senha precisa ter pelo menos 6 caracteres." },
      { status: 400 },
    );
  }

  try {
    const docRef = adminDb.collection("securityAnswers").doc(normalizeEmail(email));
    const snap = await docRef.get();
    if (!snap.exists) {
      return NextResponse.json(
        { error: "Não encontramos uma conta com esse e-mail." },
        { status: 404 },
      );
    }

    const data = snap.data()!;
    const attempts = data.failedAttempts ?? 0;
    if (attempts >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { error: "Muitas tentativas erradas. Peça para um administrador redefinir sua senha." },
        { status: 429 },
      );
    }

    if (hashAnswer(answer) !== data.answerHash) {
      await docRef.update({ failedAttempts: attempts + 1 });
      return NextResponse.json({ error: "Resposta incorreta." }, { status: 403 });
    }

    await adminAuth.updateUser(data.uid, { password: newPassword });
    await docRef.update({ failedAttempts: 0 });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: `Erro interno: ${message}` }, { status: 500 });
  }
}
