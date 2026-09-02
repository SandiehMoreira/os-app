import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { normalizeEmail } from "@/lib/security-answer-hash";

export async function POST(request: Request) {
  const { email } = await request.json();
  if (!email?.trim()) {
    return NextResponse.json({ error: "E-mail é obrigatório." }, { status: 400 });
  }

  try {
    const adminDb = getAdminDb();
    const snap = await adminDb.collection("securityAnswers").doc(normalizeEmail(email)).get();

    if (!snap.exists) {
      return NextResponse.json(
        { error: "Não encontramos uma conta com esse e-mail." },
        { status: 404 },
      );
    }

    return NextResponse.json({ question: snap.data()!.question });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    return NextResponse.json({ error: `Erro interno: ${message}` }, { status: 500 });
  }
}
