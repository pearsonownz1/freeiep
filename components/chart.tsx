import type { DataPoint, Goal } from "@/lib/types";

export function GoalChart({
  goal,
  points,
}: {
  goal: Goal;
  points: DataPoint[];
}) {
  const w = 360;
  const h = 140;
  const pad = 28;
  const sorted = [...points].sort((a, b) => a.date.localeCompare(b.date));
  const baseline = Number(String(goal.baseline).replace(/[^0-9.]/g, ""));
  const target = Number(String(goal.target).replace(/[^0-9.]/g, ""));
  const values = sorted.map((p) => p.value);
  if (Number.isFinite(baseline)) values.push(baseline);
  if (Number.isFinite(target)) values.push(target);
  const min = Math.min(0, ...values);
  const max = Math.max(100, ...values, 1);
  const span = max - min || 1;
  const y = (v: number) => pad + ((max - v) / span) * (h - pad * 2);
  const x = (i: number, n: number) => pad + (n <= 1 ? (w - pad * 2) / 2 : (i / (n - 1)) * (w - pad * 2));
  const path = sorted
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i, sorted.length)} ${y(p.value)}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-md" role="img" aria-label={`Progress for ${goal.title}`}>
      {Number.isFinite(baseline) ? (
        <line
          x1={pad}
          x2={w - pad}
          y1={y(baseline)}
          y2={y(baseline)}
          stroke="#57534E"
          strokeDasharray="4 4"
          strokeWidth="1.5"
        />
      ) : null}
      {Number.isFinite(target) ? (
        <line x1={pad} x2={w - pad} y1={y(target)} y2={y(target)} stroke="#C45C26" strokeWidth="1.5" />
      ) : null}
      {path ? <path d={path} fill="none" stroke="#2F6B4F" strokeWidth="2" /> : null}
      {sorted.map((p, i) => (
        <circle key={p.id} cx={x(i, sorted.length)} cy={y(p.value)} r="4" fill="#2F6B4F">
          <title>
            {p.date}: {p.value}
            {p.note ? ` — ${p.note}` : ""}
          </title>
        </circle>
      ))}
    </svg>
  );
}
