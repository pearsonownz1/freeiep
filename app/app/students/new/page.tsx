import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { createStudent, importCsv } from "@/lib/actions";
import { US_STATES } from "@/lib/types";
import { Field } from "@/components/ui";

export default async function NewStudentPage() {
  const user = await currentUser("staff");
  if (!user) redirect("/login");
  if (!user.acceptedLegalAt || !user.workspaceId) redirect("/app/settings?setup=1");

  return (
    <div className="max-w-[38rem]">
      <h1 className="page-title text-[28px] leading-[1.2]">Add student</h1>
      <p className="mt-2 text-ink-soft">Not the official IEP. A working case you can keep honest.</p>
      <form action={createStudent} className="mt-6 space-y-4">
        <Field label="Name">
          <input name="name" required placeholder="Last, First or First Last" />
        </Field>
        <Field label="Grade">
          <input name="grade" required />
        </Field>
        <Field label="State">
          <select name="state" defaultValue="TX" required>
            {US_STATES.map((st) => (
              <option key={st}>{st}</option>
            ))}
          </select>
        </Field>
        <Field label="Annual date" hint="Optional. You can set clocks later.">
          <input type="date" name="annual_date" />
        </Field>
        <Field label="Reeval date">
          <input type="date" name="reeval_date" />
        </Field>
        <button className="btn btn-primary" type="submit">
          Save student
        </button>
      </form>

      <h2 className="mt-12 font-sans text-[16px] font-semibold">CSV import</h2>
      <p className="mt-1 text-[15px] text-ink-soft">
        Columns: name, grade, annual_date, reeval_date. Map them if your header names differ. No SIS.
      </p>
      <form action={importCsv} className="mt-4 space-y-3">
        <Field label="CSV file">
          <input type="file" name="file" accept=".csv,text/csv" required />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Name column">
            <input name="col_name" defaultValue="name" />
          </Field>
          <Field label="Grade column">
            <input name="col_grade" defaultValue="grade" />
          </Field>
          <Field label="Annual column">
            <input name="col_annual" defaultValue="annual_date" />
          </Field>
          <Field label="Reeval column">
            <input name="col_reeval" defaultValue="reeval_date" />
          </Field>
        </div>
        <button className="btn btn-secondary" type="submit">
          Import CSV
        </button>
      </form>
    </div>
  );
}
