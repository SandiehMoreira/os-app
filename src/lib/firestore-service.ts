import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  setDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
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

// Cada login é a própria loja: todo dado mora debaixo de stores/{uid}/...,
// então o isolamento vem do próprio caminho do documento — não depende de
// nenhum filtro extra ter sido lembrado em cada consulta (foi exatamente
// esquecer um desses filtros, na versão anterior, que deixava um login ver
// os dados de outro). As regras do Firestore reforçam a mesma checagem no
// banco, então mesmo alguém tentando burlar a tela do app é bloqueado lá.
function getStoreId(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Usuário não autenticado.");
  return uid;
}

function storeCollection(...path: string[]) {
  return collection(db, "stores", getStoreId(), ...path);
}

function storeDoc(...path: string[]) {
  return doc(db, "stores", getStoreId(), ...path);
}

export async function searchCustomersByPhone(phone: string): Promise<Customer[]> {
  const digits = onlyDigits(phone);
  if (digits.length < 4) return [];

  const q = query(
    storeCollection("customers"),
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
    storeId: getStoreId(),
    telefoneBusca: onlyDigits(data.telefone),
    createdAt: Date.now(),
  };
  const ref = await addDoc(storeCollection("customers"), payload);
  return { id: ref.id, ...payload };
}

export async function getCustomer(id: string): Promise<Customer | null> {
  const snap = await getDoc(storeDoc("customers", id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Customer) : null;
}

export interface Catalog {
  brands: Brand[];
  modelsByBrand: Record<string, Model[]>;
}

interface CustomCatalogEntry {
  brandName: string;
  modelName: string;
  hasFaceId: boolean;
  hasTouchId: boolean;
  hasHomeButton: boolean;
}

// O catálogo padrão (SEED_BRANDS) já vem embutido no app — não depende de
// rede nem do Firestore pra aparecer, carrega na hora. Só as marcas/modelos
// que a própria loja cadastrar manualmente é que ficam guardados na nuvem
// (num único documento pequeno), e são mesclados por cima do catálogo
// padrão. Se a nuvem estiver fora do ar, a tela continua funcionando com o
// catálogo padrão — só as adições manuais da loja é que não aparecem até a
// conexão voltar.
function buildCatalog(customEntries: CustomCatalogEntry[]): Catalog {
  const brands: Brand[] = [];
  const modelsByBrand: Record<string, Model[]> = {};
  const brandIdByName = new Map<string, string>();

  SEED_BRANDS.forEach((seedBrand, brandIndex) => {
    const brandId = `seed-brand-${brandIndex}`;
    brandIdByName.set(seedBrand.nome, brandId);
    brands.push({ id: brandId, storeId: "", nome: seedBrand.nome });
    modelsByBrand[brandId] = seedBrand.models.map((model, modelIndex) => ({
      id: `seed-model-${brandIndex}-${modelIndex}`,
      ...model,
    }));
  });

  customEntries.forEach((entry, index) => {
    let brandId = brandIdByName.get(entry.brandName);
    if (!brandId) {
      brandId = `custom-brand-${index}`;
      brandIdByName.set(entry.brandName, brandId);
      brands.push({ id: brandId, storeId: "", nome: entry.brandName });
      modelsByBrand[brandId] = [];
    }
    modelsByBrand[brandId].push({
      id: `custom-model-${index}`,
      nome: entry.modelName,
      capacidades: [],
      hasFaceId: entry.hasFaceId,
      hasTouchId: entry.hasTouchId,
      hasHomeButton: entry.hasHomeButton,
    });
  });

  return { brands, modelsByBrand };
}

async function fetchCustomCatalogEntries(): Promise<CustomCatalogEntry[]> {
  const snap = await getDoc(storeDoc("meta", "customCatalog"));
  return snap.exists() ? ((snap.data().entries as CustomCatalogEntry[] | undefined) ?? []) : [];
}

let catalogCache: Catalog | null = null;

export async function getCatalog(): Promise<Catalog> {
  if (catalogCache) return catalogCache;

  try {
    const entries = await fetchCustomCatalogEntries();
    catalogCache = buildCatalog(entries);
  } catch {
    catalogCache = buildCatalog([]);
  }
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
  const entries = await fetchCustomCatalogEntries();
  const updated: CustomCatalogEntry[] = [
    ...entries,
    {
      brandName: input.brandName,
      modelName: input.modelName,
      hasFaceId: input.hasFaceId,
      hasTouchId: input.hasTouchId,
      hasHomeButton: input.hasHomeButton,
    },
  ];
  await setDoc(storeDoc("meta", "customCatalog"), { entries: updated });
  catalogCache = null;

  const catalog = buildCatalog(updated);
  const brand = catalog.brands.find((b) => b.nome === input.brandName)!;
  const models = catalog.modelsByBrand[brand.id];
  const model = models[models.length - 1];

  return { brandId: brand.id, brandName: brand.nome, modelId: model.id, modelName: model.nome };
}

async function getNextOsNumber(): Promise<number> {
  const counterRef = storeDoc("meta", "counter");
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
  const payload = { ...data, storeId: getStoreId(), number, createdAt: now, updatedAt: now };
  const ref = await addDoc(storeCollection("serviceOrders"), payload);
  return { id: ref.id, ...payload };
}

export async function getRecentServiceOrders(count = 20): Promise<ServiceOrder[]> {
  const snap = await getDocs(
    query(storeCollection("serviceOrders"), orderBy("createdAt", "desc"), limit(count)),
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ServiceOrder);
}

export async function getServiceOrder(id: string): Promise<ServiceOrder | null> {
  const snap = await getDoc(storeDoc("serviceOrders", id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as ServiceOrder) : null;
}

export async function updateServiceOrder(
  id: string,
  patch: Partial<Omit<ServiceOrder, "id" | "storeId" | "number" | "createdAt">>,
): Promise<void> {
  await setDoc(storeDoc("serviceOrders", id), { ...patch, updatedAt: Date.now() }, { merge: true });
}

const DEFAULT_STORE_SETTINGS: StoreSettings = {
  nomeEmpresa: "OS Assistência Técnica",
  termoResponsabilidade: TERMO_RESPONSABILIDADE_PADRAO,
  updatedAt: 0,
};

export async function getStoreSettings(): Promise<StoreSettings> {
  const snap = await getDoc(storeDoc("meta", "settings"));
  return snap.exists() ? (snap.data() as StoreSettings) : DEFAULT_STORE_SETTINGS;
}

export async function updateStoreSettings(patch: Partial<StoreSettings>): Promise<void> {
  await setDoc(storeDoc("meta", "settings"), { ...patch, updatedAt: Date.now() }, { merge: true });
}
