import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "os-app-local";
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

export function getLocalDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("customers")) {
          db.createObjectStore("customers", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("serviceOrders")) {
          const store = db.createObjectStore("serviceOrders", { keyPath: "id" });
          store.createIndex("createdAt", "createdAt");
        }
        if (!db.objectStoreNames.contains("meta")) {
          db.createObjectStore("meta", { keyPath: "key" });
        }
      },
    });
  }
  return dbPromise;
}
