"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PwnForm, DISTRICT_NOTICE_DISCLAIMER } from "@/components/app/pwn-form";
import { formatDay, formatWhen } from "@/lib/format";
import type { NoticeHubRow } from "@/lib/types";

export function NoticesHub({
  rows,
  students,
  kpis,
  canSend,
}: {
  rows: NoticeHubRow[];
  students: { id: string; name: string }[];
  kpis: { sent: number; waiting: number; acked: number };
  canSend: boolean;
}) {
  const [q, setQ] = useState("");
  const [newOpen, setNewOpen] = useState(false);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (r) =>
        r.student.toLowerCase().includes(needle) ||
        r.description.toLowerCase().includes(needle) ||
        r.action.toLowerCase().includes(needle),
    );
  }, [q, rows]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title text-[28px] leading-[1.2]">Notices</h1>
          <p className="mt-1 text-ink-soft">Written notice across the caseload. You type it. The family acks it.</p>
        </div>
        {canSend ? (
          <button className="btn btn-primary" type="button" onClick={() => setNewOpen(true)}>
            New notice
          </button>
        ) : (
          <p className="text-[13px] text-ink-soft">The case manager sends notices.</p>
        )}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Kpi label="Sent" value={kpis.sent} />
        <Kpi label="Waiting on family" value={kpis.waiting} />
        <Kpi label="Acknowledged" value={kpis.acked} />
      </div>

      <div className="mt-6">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by student or description"
          className="h-11 w-full rounded-[12px] border border-line bg-white px-3 text-[14px]"
        />
      </div>

      <Table rows={filtered} />

      <p className="mt-6 text-[12px] text-ink-soft">{DISTRICT_NOTICE_DISCLAIMER}</p>

      {newOpen && canSend ? (
        <div
          className="fixed inset-0 z-20 flex items-center justify-center bg-[rgb(28_25_23/0.4)] p-4"
          onClick={() => setNewOpen(false)}
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-auto" onClick={(e) => e.stopPropagation()}>
            <PwnForm students={students} />
            <div className="mt-2 flex justify-end">
              <button className="btn btn-secondary" type="button" onClick={() => setNewOpen(false)}>
                Cancel
              </button>
            </div>
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

function Table({ rows }: { rows: NoticeHubRow[] }) {
  if (!rows.length) {
    return <p className="mt-8 text-ink-soft">No notices yet. Send a written notice on a student.</p>;
  }
  return (
    <div className="card mt-4 overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-[14px]">
        <thead className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
          <tr className="border-b border-line">
            <th className="px-4 py-3">Student</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Notice</th>
            <th className="px-4 py-3">Sent</th>
            <th className="px-4 py-3">Acked</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-line last:border-0">
              <td className="px-4 py-3">
                <Link href={`/app/students/${r.studentId}?tab=notice`} className="font-medium hover:underline">
                  {r.student}
                </Link>
                <div className="text-[12px] text-ink-soft">Gr {r.grade}</div>
              </td>
              <td className="px-4 py-3 text-[13px]">{formatDay(r.date)}</td>
              <td className="max-w-[280px] px-4 py-3 text-[13px]">
                <div className="capitalize text-ink-soft">We {r.action}</div>
                <div className="truncate">{r.description}</div>
              </td>
              <td className="px-4 py-3 text-[13px]">{r.sentAt ? formatWhen(r.sentAt) : "—"}</td>
              <td className="px-4 py-3">
                {r.acked ? (
                  <span className="pill bg-meadow-soft text-meadow">Acked</span>
                ) : r.sent ? (
                  <span className="pill bg-sun-soft text-sun">Waiting</span>
                ) : (
                  <span className="pill bg-paper text-ink-soft">Draft</span>
                )}
                {r.ackedAt ? <div className="mt-1 text-[12px] text-ink-soft">{formatWhen(r.ackedAt)}</div> : null}
              </td>
              <td className="px-4 py-3">
                <Link href={`/app/students/${r.studentId}?tab=notice`} className="text-[13px] font-medium hover:underline">
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
