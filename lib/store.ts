import "server-only";
import fs from "fs";
import path from "path";
import type { StoreData } from "./types";

const DATA_DIR = path.join(/*turbopackIgnore: true*/ process.cwd(), "data");
const STORE_PATH = path.join(/*turbopackIgnore: true*/ process.cwd(), "data", "store.json");
const STORE_KEY = "store.json";
const UPLOADS_PREFIX = "uploads/";

function useBlobs(): boolean {
  return Boolean(process.env.NETLIFY || process.env.NETLIFY_BLOBS_CONTEXT);
}

export function emptyStore(): StoreData {
  return { users: [], sessions: [], tokens: [], workspaces: [], students: [] };
}

function normalize(parsed: StoreData): StoreData {
  return {
    users: parsed.users ?? [],
    sessions: parsed.sessions ?? [],
    tokens: parsed.tokens ?? [],
    workspaces: parsed.workspaces ?? [],
    students: parsed.students ?? [],
  };
}

async function blobStore() {
  const { getStore } = await import("@netlify/blobs");
  return getStore({ name: "freeiep", consistency: "strong" });
}

export async function readStore(): Promise<StoreData> {
  if (useBlobs()) {
    try {
      const store = await blobStore();
      const parsed = (await store.get(STORE_KEY, { type: "json" })) as StoreData | null;
      if (!parsed) return emptyStore();
      return normalize(parsed);
    } catch {
      return emptyStore();
    }
  }
  if (!fs.existsSync(STORE_PATH)) return emptyStore();
  try {
    const raw = fs.readFileSync(STORE_PATH, "utf8");
    return normalize(JSON.parse(raw) as StoreData);
  } catch {
    return emptyStore();
  }
}

export async function mutateStore<T>(fn: (store: StoreData) => T): Promise<T> {
  const store = await readStore();
  const result = fn(store);
  if (useBlobs()) {
    const blobs = await blobStore();
    await blobs.setJSON(STORE_KEY, store);
  } else {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    const tmp = STORE_PATH + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(store, null, 2));
    fs.renameSync(tmp, STORE_PATH);
  }
  return result;
}

export function uploadsDir(): string {
  const dir = path.join(/*turbopackIgnore: true*/ process.cwd(), "data", "uploads");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export async function writeUpload(storedName: string, buf: Buffer): Promise<void> {
  if (useBlobs()) {
    const blobs = await blobStore();
    await blobs.set(UPLOADS_PREFIX + storedName, buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer);
    return;
  }
  fs.writeFileSync(path.join(uploadsDir(), storedName), buf);
}

export async function readUpload(storedName: string): Promise<Buffer | null> {
  if (useBlobs()) {
    const blobs = await blobStore();
    const data = await blobs.get(UPLOADS_PREFIX + storedName, { type: "arrayBuffer" });
    if (!data) return null;
    return Buffer.from(data);
  }
  const filePath = path.join(uploadsDir(), storedName);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath);
}

export async function deleteUpload(storedName: string): Promise<void> {
  if (useBlobs()) {
    try {
      const blobs = await blobStore();
      await blobs.delete(UPLOADS_PREFIX + storedName);
    } catch {
      /* purge best-effort */
    }
    return;
  }
  try {
    fs.unlinkSync(path.join(uploadsDir(), storedName));
  } catch {
    /* purge best-effort */
  }
}
