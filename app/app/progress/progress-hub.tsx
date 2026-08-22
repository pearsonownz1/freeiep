"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Field } from "@/components/ui";
import { logProgress } from "@/lib/actions";
import { formatDay } from "@/lib/format";
import { isoDate as todayIso } from "@/lib/ids";

export type HubGoal = {
  id: string;
  title: string;
  metric: string;
  target: string;
  unit: string;
};

export type HubNote = {
  id: string;
  goalId: string;
  date: string;
  value: number;
  note: string;
  photoId?: string;
};

export type HubReport = {
  id: string;
  createdAt: string;
  published: boolean;
};

export type HubStudent = {
  id: string;
  name: string;
  grade: string;
  goals: HubGoal[];
  notes: HubNote[];
  reports: HubReport[];
};

type Tab = "log" | "notes" | "goals" | "reports";

export function ProgressHub({
  students,
  kpis,
  canLog,
}: {
  students: HubStudent[];
  kpis: { withGoals: number; notes30: number; overdue: number };
  canLog: boolean;
}) {
  const [tab, setTab] = useState<Tab>("log");
  const tabs: { id: Tab; label: string }[] = [
    { id: "log", label: "Log" },
    { id: "notes", label: "All notes" },
    { id: "goals", label: "Goals" },
    { id: "reports", label: "Reports" },
  ];

  return (
    <div>
      <h1 className="page-title text-[28px] leading-[1.2]">Progress</h1>
      <p className="mt-1 text-ink-soft">A number on a goal, dated. Then a report when you write one.</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Kpi label="Students with goals" value={kpis.withGoals} />
        <Kpi label="Notes in 30 days" value={kpis.notes30} />
        <Kpi label="Overdue clocks" value={kpis.overdue} />
      </div>

      <div className="mt-6 flex flex-wrap gap-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-2 text-[13px] font-medium ${
              tab === t.id ? "bg-ink text-white" : "bg-white text-ink-soft ring-1 ring-line"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "log" ? <LogTab students={students} canLog={canLog} /> : null}
        {tab === "notes" ? <NotesTab students={students} /> : null}
        {tab === "goals" ? <GoalsTab students={students} /> : null}
        {tab === "reports" ? <ReportsTab students={students} /> : null}
      </div>
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

function LogTab({ students, canLog }: { students: HubStudent[]; canLog: boolean }) {
  const router = useRouter();
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const student = students.find((s) => s.id === studentId);
  const [goalId, setGoalId] = useState(student?.goals[0]?.id ?? "");
  const [msg, setMsg] = useState("");
  const goals = student?.goals ?? [];
  const selected = goals.find((g) => g.id === goalId) ?? goals[0];

  return (
    <form
      className="card space-y-4 p-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setMsg("");
        try {
          await logProgress(new FormData(e.currentTarget));
          setMsg("Saved.");
          e.currentTarget.reset();
          router.refresh();
        } catch (ex) {
          setMsg(ex instanceof Error ? ex.message : "Could not save.");
        }
      }}
    >
      <h2 className="font-sans text-[16px] font-semibold">Log progress</h2>
      {!canLog ? <p className="text-[13px] text-ink-soft">Staff can log a point on an assigned student.</p> : null}
      <input type="hidden" name="studentId" value={studentId} />
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Student">
          <select
            value={studentId}
            onChange={(e) => {
              const id = e.target.value;
              setStudentId(id);
              const next = students.find((s) => s.id === id);
              setGoalId(next?.goals[0]?.id ?? "");
            }}
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Goal">
          <select name="goalId" value={goalId} onChange={(e) => setGoalId(e.target.value)} required>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Date">
          <input type="date" name="date" defaultValue={todayIso()} />
        </Field>
        <Field label="Value">
          <input name="value" type="number" step="any" required />
        </Field>
      </div>
      <Field label="Note">
        <textarea name="note" />
      </Field>
      {selected ? (
        <p className="rounded-[8px] bg-paper px-3 py-2 text-[13px] text-ink-soft">
          Selected goal: {selected.title} · target {selected.target}
          {selected.unit ? ` ${selected.unit}` : ""}
        </p>
      ) : (
        <p className="text-[13px] text-ink-soft">This student has no goals yet. Write one on the plan first.</p>
      )}
      {msg ? <p className="text-[13px] text-ink-soft">{msg}</p> : null}
      <button className="btn btn-primary" type="submit" disabled={!goals.length}>
        Save point
      </button>
    </form>
  );
}

function NotesTab({ students }: { students: HubStudent[] }) {
  const rows = useMemo(() => {
    return students
      .flatMap((s) =>
        s.notes.map((n) => ({
          ...n,
          studentId: s.id,
          student: s.name,
          goal: s.goals.find((g) => g.id === n.goalId)?.title ?? "Goal",
        })),
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [students]);

  if (!rows.length) return <p className="text-ink-soft">No notes yet. Log a number on a goal.</p>;

  return (
    <ul className="card divide-y divide-line overflow-hidden">
      {rows.map((r) => (
        <li key={r.id} className="px-4 py-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <Link href={`/app/students/${r.studentId}?tab=progress`} className="font-medium hover:underline">
              {r.student}
            </Link>
            <span className="text-[12px] text-ink-soft tabular">{formatDay(r.date)}</span>
          </div>
          <p className="text-[13px] text-ink-soft">
            {r.goal} · {r.value}
            {r.note ? ` — ${r.note}` : ""}
          </p>
        </li>
      ))}
    </ul>
  );
}

function GoalsTab({ students }: { students: HubStudent[] }) {
  const rows = students.flatMap((s) => s.goals.map((g) => ({ s, g })));
  if (!rows.length) return <p className="text-ink-soft">No measurable goals on the caseload yet.</p>;
  return (
    <ul className="space-y-2">
      {rows.map(({ s, g }) => (
        <li key={`${s.id}-${g.id}`} className="card p-4">
          <div className="font-medium">{g.title}</div>
          <p className="text-[13px] text-ink-soft">
            {s.name} · target {g.target}
            {g.unit ? ` ${g.unit}` : ""}
          </p>
          <Link href={`/app/students/${s.id}?tab=progress`} className="mt-2 inline-block text-[13px] font-medium hover:underline">
            Open progress
          </Link>
        </li>
      ))}
    </ul>
  );
}

function ReportsTab({ students }: { students: HubStudent[] }) {
  const rows = students.flatMap((s) => s.reports.map((r) => ({ s, r })));
  return (
    <div className="space-y-4">
      <p className="text-[13px] text-ink-soft">
        Publish from the student progress tab. PDFs use the same reports already saved.
      </p>
      {rows.length ? (
        <ul className="card divide-y divide-line overflow-hidden">
          {rows.map(({ s, r }) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-[14px]">
              <span>
                {s.name} · {formatDay(r.createdAt)}
                {r.published ? " · family can see" : ""}
              </span>
              <div className="flex gap-3 text-[13px] font-medium">
                <a className="hover:underline" href={`/api/pdf/progress/${r.id}`}>
                  Progress PDF
                </a>
                <Link href={`/app/students/${s.id}?tab=progress`} className="hover:underline">
                  Publish
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-ink-soft">No reports yet.</p>
      )}
    </div>
  );
}
