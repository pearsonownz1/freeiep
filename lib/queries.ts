import "server-only";
import { currentUser } from "./auth";
import { readStore } from "./store";
import type { Student, Workspace } from "./types";

export async function staffContext(): Promise<{
  user: NonNullable<Awaited<ReturnType<typeof currentUser>>>;
  workspace: Workspace;
} | null> {
  const user = await currentUser("staff");
  if (!user || user.role === "family") return null;
  if (!user.workspaceId) return null;
  const workspace = readStore().workspaces.find((w) => w.id === user.workspaceId);
  if (!workspace) return null;
  return { user, workspace };
}

export async function workspaceStudents(): Promise<Student[]> {
  const ctx = await staffContext();
  if (!ctx) return [];
  return readStore().students.filter((s) => s.workspaceId === ctx.workspace.id);
}

export async function getStudentForStaff(id: string): Promise<Student | null> {
  const ctx = await staffContext();
  if (!ctx) return null;
  const student = readStore().students.find((s) => s.id === id);
  if (!student || student.workspaceId !== ctx.workspace.id) return null;
  return student;
}

export async function getStudentForFamily(): Promise<Student | null> {
  const user = await currentUser("family");
  if (!user || !user.studentId) return null;
  return readStore().students.find((s) => s.id === user.studentId) ?? null;
}
