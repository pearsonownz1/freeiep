import "server-only";
import fs from "fs";
import path from "path";
import type { StoreData } from "./types";

const DATA_DIR = path.join(/*turbopackIgnore: true*/ process.cwd(), "data");
const STORE_PATH = path.join(/*turbopackIgnore: true*/ process.cwd(), "data", "store.json");

export function emptyStore(): StoreData {
  return { users: [], sessions: [], tokens: [], workspaces: [], students: [] };
}

export function readStore(): StoreData {
  if (!fs.existsSync(STORE_PATH)) return emptyStore();
  try {
    const raw = fs.readFileSync(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as StoreData;
    return {
      users: parsed.users ?? [],
      sessions: parsed.sessions ?? [],
      tokens: parsed.tokens ?? [],
      workspaces: parsed.workspaces ?? [],
      students: parsed.students ?? [],
    };
  } catch {
    return emptyStore();
  }
}

export function mutateStore<T>(fn: (store: StoreData) => T): T {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const store = readStore();
  const result = fn(store);
  const tmp = STORE_PATH + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(store, null, 2));
  fs.renameSync(tmp, STORE_PATH);
  return result;
}

export function uploadsDir(): string {
  const dir = path.join(/*turbopackIgnore: true*/ process.cwd(), "data", "uploads");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}
