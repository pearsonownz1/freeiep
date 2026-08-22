"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { FamilyPill, FamilySwitch, Field } from "@/components/ui";
import { deleteFile, setFilePublished, uploadFile } from "@/lib/actions";
import { formatWhen } from "@/lib/format";
import type { FileHubRow } from "@/lib/types";

const KIND_LABEL: Record<string, string> = {
  file: "File",
  eval: "Eval",
  iep: "IEP",
  notice: "Notice",
  "progress-photo": "Progress photo",
};

function kindLabel(kind: string) {
  return KIND_LABEL[kind] || kind.replace(/[-_]/g, " ");
}

export function FilesHub({
  rows,
  students,
  canUpload,
  kpis,
}: {
  rows: FileHubRow[];
  students: { id: string; name: string }[];
  canUpload: boolean;
  kpis: { files: number; published: number; staffOnly: number };
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (r) =>
        r.filename.toLowerCase().includes(needle) ||
        r.student.toLowerCase().includes(needle) ||
        r.kind.toLowerCase().includes(needle),
    );
  }, [q, rows]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title text-[28px] leading-[1.2]">Files</h1>
          <p className="mt-1 text-ink-soft">
            Every document on the caseload. You attach it. The family sees it only if you publish it.
          </p>
        </div>
        {canUpload ? (
          <button className="btn btn-primary" type="button" onClick={() => setOpen(true)}>
            Upload
          </button>
        ) : (
          <p className="text-[13px] text-ink-soft">The case manager uploads files.</p>
        )}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Kpi label="Files" value={kpis.files} />
        <Kpi label="Published to family" value={kpis.published} />
        <Kpi label="Staff only" value={kpis.staffOnly} />
      </div>

      <div className="mt-6">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, student, or kind"
          className="h-11 w-full rounded-[12px] border border-line bg-white px-3 text-[14px]"
        />
      </div>

      <Table rows={filtered} canEdit={canUpload} />

      {open && canUpload ? (
        <div
          className="fixed inset-0 z-20 flex items-center justify-center bg-[rgb(28_25_23/0.4)] p-4"
          onClick={() => setOpen(false)}
        >
          <div className="w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <form action={uploadFile} className="card space-y-4 p-5">
              <h2 className="font-serif text-[22px] font-semibold">Upload a file</h2>
              <Field label="Student">
                <select name="studentId" required className="h-11 w-full rounded-[12px] border border-line bg-white px-3">
                  <option value="">Choose a student</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Kind">
                <select name="kind" defaultValue="file" className="h-11 w-full rounded-[12px] border border-line bg-white px-3">
                  <option value="file">File</option>
                  <option value="eval">Eval</option>
                  <option value="iep">IEP</option>
                  <option value="notice">Notice</option>
                  <option value="progress-photo">Progress photo</option>
                </select>
              </Field>
              <Field label="File" hint="pdf, png, jpg, webp. 10 MB.">
                <input type="file" name="file" accept=".pdf,.png,.jpg,.jpeg,.webp" required />
              </Field>
              <FamilySwitch />
              <div className="flex flex-wrap justify-end gap-2">
                <button className="btn btn-secondary" type="button" onClick={() => setOpen(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" type="submit">
                  Upload
                </button>
              </div>
            </form>
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

function Table({ rows, canEdit }: { rows: FileHubRow[]; canEdit: boolean }) {
  const router = useRouter();
  if (!rows.length) {
    return <p className="mt-8 text-ink-soft">No files yet. Attach a document to a student.</p>;
  }
  return (
    <div className="card mt-4 overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-[14px]">
        <thead className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-soft">
          <tr className="border-b border-line">
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Student</th>
            <th className="px-4 py-3">Kind</th>
            <th className="px-4 py-3">Family</th>
            <th className="px-4 py-3">Date</th>
            {canEdit ? <th className="px-4 py-3">Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={`${r.studentId}-${r.id}`} className="border-b border-line last:border-0">
              <td className="px-4 py-3">
                <a className="font-medium hover:underline" href={`/api/files/${r.id}`}>
                  {r.filename}
                </a>
              </td>
              <td className="px-4 py-3">
                <Link href={`/app/students/${r.studentId}?tab=files`} className="font-medium hover:underline">
                  {r.student}
                </Link>
                <div className="text-[12px] text-ink-soft">Gr {r.grade}</div>
              </td>
              <td className="px-4 py-3 capitalize">{kindLabel(r.kind)}</td>
              <td className="px-4 py-3">
                {r.publishedToFamily ? <FamilyPill /> : <span className="pill bg-paper text-ink-soft">Staff only</span>}
              </td>
              <td className="px-4 py-3 text-[13px]">{formatWhen(r.createdAt)}</td>
              {canEdit ? (
                <td className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <button
                      className="text-[13px] text-clay"
                      type="button"
                      onClick={() => {
                        setFilePublished(r.studentId, r.id, !r.publishedToFamily).then(() => router.refresh());
                      }}
                    >
                      {r.publishedToFamily ? "Hide" : "Family can see this"}
                    </button>
                    <button
                      className="text-[13px] text-berry"
                      type="button"
                      onClick={() => {
                        if (!confirm("Delete this file?")) return;
                        deleteFile(r.studentId, r.id).then(() => router.refresh());
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
