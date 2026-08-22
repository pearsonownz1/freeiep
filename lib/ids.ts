export function nid(prefix = ""): string {
  const raw = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  return prefix ? `${prefix}_${raw}` : raw;
}

export function isoDate(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(date: string | Date, days: number): string {
  const d = typeof date === "string" ? new Date(date + "T12:00:00") : new Date(date);
  d.setDate(d.getDate() + days);
  return isoDate(d);
}

export function daysUntil(dueOn: string, now = new Date()): number {
  const due = new Date(dueOn + "T12:00:00");
  const start = new Date(isoDate(now) + "T12:00:00");
  return Math.round((due.getTime() - start.getTime()) / 86400000);
}
