import "server-only";
import { staffCanSeeStudent } from "./access";
import { currentUser } from "./auth";
import { readStore } from "./store";
import { studentName } from "./format";
import type { FamilyHubRow, FamilyInviteStatus, FileHubRow, NoticeHubRow, Student, User, Workspace } from "./types";

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

export async function familyHubRows(): Promise<FamilyHubRow[]> {
  const ctx = await staffContext();
  if (!ctx) return [];
  const store = await readStore();
  const students = store.students.filter((s) => staffCanSeeStudent(ctx.user, s));
  const now = Date.now();
  const owner = ctx.user.role === "owner";
  return students.map((s) => {
    const users = store.users.filter(
      (u) => u.role === "family" && u.studentId === s.id && u.workspaceId === s.workspaceId,
    );
    const pending = store.tokens.filter(
      (tok) =>
        tok.kind === "family_invite" &&
        tok.studentId === s.id &&
        !tok.usedAt &&
        tok.email &&
        new Date(tok.expiresAt).getTime() > now,
    );
    let inviteStatus: FamilyInviteStatus = "none";
    if (users.length) inviteStatus = "active";
    else if (pending.length) inviteStatus = "pending";
    else if ((s.revokedFamilyEmails ?? []).length) inviteStatus = "revoked";
    const lastPub = [...s.progressReports]
      .filter((r) => r.publishedToFamily)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
    return {
      id: s.id,
      name: studentName(s),
      grade: s.grade,
      inviteStatus,
      lastPublishedProgress: lastPub?.createdAt ?? null,
      unsignedNotices: s.notices.filter((n) => n.sentAt && !n.ackedAt).length,
      unconfirmedMeetings: s.meetings.filter((m) => m.status === "finding_time" || m.status === "drafted").length,
      inviteTokenId: pending[0]?.id ?? null,
      inviteEmail: pending[0]?.email ?? users[0]?.email ?? s.revokedFamilyEmails?.[0] ?? null,
      canRevoke: owner && (users.length > 0 || pending.length > 0),
    };
  });
}

export async function noticeHubRows(): Promise<NoticeHubRow[]> {
  const students = await workspaceStudents();
  const rows: NoticeHubRow[] = [];
  for (const s of students) {
    for (const n of s.notices) {
      rows.push({
        id: n.id,
        studentId: s.id,
        student: studentName(s),
        grade: s.grade,
        date: n.date,
        action: n.proposeOrRefuse,
        description: n.description,
        sent: Boolean(n.sentAt),
        acked: Boolean(n.ackedAt),
        sentAt: n.sentAt ?? null,
        ackedAt: n.ackedAt ?? null,
      });
    }
  }
  return rows.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

export async function fileHubRows(): Promise<FileHubRow[]> {
  const students = await workspaceStudents();
  const rows: FileHubRow[] = [];
  for (const s of students) {
    for (const d of s.documents ?? []) {
      rows.push({
        id: d.id,
        studentId: s.id,
        student: studentName(s),
        grade: s.grade,
        filename: d.filename,
        kind: d.kind,
        publishedToFamily: d.publishedToFamily,
        createdAt: d.createdAt,
      });
    }
  }
  return rows.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
}
