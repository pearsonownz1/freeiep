"use client";

import Link from "next/link";
import { exportMyData } from "@/lib/actions";

type Report = { id: string; from: string; to: string; published: boolean };

type Row = {
  id: string;
  name: string;
  lastName: string;
  grade: string;
  reports: Report[];
};

function downloadJson(json: string, filename: string) {
  const blob = new Blob([json], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function ExportHub({ students }: { students: Row[] }) {
  async function exportWorkspace() {
    const { json } = await exportMyData();
    downloadJson(json, "freeiep-export.json");
  }

  async function exportStudent(id: string, lastName: string) {
    const { json } = await exportMyData();
    const payload = JSON.parse(json) as { students?: { id: string }[] };
    const student = (payload.students ?? []).find((s) => s.id === id);
    downloadJson(JSON.stringify({ student }, null, 2), `${lastName.replace(/[^A-Za-z0-9_-]/g, "") || "student"}-export.json`);
  }

  return (
    <div>
      <h1 className="page-title text-[28px] leading-[1.2]">Export</h1>
      <p className="mt-1 text-ink-soft">
        Workspace JSON, one student JSON, plan PDF, and progress PDF. Not the official IEP.
      </p>

      <div className="card mt-6 p-5">
        <h2 className="font-sans text-[16px] font-semibold">Workspace</h2>
        <p className="mt-1 text-[15px] text-ink-soft">
          Students you can see, plus your user and school record. Same payload as Settings.
        </p>
        <button className="btn btn-secondary mt-3" type="button" onClick={exportWorkspace}>
          Download workspace JSON
        </button>
      </div>

      {students.length === 0 ? (
        <p className="mt-8 text-ink-soft">Add a student first. Then JSON and PDFs land here.</p>
      ) : (
        <ul className="card mt-4 divide-y divide-line overflow-hidden">
          {students.map((s) => (
            <li key={s.id} className="px-4 py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <Link href={`/app/students/${s.id}`} className="font-medium hover:underline">
                    {s.name}
                  </Link>
                  <p className="text-[13px] text-ink-soft">Grade {s.grade || "—"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="btn btn-secondary" type="button" onClick={() => exportStudent(s.id, s.lastName)}>
                    Student JSON
                  </button>
                  <a className="btn btn-secondary" href={`/api/pdf/plan/${s.id}`}>
                    Plan PDF
                  </a>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft">Progress PDF</p>
                {s.reports.length === 0 ? (
                  <p className="mt-1 text-[13px] text-ink-soft">
                    No report yet. Write one on the student progress tab.
                  </p>
                ) : (
                  <ul className="mt-1 space-y-1">
                    {s.reports.map((r) => (
                      <li key={r.id} className="flex flex-wrap items-center gap-2 text-[13px]">
                        <a className="link" href={`/api/pdf/progress/${r.id}`}>
                          {r.from} – {r.to}
                        </a>
                        {r.published ? <span className="text-ink-soft">Family can see</span> : <span className="text-ink-soft">Staff only</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-[13px] text-ink-soft">
        Also in{" "}
        <Link href="/app/settings" className="link">
          Settings
        </Link>
        . Records stay in this workspace until you delete a student.
      </p>
    </div>
  );
}
