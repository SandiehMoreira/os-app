import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

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

let app: App | null = null;

// Inicialização preguiçosa (só na primeira requisição): se rodar no topo do
// módulo e `cert()` lançar (ex: env var ausente nesse runtime específico),
// o erro acontece antes de qualquer try/catch da rota conseguir capturá-lo,
// e a resposta vira um 500 vazio sem pista nenhuma do motivo.
function getAdminApp(): App {
  if (app) return app;
  if (getApps().length) {
    app = getApps()[0]!;
    return app;
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = normalizePrivateKey(process.env.FIREBASE_ADMIN_PRIVATE_KEY);

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      `Variáveis do Admin SDK ausentes neste ambiente (projectId=${!!projectId}, clientEmail=${!!clientEmail}, privateKey=${!!privateKey})`,
    );
  }

  app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  return app;
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}
