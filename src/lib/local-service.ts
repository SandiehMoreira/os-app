import { STORE_ID } from "@/lib/constants";
import type { Catalog } from "@/lib/firestore-service";
import { getLocalDb } from "@/lib/local-db";
import { SEED_BRANDS } from "@/lib/seed-data";
import {
  TERMO_RESPONSABILIDADE_PADRAO,
  type Customer,
  type Model,
  type ServiceOrder,
  type StoreSettings,
} from "@/types/os";

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function uuid(): string {
  return crypto.randomUUID();
}

export async function searchCustomersByPhoneLocal(phone: string): Promise<Customer[]> {
  const digits = onlyDigits(phone);
  if (digits.length < 4) return [];

  const db = await getLocalDb();
  const all = (await db.getAll("customers")) as Customer[];
  return all.filter((c) => c.telefoneBusca.startsWith(digits)).slice(0, 10);
}

export async function createCustomerLocal(
  data: Omit<Customer, "id" | "storeId" | "telefoneBusca" | "createdAt">,
): Promise<Customer> {
  const db = await getLocalDb();
  const customer: Customer = {
    ...data,
    id: uuid(),
    storeId: STORE_ID,
    telefoneBusca: onlyDigits(data.telefone),
    createdAt: Date.now(),
  };
  await db.put("customers", customer);
  return customer;
}

export async function getCustomerLocal(id: string): Promise<Customer | null> {
  const db = await getLocalDb();
  const customer = (await db.get("customers", id)) as Customer | undefined;
  return customer ?? null;
}

interface CustomCatalogEntry {
  brandName: string;
  modelName: string;
  hasFaceId: boolean;
  hasTouchId: boolean;
  hasHomeButton: boolean;
}

async function getCustomCatalogEntries(): Promise<CustomCatalogEntry[]> {
  const db = await getLocalDb();
  const record = (await db.get("meta", "customCatalog")) as
    | { value: CustomCatalogEntry[] }
    | undefined;
  return record?.value ?? [];
}

async function saveCustomCatalogEntry(entry: CustomCatalogEntry): Promise<void> {
  const current = await getCustomCatalogEntries();
  const db = await getLocalDb();
  await db.put("meta", { key: "customCatalog", value: [...current, entry] });
}

let catalogCache: Catalog | null = null;

export async function getCatalogLocal(): Promise<Catalog> {
  if (catalogCache) return catalogCache;

  const custom = await getCustomCatalogEntries();
  const brands: Catalog["brands"] = [];
  const modelsByBrand: Record<string, Model[]> = {};
  const brandIdByName = new Map<string, string>();

  SEED_BRANDS.forEach((seedBrand, brandIndex) => {
    const brandId = `local-brand-${brandIndex}`;
    brandIdByName.set(seedBrand.nome, brandId);
    brands.push({ id: brandId, storeId: STORE_ID, nome: seedBrand.nome });
    modelsByBrand[brandId] = seedBrand.models.map((model, modelIndex) => ({
      id: `local-model-${brandIndex}-${modelIndex}`,
      ...model,
    }));
  });

  custom.forEach((entry, index) => {
    let brandId = brandIdByName.get(entry.brandName);
    if (!brandId) {
      brandId = `custom-brand-${index}`;
      brandIdByName.set(entry.brandName, brandId);
      brands.push({ id: brandId, storeId: STORE_ID, nome: entry.brandName });
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

  catalogCache = { brands, modelsByBrand };
  return catalogCache;
}

export async function addCustomBrandModelLocal(input: {
  brandId?: string;
  brandName: string;
  modelName: string;
  hasFaceId: boolean;
  hasTouchId: boolean;
  hasHomeButton: boolean;
}): Promise<{ brandId: string; brandName: string; modelId: string; modelName: string }> {
  await saveCustomCatalogEntry({
    brandName: input.brandName,
    modelName: input.modelName,
    hasFaceId: input.hasFaceId,
    hasTouchId: input.hasTouchId,
    hasHomeButton: input.hasHomeButton,
  });
  catalogCache = null;

  const catalog = await getCatalogLocal();
  const brand = catalog.brands.find((b) => b.nome === input.brandName)!;
  const models = catalog.modelsByBrand[brand.id];
  const model = models[models.length - 1];

  return { brandId: brand.id, brandName: brand.nome, modelId: model.id, modelName: model.nome };
}

async function getNextOsNumberLocal(): Promise<number> {
  const db = await getLocalDb();
  const tx = db.transaction("meta", "readwrite");
  const store = tx.objectStore("meta");
  const current = ((await store.get("counter")) as { value: number } | undefined)?.value ?? 0;
  const next = current + 1;
  await store.put({ key: "counter", value: next });
  await tx.done;
  return next;
}

export async function createServiceOrderLocal(
  data: Omit<ServiceOrder, "id" | "storeId" | "number" | "createdAt" | "updatedAt">,
): Promise<ServiceOrder> {
  const number = await getNextOsNumberLocal();
  const now = Date.now();
  const order: ServiceOrder = {
    ...data,
    id: uuid(),
    storeId: STORE_ID,
    number,
    createdAt: now,
    updatedAt: now,
  };
  const db = await getLocalDb();
  await db.put("serviceOrders", order);
  return order;
}

export async function getRecentServiceOrdersLocal(count = 20): Promise<ServiceOrder[]> {
  const db = await getLocalDb();
  const all = (await db.getAllFromIndex("serviceOrders", "createdAt")) as ServiceOrder[];
  return all.reverse().slice(0, count);
}

export async function getServiceOrderLocal(id: string): Promise<ServiceOrder | null> {
  const db = await getLocalDb();
  const order = (await db.get("serviceOrders", id)) as ServiceOrder | undefined;
  return order ?? null;
}

export async function updateServiceOrderLocal(
  id: string,
  patch: Partial<Omit<ServiceOrder, "id" | "storeId" | "number" | "createdAt">>,
): Promise<void> {
  const db = await getLocalDb();
  const existing = (await db.get("serviceOrders", id)) as ServiceOrder | undefined;
  if (!existing) return;
  await db.put("serviceOrders", { ...existing, ...patch, updatedAt: Date.now() });
}

const DEFAULT_STORE_SETTINGS: StoreSettings = {
  nomeEmpresa: "OS Assistência Técnica",
  termoResponsabilidade: TERMO_RESPONSABILIDADE_PADRAO,
  updatedAt: 0,
};

export async function getStoreSettingsLocal(): Promise<StoreSettings> {
  const db = await getLocalDb();
  const record = (await db.get("meta", "settings")) as { value: StoreSettings } | undefined;
  return record?.value ?? DEFAULT_STORE_SETTINGS;
}

export async function updateStoreSettingsLocal(patch: Partial<StoreSettings>): Promise<void> {
  const current = await getStoreSettingsLocal();
  const db = await getLocalDb();
  await db.put("meta", {
    key: "settings",
    value: { ...current, ...patch, updatedAt: Date.now() },
  });
}
