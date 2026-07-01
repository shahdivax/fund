import type { FundDatabase } from "./types";
import { STORAGE_KEY } from "./types";
import { createSeedDatabase } from "./seed";

export function loadDatabase(): FundDatabase {
  if (typeof window === "undefined") {
    return createSeedDatabase();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = createSeedDatabase();
      saveDatabase(seeded);
      return seeded;
    }
    const parsed = JSON.parse(raw) as FundDatabase;
    if (parsed.version !== 1) {
      const seeded = createSeedDatabase();
      saveDatabase(seeded);
      return seeded;
    }
    return parsed;
  } catch {
    const seeded = createSeedDatabase();
    saveDatabase(seeded);
    return seeded;
  }
}

export function saveDatabase(db: FundDatabase): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}
