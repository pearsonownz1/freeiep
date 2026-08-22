"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export type SearchStudent = {
  id: string;
  name: string;
  grade: string;
};

export function StaffSearch({ students }: { students: SearchStudent[] }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const hits = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return students.slice(0, 8);
    return students
      .filter((s) => s.name.toLowerCase().includes(needle) || s.grade.toLowerCase().includes(needle))
      .slice(0, 12);
  }, [q, students]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-11 w-full max-w-[420px] items-center justify-between rounded-[12px] border border-line bg-white px-3 text-left text-[14px] text-ink-soft"
      >
        <span>Search students</span>
        <kbd className="rounded-[6px] border border-line px-1.5 py-0.5 text-[11px] font-medium text-ink-soft">Ctrl+K</kbd>
      </button>
      {open ? (
        <div className="fixed inset-0 z-40 flex items-start justify-center bg-[rgb(28_25_23/0.35)] p-4 pt-[12vh]" onClick={() => setOpen(false)}>
          <div className="card w-full max-w-[520px] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <label className="sr-only" htmlFor="cmd-search">
              Filter students
            </label>
            <input
              id="cmd-search"
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter students"
              className="h-12 w-full border-b border-line bg-white px-4 text-[15px] outline-none"
            />
            <ul className="max-h-[360px] overflow-auto">
              {hits.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/app/students/${s.id}`}
                    className="flex items-center justify-between px-4 py-3 text-[14px] hover:bg-paper"
                    onClick={() => setOpen(false)}
                  >
                    <span className="font-medium text-ink">{s.name}</span>
                    <span className="text-[12px] text-ink-soft">Gr {s.grade}</span>
                  </Link>
                </li>
              ))}
              {!hits.length ? <li className="px-4 py-6 text-center text-[13px] text-ink-soft">No students match.</li> : null}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
