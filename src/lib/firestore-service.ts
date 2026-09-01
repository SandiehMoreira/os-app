import {
  addDoc,
  collection,
  collectionGroup,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { STORE_ID } from "@/lib/constants";
import { SEED_BRANDS } from "@/lib/seed-data";
import type { Brand, Customer, Model, ServiceOrder } from "@/types/os";

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

export async function searchCustomersByPhone(phone: string): Promise<Customer[]> {
  const digits = onlyDigits(phone);
  if (digits.length < 4) return [];

  const q = query(
    collection(db, "customers"),
    where("telefoneBusca", ">=", digits),
    where("telefoneBusca", "<=", digits + ""),
    limit(10),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Customer);
}

export async function createCustomer(
  data: Omit<Customer, "id" | "storeId" | "telefoneBusca" | "createdAt">,
): Promise<Customer> {
  const payload = {
    ...data,
    storeId: STORE_ID,
    telefoneBusca: onlyDigits(data.telefone),
    createdAt: Date.now(),
  };
  const ref = await addDoc(collection(db, "customers"), payload);
  return { id: ref.id, ...payload };
}

async function seedBrands(): Promise<void> {
  for (const seedBrand of SEED_BRANDS) {
    const brandRef = await addDoc(collection(db, "brands"), {
      storeId: STORE_ID,
      nome: seedBrand.nome,
    });
    const batch = writeBatch(db);
    for (const model of seedBrand.models) {
      const modelRef = doc(collection(db, "brands", brandRef.id, "models"));
      batch.set(modelRef, model);
    }
    await batch.commit();
  }
}

export interface Catalog {
  brands: Brand[];
  modelsByBrand: Record<string, Model[]>;
}

let catalogCache: Catalog | null = null;

async function fetchCatalog(): Promise<Catalog> {
  const [brandsSnap, modelsSnap] = await Promise.all([
    getDocs(query(collection(db, "brands"), where("storeId", "==", STORE_ID))),
    getDocs(collectionGroup(db, "models")),
  ]);

  const brands = brandsSnap.docs
    .map((d) => ({ id: d.id, ...d.data() }) as Brand)
    .sort((a, b) => a.nome.localeCompare(b.nome));

  const modelsByBrand: Record<string, Model[]> = {};
  for (const d of modelsSnap.docs) {
    const brandId = d.ref.parent.parent!.id;
    (modelsByBrand[brandId] ??= []).push({ id: d.id, ...d.data() } as Model);
  }
  for (const brandId in modelsByBrand) {
    modelsByBrand[brandId].sort((a, b) => a.nome.localeCompare(b.nome));
  }

  return { brands, modelsByBrand };
}

export async function getCatalog(): Promise<Catalog> {
  if (catalogCache) return catalogCache;

  let catalog = await fetchCatalog();
  if (catalog.brands.length === 0) {
    await seedBrands();
    catalog = await fetchCatalog();
  }

  catalogCache = catalog;
  return catalog;
}

async function getNextOsNumber(): Promise<number> {
  const counterRef = doc(db, "counters", STORE_ID);
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef);
    const current = snap.exists() ? (snap.data().value as number) : 0;
    const next = current + 1;
    tx.set(counterRef, { value: next }, { merge: true });
    return next;
  });
}

export async function createServiceOrder(
  data: Omit<ServiceOrder, "id" | "storeId" | "number" | "createdAt" | "updatedAt">,
): Promise<ServiceOrder> {
  const number = await getNextOsNumber();
  const now = Date.now();
  const payload = { ...data, storeId: STORE_ID, number, createdAt: now, updatedAt: now };
  const ref = await addDoc(collection(db, "serviceOrders"), payload);
  return { id: ref.id, ...payload };
}

export async function getRecentServiceOrders(count = 20): Promise<ServiceOrder[]> {
  const snap = await getDocs(
    query(collection(db, "serviceOrders"), orderBy("createdAt", "desc"), limit(count)),
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ServiceOrder);
}
