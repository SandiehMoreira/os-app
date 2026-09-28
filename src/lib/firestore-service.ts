import {
  addDoc,
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { STORE_ID } from "@/lib/constants";
import { SEED_BRANDS } from "@/lib/seed-data";
import {
  TERMO_RESPONSABILIDADE_PADRAO,
  type Brand,
  type Customer,
  type Model,
  type ServiceOrder,
  type StoreSettings,
} from "@/types/os";

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

// Mantém as marcas mais procuradas (Apple, Samsung, Motorola, Xiaomi...)
// no topo da lista, na mesma ordem do seed. Marcas cadastradas manualmente
// (fora do seed) ficam depois, em ordem alfabética.
const SEED_BRAND_ORDER = new Map(SEED_BRANDS.map((b, i) => [b.nome, i]));

function sortBrands(brands: Brand[]): Brand[] {
  return [...brands].sort((a, b) => {
    const orderA = SEED_BRAND_ORDER.get(a.nome) ?? Number.MAX_SAFE_INTEGER;
    const orderB = SEED_BRAND_ORDER.get(b.nome) ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    return a.nome.localeCompare(b.nome);
  });
}

// Mesma ideia para os modelos dentro de cada marca: mantém os mais
// recentes (na ordem definida no seed) no topo; modelos cadastrados
// manualmente ficam depois, em ordem alfabética.
const SEED_MODEL_ORDER = new Map(
  SEED_BRANDS.map((b) => [b.nome, new Map(b.models.map((m, i) => [m.nome, i]))]),
);

function sortModels(models: Model[], brandName: string | undefined): Model[] {
  const order = brandName ? SEED_MODEL_ORDER.get(brandName) : undefined;
  return [...models].sort((a, b) => {
    const orderA = order?.get(a.nome) ?? Number.MAX_SAFE_INTEGER;
    const orderB = order?.get(b.nome) ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) return orderA - orderB;
    return a.nome.localeCompare(b.nome);
  });
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

// Garante que todas as marcas/modelos do seed existam — cria as que
// faltam e completa modelos novos em marcas que já existiam, sem tocar
// em nada que a loja tenha cadastrado manualmente. Reusa o catálogo já
// buscado (evita ficar lendo a subcoleção de cada marca de novo).
async function syncSeedBrands(catalog: Catalog): Promise<boolean> {
  let changed = false;
  const existingByName = new Map(catalog.brands.map((b) => [b.nome, b]));

  for (const seedBrand of SEED_BRANDS) {
    const brand = existingByName.get(seedBrand.nome);

    if (!brand) {
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
      changed = true;
      continue;
    }

    const existingModelNames = new Set((catalog.modelsByBrand[brand.id] ?? []).map((m) => m.nome));
    const missingModels = seedBrand.models.filter((m) => !existingModelNames.has(m.nome));
    if (missingModels.length > 0) {
      const batch = writeBatch(db);
      for (const model of missingModels) {
        const modelRef = doc(collection(db, "brands", brand.id, "models"));
        batch.set(modelRef, model);
      }
      await batch.commit();
      changed = true;
    }
  }

  return changed;
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

  const brands = sortBrands(brandsSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Brand));

  const modelsByBrand: Record<string, Model[]> = {};
  for (const d of modelsSnap.docs) {
    const brandId = d.ref.parent.parent!.id;
    (modelsByBrand[brandId] ??= []).push({ id: d.id, ...d.data() } as Model);
  }
  const brandNameById = new Map(brands.map((b) => [b.id, b.nome]));
  for (const brandId in modelsByBrand) {
    modelsByBrand[brandId] = sortModels(modelsByBrand[brandId], brandNameById.get(brandId));
  }

  return { brands, modelsByBrand };
}

export async function getCatalog(): Promise<Catalog> {
  if (catalogCache) return catalogCache;

  const catalog = await fetchCatalog();
  const changed = await syncSeedBrands(catalog);

  catalogCache = changed ? await fetchCatalog() : catalog;
  return catalogCache;
}

export async function addCustomBrandModel(input: {
  brandId?: string;
  brandName: string;
  modelName: string;
  hasFaceId: boolean;
  hasTouchId: boolean;
  hasHomeButton: boolean;
}): Promise<{ brandId: string; brandName: string; modelId: string; modelName: string }> {
  let brandId = input.brandId;

  if (!brandId) {
    const brandRef = await addDoc(collection(db, "brands"), {
      storeId: STORE_ID,
      nome: input.brandName,
    });
    brandId = brandRef.id;
  }

  const modelRef = await addDoc(collection(db, "brands", brandId, "models"), {
    nome: input.modelName,
    capacidades: [],
    hasFaceId: input.hasFaceId,
    hasTouchId: input.hasTouchId,
    hasHomeButton: input.hasHomeButton,
  });

  catalogCache = null;

  return { brandId, brandName: input.brandName, modelId: modelRef.id, modelName: input.modelName };
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

export async function getServiceOrder(id: string): Promise<ServiceOrder | null> {
  const snap = await getDoc(doc(db, "serviceOrders", id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as ServiceOrder) : null;
}

const DEFAULT_STORE_SETTINGS: StoreSettings = {
  nomeEmpresa: "OS Assistência Técnica",
  termoResponsabilidade: TERMO_RESPONSABILIDADE_PADRAO,
  updatedAt: 0,
};

export async function getStoreSettings(): Promise<StoreSettings> {
  const snap = await getDoc(doc(db, "settings", STORE_ID));
  return snap.exists() ? (snap.data() as StoreSettings) : DEFAULT_STORE_SETTINGS;
}

export async function updateStoreSettings(patch: Partial<StoreSettings>): Promise<void> {
  await setDoc(
    doc(db, "settings", STORE_ID),
    { ...patch, updatedAt: Date.now() },
    { merge: true },
  );
}
