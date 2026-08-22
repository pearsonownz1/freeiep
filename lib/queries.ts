import "server-only";
import { staffCanSeeStudent } from "./access";
import { currentUser } from "./auth";
import { readStore } from "./store";
import type { Student, User, Workspace } from "./types";

export async function staffContext(): Promise<{
  user: NonNullable<Awaited<ReturnType<typeof currentUser>>>;
  workspace: Workspace;
} | null> {
  const user = await currentUser("staff");
  if (!user || user.role === "family") return null;
  if (!user.workspaceId) return null;
  const workspace = (await readStore()).workspaces.find((w) => w.id === user.workspaceId);
  if (!workspace) return null;
  return { user, workspace };
}

export async function workspaceStudents(): Promise<Student[]> {
  const ctx = await staffContext();
  if (!ctx) return [];
  return (await readStore()).students.filter((s) => staffCanSeeStudent(ctx.user, s));
}

export async function getStudentForStaff(id: string): Promise<Student | null> {
  const ctx = await staffContext();
  if (!ctx) return null;
  const student = (await readStore()).students.find((s) => s.id === id);
  if (!student || !staffCanSeeStudent(ctx.user, student)) return null;
  return student;
}

export async function getStudentForFamily(): Promise<Student | null> {
  const user = await currentUser("family");
  if (!user || !user.studentId) return null;
  const student = (await readStore()).students.find((s) => s.id === user.studentId);
  if (!student) return null;
  if ((student.revokedFamilyEmails ?? []).includes(user.email)) return null;
  if (user.workspaceId && student.workspaceId !== user.workspaceId) return null;
  return student;
}

export async function familyAccessForStudent(studentId: string): Promise<{
  users: User[];
  pending: { email: string; tokenId: string }[];
}> {
  const ctx = await staffContext();
  if (!ctx) return { users: [], pending: [] };
  const store = await readStore();
  const student = store.students.find((s) => s.id === studentId);
  if (!student || !staffCanSeeStudent(ctx.user, student)) return { users: [], pending: [] };
  const users = store.users.filter(
    (u) => u.role === "family" && u.studentId === studentId && u.workspaceId === student.workspaceId,
  );
  const now = Date.now();
  const pending = store.tokens
    .filter(
      (tok) =>
        tok.kind === "family_invite" &&
        tok.studentId === studentId &&
        !tok.usedAt &&
        tok.email &&
        new Date(tok.expiresAt).getTime() > now,
    )
    .map((tok) => ({ email: tok.email!, tokenId: tok.id }));
  return { users, pending };
}

export async function workspaceMembers(): Promise<User[]> {
  const ctx = await staffContext();
  if (!ctx) return [];
  return (await readStore()).users.filter(
    (u) => u.workspaceId === ctx.workspace.id && u.role !== "family",
  );
}

export async function workspaceFamily(): Promise<User[]> {
  const ctx = await staffContext();
  if (!ctx) return [];
  return (await readStore()).users.filter(
    (u) => u.workspaceId === ctx.workspace.id && u.role === "family" && !!u.studentId,
  );
}
