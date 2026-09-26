import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const alreadyInitialized = getApps().length > 0;
const app = alreadyInitialized ? getApps()[0]! : initializeApp(firebaseConfig);

export const auth = getAuth(app);
// Campos opcionais do wizard chegam como `undefined` (ex: senha numérica quando
// o cliente usou padrão de desenho) — sem isso o Firestore rejeita o write.
// Cache local persistente: dá pra ler/escrever offline (modo "Nuvem"
// também funciona sem internet no dia a dia) e sincroniza sozinho quando
// a conexão voltar.
export const db = alreadyInitialized
  ? getFirestore(app)
  : initializeFirestore(app, {
      ignoreUndefinedProperties: true,
      localCache: persistentLocalCache({ tabManager: persistentSingleTabManager({}) }),
    });
