import type { Activity, Goal, Metric } from "./types";
import { METRIC_LABELS } from "./types";

export function studentName(s: { firstName: string; lastName: string }): string {
  return `${s.firstName} ${s.lastName}`.trim();
}

export function lastnameFilename(lastName: string, kind: string, date: string): string {
  const safe = lastName.replace(/[^A-Za-z0-9_-]/g, "") || "Student";
  return `${safe}_${kind}_${date}.pdf`;
}

export function metricSentence(goal: Goal): string {
  const unit = goal.unit || METRIC_LABELS[goal.metric];
  if (goal.metric === "percent_accuracy") {
    return `${goal.target}% accuracy${goal.title ? ` on ${goal.title}` : ""}.`.replace(" on " + goal.title + ".", ` — ${goal.title}.`);
  }
  return `${goal.target} ${unit}. ${goal.title}`.trim();
}

export function plainLanguagePoint(goal: Goal, value: number): string {
  const targetNum = Number(String(goal.target).replace(/[^0-9.]/g, ""));
  switch (goal.metric) {
    case "percent_accuracy":
      return `${value} of 100 percent correct`;
    case "wcpm":
      if (Number.isFinite(targetNum) && targetNum > 0) {
        return `${value} of ${targetNum} words correct`;
      }
      return `${value} words correct per minute`;
    case "trials":
      if (Number.isFinite(targetNum) && targetNum > 0) {
        return `${value} of ${targetNum} trials`;
      }
      return `${value} trials`;
    case "count":
      if (Number.isFinite(targetNum) && targetNum > 0) {
        return `${value} of ${targetNum}`;
      }
      return `${String(value)} ${goal.unit || "counted"}`;
    case "rubric":
      return `score of ${value}${Number.isFinite(targetNum) ? ` (aiming for ${targetNum})` : ""}`;
    default:
      return `${value} ${goal.unit || METRIC_LABELS[goal.metric]}`;
  }
}

export function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", {
    timeZone: "America/Chicago",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDay(date: string): string {
  const d = new Date(date.includes("T") ? date : date + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    timeZone: "America/Chicago",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export const METRICS: Metric[] = [
  "percent_accuracy",
  "wcpm",
  "trials",
  "rubric",
  "count",
  "custom",
];

export function activityCopy(a: Activity): string {
  const who = a.who.includes("@") ? a.who.split("@")[0] : a.who;
  return `${who} ${a.verb} ${a.object}`.replace(/\s+/g, " ").trim();
}
