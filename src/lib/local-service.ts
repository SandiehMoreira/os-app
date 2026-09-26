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

let catalogCache: Catalog | null = null;

export async function getCatalogLocal(): Promise<Catalog> {
  if (catalogCache) return catalogCache;

  const brands: Catalog["brands"] = [];
  const modelsByBrand: Record<string, Model[]> = {};

  SEED_BRANDS.forEach((seedBrand, brandIndex) => {
    const brandId = `local-brand-${brandIndex}`;
    brands.push({ id: brandId, storeId: STORE_ID, nome: seedBrand.nome });
    modelsByBrand[brandId] = seedBrand.models.map((model, modelIndex) => ({
      id: `local-model-${brandIndex}-${modelIndex}`,
      ...model,
    }));
  });

  catalogCache = { brands, modelsByBrand };
  return catalogCache;
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
