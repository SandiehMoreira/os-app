import { getBackendMode } from "@/lib/backend-mode";
import type { Catalog } from "@/lib/firestore-service";
import * as cloud from "@/lib/firestore-service";
import * as local from "@/lib/local-service";
import type { Customer, ServiceOrder, StoreSettings } from "@/types/os";

export type { Catalog };

export async function searchCustomersByPhone(phone: string): Promise<Customer[]> {
  return getBackendMode() === "local"
    ? local.searchCustomersByPhoneLocal(phone)
    : cloud.searchCustomersByPhone(phone);
}

export async function createCustomer(
  data: Omit<Customer, "id" | "storeId" | "telefoneBusca" | "createdAt">,
): Promise<Customer> {
  return getBackendMode() === "local"
    ? local.createCustomerLocal(data)
    : cloud.createCustomer(data);
}

export async function getCatalog(): Promise<Catalog> {
  return getBackendMode() === "local" ? local.getCatalogLocal() : cloud.getCatalog();
}

export async function createServiceOrder(
  data: Omit<ServiceOrder, "id" | "storeId" | "number" | "createdAt" | "updatedAt">,
): Promise<ServiceOrder> {
  return getBackendMode() === "local"
    ? local.createServiceOrderLocal(data)
    : cloud.createServiceOrder(data);
}

export async function getRecentServiceOrders(count = 20): Promise<ServiceOrder[]> {
  return getBackendMode() === "local"
    ? local.getRecentServiceOrdersLocal(count)
    : cloud.getRecentServiceOrders(count);
}

export async function getServiceOrder(id: string): Promise<ServiceOrder | null> {
  return getBackendMode() === "local"
    ? local.getServiceOrderLocal(id)
    : cloud.getServiceOrder(id);
}

export async function getStoreSettings(): Promise<StoreSettings> {
  return getBackendMode() === "local" ? local.getStoreSettingsLocal() : cloud.getStoreSettings();
}

export async function updateStoreSettings(patch: Partial<StoreSettings>): Promise<void> {
  return getBackendMode() === "local"
    ? local.updateStoreSettingsLocal(patch)
    : cloud.updateStoreSettings(patch);
}
