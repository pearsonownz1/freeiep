import "server-only";
import { cookies } from "next/headers";
import { nid } from "./ids";
import { mutateStore, readStore } from "./store";
import { ensureAutoDemoMaya, isAutoDemoWorkspace, mayaNeedsDemoFamilyInvite, sampleStudents, seedDemoFamilyInvite } from "./sample";
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
  studentIds?: string[];
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
    studentIds: input.studentIds,
    meetingId: input.meetingId,
    slotId: input.slotId,
    workspaceId: input.workspaceId,
    expiresAt: expiry(TOKEN_DAYS),
  };
  await mutateStore((s) => {
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

export async function getToken(id: string): Promise<Token | null> {
  const t = (await readStore()).tokens.find((x) => x.id === id);
  if (!t) return null;
  if (new Date(t.expiresAt).getTime() < Date.now()) return null;
  return t;
}

export async function consumeToken(id: string): Promise<Token | null> {
  return await mutateStore((s) => {
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
  await mutateStore((s) => {
    s.sessions.push(session);
  });
  const jar = await cookies();
  jar.set(kind === "staff" ? STAFF_COOKIE : FAMILY_COOKIE, session.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 86400,
    secure: process.env.NETLIFY === "true" || process.env.NODE_ENV === "production",
  });
}

export async function clearSession(kind: "staff" | "family" | "both" = "both") {
  const jar = await cookies();
  if (kind === "staff" || kind === "both") jar.delete(STAFF_COOKIE);
  if (kind === "family" || kind === "both") jar.delete(FAMILY_COOKIE);
}

const DEMO_EMAIL = "demo@freeiep.app";

async function ensureDemoStaff(): Promise<User> {
  const user = await mutateStore((s) => {
    let user = s.users.find((u) => u.email === DEMO_EMAIL && u.role !== "family");
    if (!user) {
      user = {
        id: nid("usr"),
        email: DEMO_EMAIL,
        name: "Demo teacher",
        role: "owner",
        workspaceId: nid("ws"),
        createdAt: new Date().toISOString(),
        acceptedLegalAt: new Date().toISOString(),
      };
      s.users.push(user);
    }
    if (!user.workspaceId) user.workspaceId = nid("ws");
    if (!user.acceptedLegalAt) user.acceptedLegalAt = new Date().toISOString();
    let ws = s.workspaces.find((w) => w.id === user!.workspaceId);
    if (!ws) {
      ws = {
        id: user.workspaceId,
        name: "Demo",
        state: "OR",
        ownerId: user.id,
        createdAt: new Date().toISOString(),
      };
      s.workspaces.push(ws);
    } else {
      if (!ws.name) ws.name = "Demo";
      if (!ws.state) ws.state = "OR";
    }
    if (user.workspaceId) {
      if (isAutoDemoWorkspace(ws, user.email)) {
        ensureAutoDemoMaya(s, user.workspaceId);
      } else if (!s.students.some((st) => st.workspaceId === user.workspaceId)) {
        s.students.push(...sampleStudents(user.workspaceId, user.email));
      }
      seedDemoFamilyInvite(s, user.workspaceId);
    }
    return { ...user };
  });
  return user;
}

async function maybeFixAutoDemoMaya(user: User) {
  if (user.email !== DEMO_EMAIL || user.role !== "owner" || !user.workspaceId) return;
  const store = await readStore();
  const ws = store.workspaces.find((w) => w.id === user.workspaceId);
  if (user.workspaceId) {
    const inviteNeeded = mayaNeedsDemoFamilyInvite(store, user.workspaceId);
    if (inviteNeeded && !isAutoDemoWorkspace(ws, user.email)) {
      await mutateStore((s) => {
        seedDemoFamilyInvite(s, user.workspaceId!);
      });
      return;
    }
  }
  if (!isAutoDemoWorkspace(ws, user.email)) return;
  const maya = store.students.find(
    (st) => st.workspaceId === user.workspaceId && st.firstName === "Maya" && st.lastName === "Rivera",
  );
  const g1 = maya?.iepPlan.goals[0];
  const g2 = maya?.iepPlan.goals[1];
  const needs =
    !maya ||
    !maya.iepPlan.goals.length ||
    !maya.activity.some((a) => a.object.includes("Goal 1")) ||
    !maya.activity.some((a) => a.object.includes("Goal 2")) ||
    !g1 ||
    !maya.dataPoints.some((p) => p.goalId === g1.id && p.value === 72) ||
    Boolean(g2 && !maya.dataPoints.some((p) => p.goalId === g2.id && p.value === 80)) ||
    !maya.notices?.length ||
    mayaNeedsDemoFamilyInvite(store, user.workspaceId);
  if (!needs) return;
  await mutateStore((s) => {
    ensureAutoDemoMaya(s, user.workspaceId!);
  });
}

export async function currentUser(kind: "staff" | "family" | "any" = "any"): Promise<User | null> {
  const jar = await cookies();
  const store = await readStore();
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
    if (user) {
      await maybeFixAutoDemoMaya(user);
      return user;
    }
  }
  if (kind === "family") return null;
  return ensureDemoStaff();
}

export async function upsertUser(email: string, patch: Partial<User> = {}): Promise<User> {
  const normalized = email.trim().toLowerCase();
  return await mutateStore((s) => {
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
      const incomingIds = patch.assignedStudentIds;
      const nextRole = patch.role;
      const keepOwner = user.role === "owner" && nextRole === "member";
      Object.assign(user, patch, { email: normalized });
      if (keepOwner) user.role = "owner";
      if (incomingIds) {
        user.assignedStudentIds = [...new Set([...(user.assignedStudentIds ?? []), ...incomingIds])];
      }
    }
    return { ...user };
  });
}

export async function findUser(id: string): Promise<User | undefined> {
  return (await readStore()).users.find((u) => u.id === id);
}
