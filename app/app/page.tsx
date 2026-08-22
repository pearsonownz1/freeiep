import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { workspaceStudents } from "@/lib/queries";
import { sortCaseload, nextClock } from "@/lib/clocks";
import { ClockPill } from "@/components/clock-pill";
import { loadSampleCaseload } from "@/lib/actions";
import { activityCopy, studentName } from "@/lib/format";

export default async function CaseloadPage() {
  const user = await currentUser("staff");
  if (!user) redirect("/app");
  if (!user.workspaceId || !user.acceptedLegalAt) redirect("/app/settings?setup=1");
  const students = sortCaseload(await workspaceStudents());

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title text-[28px] leading-[1.2]">Caseload</h1>
          <p className="mt-1 text-[15px] text-ink-soft">Soonest overdue first.</p>
        </div>
        {user.role === "owner" ? (
          <div className="flex flex-wrap gap-2">
            <form action={loadSampleCaseload}>
              <button className="btn btn-secondary" type="submit">
                Sample caseload
              </button>
            </form>
            <Link href="/app/students/new" className="btn btn-primary">
              Add student
            </Link>
          </div>
        ) : (
          <p className="text-[13px] text-ink-soft">Assigned students. You can add data. You cannot delete a case.</p>
        )}
      </div>
      {students.length === 0 ? (
        <div className="mt-16 text-center">
          <h2 className="page-title text-[28px]">Add your first student.</h2>
          <p className="mt-2 text-ink-soft">A name, a grade, a state. Dates can wait a minute.</p>
          {user.role === "owner" ? (
          <Link href="/app/students/new" className="btn btn-primary mt-6">
            Add student
          </Link>
          ) : (
            <p className="mt-6 text-[13px] text-ink-soft">Ask the case manager to assign you a student.</p>
          )}
        </div>
      ) : (
        <ul className="card mt-6 divide-y divide-line overflow-hidden">
          {students.map((s) => {
            const next = nextClock(s);
            return (
              <li key={s.id} className="flex min-h-[56px] items-center justify-between gap-3 px-4">
                <Link href={`/app/students/${s.id}`} className="min-w-0">
                  <div className="font-serif text-[18px] font-semibold">{studentName(s)}</div>
                  <div className="text-[12px] text-ink-soft">
                    Grade {s.grade}
                    {s.activity[0] ? ` · ${activityCopy(s.activity[0])}` : ""}
                  </div>
                </Link>
                {next ? <ClockPill clock={next} /> : <span className="text-[12px] text-ink-soft">No clocks</span>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
