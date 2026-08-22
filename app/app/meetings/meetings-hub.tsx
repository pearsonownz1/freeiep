"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { formatDay, formatWhen } from "@/lib/format";

export type MeetingRow = {
  id: string;
  studentId: string;
  student: string;
  grade: string;
  type: string;
  status: string;
  when: string | null;
  attendees: string;
  waiting: number;
};

export function MeetingsHub({
  rows,
  students,
  kpis,
  canPropose,
}: {
  rows: MeetingRow[];
  students: { id: string; name: string }[];
  kpis: { upcoming: number; finding: number; confirmed: number };
  canPropose: boolean;
}) {
  const [view, setView] = useState<"table" | "calendar">("table");
  const [q, setQ] = useState("");
  const [newOpen, setNewOpen] = useState(false);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (r) =>
        r.student.toLowerCase().includes(needle) ||
        r.type.toLowerCase().includes(needle) ||
        r.status.toLowerCase().includes(needle),
    );
  }, [q, rows]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title text-[28px] leading-[1.2]">Meetings</h1>
          <p className="mt-1 text-ink-soft">Times across the caseload. Propose on a student. No surveys.</p>
        </div>
        {canPropose ? (
          <button className="btn btn-primary" type="button" onClick={() => setNewOpen(true)}>
            New meeting
          </button>
        ) : (
          <p className="text-[13px] text-ink-soft">The case manager proposes times.</p>
        )}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Kpi label="Upcoming" value={kpis.upcoming} />
        <Kpi label="Finding time" value={kpis.finding} />
        <Kpi label="Confirmed" value={kpis.confirmed} />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name"
          className="h-11 min-w-[200px] flex-1 rounded-[12px] border border-line bg-white px-3 text-[14px]"
        />
        <div className="flex rounded-[12px] border border-line bg-white p-1 text-[13px] font-medium">
          <button
            type="button"
            onClick={() => setView("table")}
            className={`rounded-[8px] px-3 py-1.5 ${view === "table" ? "bg-ink text-white" : "text-ink-soft"}`}
          >
            Table
          </button>
          <button
            type="button"
            onClick={() => setView("calendar")}
            className={`rounded-[8px] px-3 py-1.5 ${view === "calendar" ? "bg-ink text-white" : "text-ink-soft"}`}
          >
            Calendar
          </button>
        </div>
        <Link href="/app/calendar" className="btn btn-secondary">
          Clocks
        </Link>
      </div>

      {view === "table" ? <Table rows={filtered} /> : <Cal rows={filtered} />}

      {newOpen ? (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-[rgb(28_25_23/0.4)] p-4" onClick={() => setNewOpen(false)}>
          <div className="card w-full max-w-md space-y-3 p-5" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-sans text-[16px] font-semibold">New meeting</h2>
            <p className="text-[13px] text-ink-soft">Opens the existing propose flow on that student.</p>
            <ul className="max-h-[280px] space-y-1 overflow-auto">
              {students.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/app/students/${s.id}?tab=meetings`}
                    className="block rounded-[8px] px-3 py-2 text-[14px] hover:bg-paper"
                  >
                    {s.name}
                  </Link>
                </li>
              ))}
              {!students.length ? (
                <li className="text-[13px] text-ink-soft">
                  <Link href="/app/students" className="link">
                    Add a student first
                  </Link>
                </li>
              ) : null}
            </ul>
            <button className="btn btn-secondary" type="button" onClick={() => setNewOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-4">
      <div className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-soft">{label}</div>
      <div className="mt-1 font-serif text-[28px] font-semibold tabular">{value}</div>
    </div>
  );
}

function Table({ rows }: { rows: MeetingRow[] }) {
  if (!rows.length) return <p className="mt-8 text-ink-soft">No meetings yet. Propose times on a student.</p>;
  return (
    <div className="card mt-4 overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-[14px]">
        <thead className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
          <tr className="border-b border-line">
            <th className="px-4 py-3">Student</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">When</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Attendees</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-line last:border-0">
              <td className="px-4 py-3">
                <Link href={`/app/students/${r.studentId}?tab=meetings`} className="font-medium hover:underline">
                  {r.student}
                </Link>
                <div className="text-[12px] text-ink-soft">Gr {r.grade}</div>
              </td>
              <td className="px-4 py-3 capitalize">{r.type}</td>
              <td className="px-4 py-3 text-[13px]">{r.when ? formatWhen(r.when) : "—"}</td>
              <td className="px-4 py-3 capitalize">{r.status.replace("_", " ")}</td>
              <td className="max-w-[200px] truncate px-4 py-3 text-[13px] text-ink-soft">
                {r.attendees}
                {r.waiting ? ` · ${r.waiting} waiting` : ""}
              </td>
              <td className="px-4 py-3">
                <Link href={`/app/students/${r.studentId}?tab=meetings`} className="text-[13px] font-medium hover:underline">
                  Open
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Cal({ rows }: { rows: MeetingRow[] }) {
  const groups = useMemo(() => {
    const map = new Map<string, MeetingRow[]>();
    for (const r of rows) {
      const key = r.when ? r.when.slice(0, 10) : "unscheduled";
      const list = map.get(key) ?? [];
      list.push(r);
      map.set(key, list);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [rows]);

  if (!groups.length) return <p className="mt-8 text-ink-soft">No meeting times on the calendar.</p>;

  return (
    <ul className="mt-4 space-y-3">
      {groups.map(([day, items]) => (
        <li key={day} className="card p-4">
          <div className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
            {day === "unscheduled" ? "Unscheduled" : formatDay(day)}
          </div>
          <ul className="mt-2 space-y-1">
            {items.map((r) => (
              <li key={r.id} className="flex flex-wrap justify-between gap-2 text-[14px]">
                <Link href={`/app/students/${r.studentId}?tab=meetings`} className="font-medium hover:underline">
                  {r.student}
                </Link>
                <span className="text-[13px] text-ink-soft capitalize">
                  {r.type} · {r.status.replace("_", " ")}
                </span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
