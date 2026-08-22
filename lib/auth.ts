import "server-only";
import { cookies } from "next/headers";
import { nid } from "./ids";
import { mutateStore, readStore } from "./store";
import type { Session, Token, TokenKind, User } from "./types";

const STAFF_COOKIE = "freeiep_session";
const FAMILY_COOKIE = "freeiep_family";
const TOKEN_DAYS = 14;
const SESSION_DAYS = 30;

function expiry(days: number): string {
  return new Date(Date.now() + days * 86400000).toISOString();
}

export function appOrigin(): string {
  return process.env.APP_ORIGIN || "http://localhost:3002";
}

export async function createMagicToken(input: {
  kind: TokenKind;
  email?: string;
  userId?: string;
  studentId?: string;
  meetingId?: string;
  slotId?: string;
  workspaceId?: string;
}): Promise<{ token: Token; url: string }> {
  const token: Token = {
    id: nid("tok"),
    kind: input.kind,
    email: input.email?.trim().toLowerCase(),
    userId: input.userId,
    studentId: input.studentId,
    meetingId: input.meetingId,
    slotId: input.slotId,
    workspaceId: input.workspaceId,
    expiresAt: expiry(TOKEN_DAYS),
  };
  mutateStore((s) => {
    s.tokens.push(token);
  });
  const path =
    input.kind === "login"
      ? `/login?token=${token.id}`
      : `/r/${token.id}`;
  const url = `${appOrigin()}${path}`;
  console.log(`[FreeIEP] ${input.kind} link for ${input.email ?? "guest"}: ${url}`);
  return { token, url };
}

export function getToken(id: string): Token | null {
  const t = readStore().tokens.find((x) => x.id === id);
  if (!t) return null;
  if (new Date(t.expiresAt).getTime() < Date.now()) return null;
  return t;
}

export async function consumeToken(id: string): Promise<Token | null> {
  return mutateStore((s) => {
    const t = s.tokens.find((x) => x.id === id);
    if (!t) return null;
    if (new Date(t.expiresAt).getTime() < Date.now()) return null;
    t.usedAt = new Date().toISOString();
    return { ...t };
  });
}

export async function setSession(userId: string, kind: "staff" | "family") {
  const session: Session = {
    id: nid("ses"),
    userId,
    createdAt: new Date().toISOString(),
    expiresAt: expiry(SESSION_DAYS),
    kind,
  };
  mutateStore((s) => {
    s.sessions.push(session);
  });
  const jar = await cookies();
  jar.set(kind === "staff" ? STAFF_COOKIE : FAMILY_COOKIE, session.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
  });
}

export async function clearSession(kind: "staff" | "family" | "both" = "both") {
  const jar = await cookies();
  if (kind === "staff" || kind === "both") jar.delete(STAFF_COOKIE);
  if (kind === "family" || kind === "both") jar.delete(FAMILY_COOKIE);
}

export async function currentUser(kind: "staff" | "family" | "any" = "any"): Promise<User | null> {
  const jar = await cookies();
  const store = readStore();
  const ids: string[] = [];
  if (kind === "staff" || kind === "any") {
    const v = jar.get(STAFF_COOKIE)?.value;
    if (v) ids.push(v);
  }
  if (kind === "family" || kind === "any") {
    const v = jar.get(FAMILY_COOKIE)?.value;
    if (v) ids.push(v);
  }
  for (const id of ids) {
    const ses = store.sessions.find((s) => s.id === id);
    if (!ses) continue;
    if (new Date(ses.expiresAt).getTime() < Date.now()) continue;
    if (kind !== "any" && ses.kind !== kind) continue;
    const user = store.users.find((u) => u.id === ses.userId);
    if (user) return user;
  }
  return null;
}

export function upsertUser(email: string, patch: Partial<User> = {}): User {
  const normalized = email.trim().toLowerCase();
  return mutateStore((s) => {
    let user = s.users.find((u) => u.email === normalized);
    if (!user) {
      user = {
        id: nid("usr"),
        email: normalized,
        role: patch.role ?? "owner",
        workspaceId: patch.workspaceId ?? null,
        createdAt: new Date().toISOString(),
        ...patch,
      };
      user.email = normalized;
      s.users.push(user);
    } else {
      Object.assign(user, patch, { email: normalized });
    }
    return { ...user };
  });
}

export function findUser(id: string): User | undefined {
  return readStore().users.find((u) => u.id === id);
}
