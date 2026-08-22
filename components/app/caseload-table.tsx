"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ClockPill } from "@/components/clock-pill";
import type { Clock } from "@/lib/types";

export type StudentRow = {
  id: string;
  name: string;
  grade: string;
  lastActivity: string;
  clock: Clock | null;
  overdue?: boolean;
  hasMeeting?: boolean;
};

export function CaseloadTable({
  rows,
  query = "",
  showSearch = true,
}: {
  rows: StudentRow[];
  query?: string;
  showSearch?: boolean;
}) {
  const [q, setQ] = useState(query);
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [meetingOnly, setMeetingOnly] = useState(false);
  const [grade, setGrade] = useState("");
  const grades = useMemo(
    () => [...new Set(rows.map((r) => r.grade).filter(Boolean))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })),
    [rows],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (overdueOnly && !r.overdue) return false;
      if (meetingOnly && !r.hasMeeting) return false;
      if (grade && r.grade !== grade) return false;
      if (!needle) return true;
      return (
        r.name.toLowerCase().includes(needle) ||
        r.grade.toLowerCase().includes(needle) ||
        r.lastActivity.toLowerCase().includes(needle)
      );
    });
  }, [q, rows, overdueOnly, meetingOnly, grade]);

  return (
    <div className="card overflow-hidden">
      {showSearch ? (
        <div className="space-y-3 border-b border-line px-4 py-3">
          <label className="sr-only" htmlFor="caseload-filter">
            Search students
          </label>
          <input
            id="caseload-filter"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or grade"
            className="h-11 w-full rounded-[12px] border border-line bg-white px-3 text-[14px]"
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="pill bg-meadow-soft text-meadow">Active</span>
            <button
              type="button"
              onClick={() => setOverdueOnly((v) => !v)}
              className={`pill ${overdueOnly ? "bg-berry-soft text-berry" : "bg-paper text-ink-soft"}`}
            >
              Overdue
            </button>
            <button
              type="button"
              onClick={() => setMeetingOnly((v) => !v)}
              className={`pill ${meetingOnly ? "bg-sun-soft text-sun" : "bg-paper text-ink-soft"}`}
            >
              Has meeting
            </button>
            <label className="sr-only" htmlFor="caseload-grade">
              Grade
            </label>
            <select
              id="caseload-grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="h-8 rounded-full border border-line bg-white px-3 text-[12px] font-medium"
            >
              <option value="">All grades</option>
              {grades.map((g) => (
                <option key={g} value={g}>
                  Grade {g}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : null}
      {filtered.length === 0 ? (
        <p className="px-4 py-8 text-center text-[14px] text-ink-soft">No students match.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[14px]">
            <thead className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
              <tr className="border-b border-line">
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Grade</th>
                <th className="px-4 py-3 font-semibold">Next clock</th>
                <th className="px-4 py-3 font-semibold">Last activity</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <Link href={`/app/students/${r.id}`} className="font-serif text-[17px] font-semibold hover:underline">
                      {r.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">{r.grade}</td>
                  <td className="px-4 py-3">
                    {r.clock ? <ClockPill clock={r.clock} /> : <span className="text-[12px] text-ink-soft">No clocks</span>}
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-[13px] text-ink-soft">{r.lastActivity || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2 text-[13px] font-medium">
                      <Link href={`/app/students/${r.id}`} className="text-ink hover:underline">
                        Open
                      </Link>
                      <Link href={`/app/students/${r.id}?tab=progress`} className="text-ink hover:underline">
                        Log
                      </Link>
                      <Link href={`/app/students/${r.id}?tab=meetings`} className="text-ink hover:underline">
                        Meeting
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
