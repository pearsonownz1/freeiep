import type { Clock, ClockTone, Student } from "./types";
import { daysUntil } from "./ids";

export function clockTone(clock: Clock): ClockTone {
  if (clock.done) return "done";
  const days = daysUntil(clock.dueOn);
  if (days < 0) return "overdue";
  if (days <= 14) return "due_soon";
  return "on_track";
}

export function nextClock(student: Student): Clock | null {
  const open = student.clocks.filter((c) => !c.done);
  if (!open.length) return null;
  return [...open].sort((a, b) => a.dueOn.localeCompare(b.dueOn))[0];
}

export function urgencyScore(student: Student): number {
  const open = student.clocks.filter((c) => !c.done);
  if (!open.length) return 99999;
  return Math.min(...open.map((c) => daysUntil(c.dueOn)));
}

export function sortCaseload<T extends Student>(students: T[]): T[] {
  return [...students].sort((a, b) => {
    const ua = urgencyScore(a);
    const ub = urgencyScore(b);
    if (ua !== ub) return ua - ub;
    return `${a.lastName}${a.firstName}`.localeCompare(`${b.lastName}${b.firstName}`);
  });
}
