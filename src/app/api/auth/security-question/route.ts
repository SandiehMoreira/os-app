import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { normalizeEmail } from "@/lib/security-answer-hash";

export async function POST(request: Request) {
  const { email } = await request.json();
  if (!email?.trim()) {
    return NextResponse.json({ error: "E-mail é obrigatório." }, { status: 400 });
  }

  const snap = await adminDb
    .collection("securityAnswers")
    .doc(normalizeEmail(email))
    .get();

  if (!snap.exists) {
    return NextResponse.json(
      { error: "Não encontramos uma conta com esse e-mail." },
      { status: 404 },
    );
  }

  return NextResponse.json({ question: snap.data()!.question });
}
