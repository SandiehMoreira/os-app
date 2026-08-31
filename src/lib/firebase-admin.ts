import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Painéis de hospedagem (Netlify/Vercel) guardam o valor colado ao pé da
// letra — se alguém colar com aspas em volta (comum ao copiar de um .env),
// isso quebra o parsing do PEM. Normaliza para aceitar os dois formatos.
function normalizePrivateKey(key: string | undefined): string | undefined {
  if (!key) return undefined;
  let value = key.trim();
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }
  return value.replace(/\\n/g, "\n");
}

const app = getApps().length
  ? getApps()[0]!
  : initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: normalizePrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY),
      }),
    });

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
