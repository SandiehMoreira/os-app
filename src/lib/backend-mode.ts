const STORAGE_KEY = "os-app-backend";

export type BackendMode = "local" | "cloud";

export function getBackendMode(): BackendMode {
  if (typeof window === "undefined") return "cloud";
  return (localStorage.getItem(STORAGE_KEY) as BackendMode | null) ?? "cloud";
}

export function setBackendMode(mode: BackendMode): void {
  localStorage.setItem(STORAGE_KEY, mode);
}
