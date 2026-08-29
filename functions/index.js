const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");
const crypto = require("crypto");

initializeApp();

const REGION = "southamerica-east1";
const MAX_ATTEMPTS = 5;

function hashAnswer(answer) {
  return crypto.createHash("sha256").update(answer.trim().toLowerCase()).digest("hex");
}

function normalizeEmail(email) {
  return (email || "").trim().toLowerCase();
}

exports.setSecurityQuestion = onCall({ region: REGION }, async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Você precisa estar logado.");
  }
  const question = (request.data?.question || "").trim();
  const answer = request.data?.answer || "";
  if (!question || !answer) {
    throw new HttpsError("invalid-argument", "Preencha a pergunta e a resposta.");
  }

  const email = normalizeEmail(request.auth.token.email);
  await getFirestore().collection("securityAnswers").doc(email).set({
    uid: request.auth.uid,
    email,
    question,
    answerHash: hashAnswer(answer),
    failedAttempts: 0,
    updatedAt: Date.now(),
  });

  return { success: true };
});

exports.getSecurityQuestion = onCall({ region: REGION }, async (request) => {
  const email = normalizeEmail(request.data?.email);
  if (!email) {
    throw new HttpsError("invalid-argument", "E-mail é obrigatório.");
  }

  const snap = await getFirestore().collection("securityAnswers").doc(email).get();
  if (!snap.exists) {
    throw new HttpsError("not-found", "Não encontramos uma conta com esse e-mail.");
  }

  return { question: snap.data().question };
});

exports.resetPasswordWithAnswer = onCall({ region: REGION }, async (request) => {
  const email = normalizeEmail(request.data?.email);
  const answer = request.data?.answer || "";
  const newPassword = request.data?.newPassword || "";

  if (!email || !answer || !newPassword) {
    throw new HttpsError("invalid-argument", "Preencha todos os campos.");
  }
  if (newPassword.length < 6) {
    throw new HttpsError(
      "invalid-argument",
      "A nova senha precisa ter pelo menos 6 caracteres.",
    );
  }

  const db = getFirestore();
  const docRef = db.collection("securityAnswers").doc(email);
  const snap = await docRef.get();
  if (!snap.exists) {
    throw new HttpsError("not-found", "Não encontramos uma conta com esse e-mail.");
  }

  const data = snap.data();
  const attempts = data.failedAttempts || 0;
  if (attempts >= MAX_ATTEMPTS) {
    throw new HttpsError(
      "resource-exhausted",
      "Muitas tentativas erradas. Peça para um administrador redefinir sua senha.",
    );
  }

  if (hashAnswer(answer) !== data.answerHash) {
    await docRef.update({ failedAttempts: attempts + 1 });
    throw new HttpsError("permission-denied", "Resposta incorreta.");
  }

  await getAuth().updateUser(data.uid, { password: newPassword });
  await docRef.update({ failedAttempts: 0 });

  return { success: true };
});
