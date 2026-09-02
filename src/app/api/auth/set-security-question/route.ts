import { NextResponse } from "next/server";
import { getAdminAuth, getAdminDb } from "@/lib/firebase-admin";
import { hashAnswer, normalizeEmail } from "@/lib/security-answer-hash";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!idToken) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  try {
    const adminAuth = getAdminAuth();
    const adminDb = getAdminDb();

    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
    }

    const { question, answer } = await request.json();
    if (!question?.trim() || !answer?.trim()) {
      return NextResponse.json({ error: "Preencha a pergunta e a resposta." }, { status: 400 });
    }

    const email = normalizeEmail(decoded.email ?? "");
    await adminDb.collection("securityAnswers").doc(email).set({
      uid: decoded.uid,
      email,
      question: question.trim(),
      answerHash: hashAnswer(answer),
      failedAttempts: 0,
      updatedAt: Date.now(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: `Erro interno: ${message}` }, { status: 500 });
  }
}
