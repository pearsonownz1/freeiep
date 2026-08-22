"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Field } from "@/components/ui";
import { importCsv } from "@/lib/actions";

const FIELDS = [
  { key: "name", label: "Name", required: true, aliases: ["name", "student", "student name", "full name"] },
  { key: "grade", label: "Grade", required: true, aliases: ["grade", "gr", "grade level"] },
  { key: "annual", label: "Annual date", required: false, aliases: ["annual_date", "annual", "annual review", "iep date"] },
  { key: "reeval", label: "Reeval date", required: false, aliases: ["reeval_date", "reeval", "reevaluation", "triennial"] },
] as const;

type FieldKey = (typeof FIELDS)[number]["key"];

function splitCsv(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (q && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else q = !q;
    } else if (ch === "," && !q) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

function guessMap(headers: string[]): Record<FieldKey, string> {
  const map: Record<FieldKey, string> = { name: "", grade: "", annual: "", reeval: "" };
  const lower = headers.map((h) => h.trim().toLowerCase());
  for (const field of FIELDS) {
    const hit = field.aliases.find((a) => lower.includes(a));
    if (hit) map[field.key] = headers[lower.indexOf(hit)];
  }
  return map;
}

export function CsvImport() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [map, setMap] = useState<Record<FieldKey, string>>({ name: "", grade: "", annual: "", reeval: "" });
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ created: number; skipped: { row: number; message: string }[] } | null>(null);
  const [err, setErr] = useState("");

  const ready = Boolean(file && map.name && map.grade);

  const hint = useMemo(() => {
    if (!headers.length) return "Choose a CSV. We map columns, then create students.";
    return `${headers.length} columns found. Name and grade are required.`;
  }, [headers]);

  async function onFile(f: File | null) {
    setFile(f);
    setResult(null);
    setErr("");
    if (!f) {
      setHeaders([]);
      return;
    }
    const text = await f.text();
    const first = text.split(/\r?\n/).find((l) => l.trim());
    if (!first) {
      setErr("That file has no header row.");
      setHeaders([]);
      return;
    }
    const cols = splitCsv(first).map((h) => h.trim()).filter(Boolean);
    setHeaders(cols);
    setMap(guessMap(cols));
  }

  return (
    <div className="max-w-[40rem]">
      <form
        className="card space-y-4 p-5"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!file) return;
          setBusy(true);
          setErr("");
          setResult(null);
          try {
            const fd = new FormData();
            fd.set("file", file);
            fd.set("col_name", map.name);
            fd.set("col_grade", map.grade);
            fd.set("col_annual", map.annual);
            fd.set("col_reeval", map.reeval);
            const res = await importCsv(fd);
            setResult(res);
            if (res.created) router.refresh();
          } catch (ex) {
            setErr(ex instanceof Error ? ex.message : "Could not import.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <p className="text-[14px] text-ink-soft">{hint} No SIS. Skip rows that fail, list the errors.</p>
        <Field label="CSV file">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />
        </Field>
        {headers.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {FIELDS.map((field) => (
              <Field key={field.key} label={field.label}>
                <select
                  value={map[field.key]}
                  onChange={(e) => setMap((m) => ({ ...m, [field.key]: e.target.value }))}
                  required={field.required}
                >
                  <option value="">{field.required ? "Choose column" : "Skip"}</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </Field>
            ))}
          </div>
        ) : null}
        {err ? <p className="text-[13px] text-berry">{err}</p> : null}
        <div className="flex flex-wrap items-center gap-3">
          <button className="btn btn-primary" type="submit" disabled={!ready || busy}>
            {busy ? "Importing…" : "Validate and create"}
          </button>
          <a className="btn btn-secondary" href="/sample-caseload.csv" download>
            Download sample CSV
          </a>
        </div>
      </form>

      {result ? (
        <div className="card mt-4 space-y-2 p-5">
          <p className="font-medium">
            {result.created ? `Created ${result.created} student${result.created === 1 ? "" : "s"}.` : "No students created."}
          </p>
          {result.skipped.length ? (
            <ul className="space-y-1 text-[13px] text-berry">
              {result.skipped.map((s) => (
                <li key={`${s.row}-${s.message}`}>
                  Row {s.row}: {s.message}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-ink-soft">Every mapped row was valid.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
