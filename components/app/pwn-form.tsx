"use client";

import { Field } from "@/components/ui";
import { sendNotice } from "@/lib/actions";
import { isoDate } from "@/lib/ids";

export const DISTRICT_NOTICE_DISCLAIMER =
  "This is a record your team keeps. It is not a substitute for your district’s official notice if your district requires a specific form. Not legal advice.";

export function PwnForm({
  studentId,
  students,
}: {
  studentId?: string;
  students?: { id: string; name: string }[];
}) {
  return (
    <form action={sendNotice} className="card space-y-3 p-4">
      <h2 className="font-sans text-[16px] font-semibold">Written notice (PWN-lite)</h2>
      <p className="text-[13px] text-ink-soft">{DISTRICT_NOTICE_DISCLAIMER}</p>
      {studentId ? <input type="hidden" name="studentId" value={studentId} /> : null}
      {students ? (
        <Field label="Student">
          <select name="studentId" required defaultValue={studentId ?? ""}>
            <option value="" disabled>
              Choose a student
            </option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
      ) : null}
      <Field label="Date">
        <input type="date" name="date" defaultValue={isoDate()} />
      </Field>
      <Field label="We propose / refuse">
        <select name="proposeOrRefuse">
          <option value="propose">We propose</option>
          <option value="refuse">We refuse</option>
        </select>
      </Field>
      <Field label="Description">
        <textarea name="description" required />
      </Field>
      <Field label="Reasons">
        <textarea name="reasons" />
      </Field>
      <Field label="Options considered">
        <textarea name="options" />
      </Field>
      <button className="btn btn-primary" type="submit">
        Send to family
      </button>
    </form>
  );
}
