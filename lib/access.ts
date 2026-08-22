import type { Student, User } from "./types";

export function actorName(user: { name?: string; email: string }): string {
  if (user.name?.trim()) return user.name.trim();
  const local = user.email.split("@")[0] || user.email;
  if (local === "demo") return "Demo teacher";
  if (local === "teammate") return "Team member";
  return local;
}

export function staffCanSeeStudent(user: User, student: Student): boolean {
  if (user.role === "family") return false;
  if (!user.workspaceId || student.workspaceId !== user.workspaceId) return false;
  if (user.role === "owner") return true;
  return (user.assignedStudentIds ?? []).includes(student.id);
}

export function isOwner(user: User): boolean {
  return user.role === "owner";
}

export function isMember(user: User): boolean {
  return user.role === "member";
}
