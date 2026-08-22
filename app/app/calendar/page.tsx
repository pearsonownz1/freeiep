import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { workspaceStudents } from "@/lib/queries";
import { clockTone } from "@/lib/clocks";
import { CLOCK_LABELS } from "@/lib/types";
import { studentName, formatDay } from "@/lib/format";
import { ClockPill } from "@/components/clock-pill";

export default async function CalendarPage() {
  const user = await currentUser("staff");
  if (!user) redirect("/app");
  if (!user.workspaceId) redirect("/app/settings?setup=1");
  const students = await workspaceStudents();
  const rows = students
    .flatMap((s) => s.clocks.filter((c) => !c.done).map((c) => ({ s, c })))
    .sort((a, b) => a.c.dueOn.localeCompare(b.c.dueOn));

  return (
    <div>
      <h1 className="page-title text-[28px] leading-[1.2]">Calendar</h1>
      <p className="mt-1 text-ink-soft">Clocks across the caseload. In-app only. No SMS.</p>
      {rows.length === 0 ? (
        <p className="mt-10 text-ink-soft">No dates yet. Add a student and set annual / reeval.</p>
      ) : (
        <ul className="mt-6 divide-y divide-line rounded-[4px] border border-line bg-paper-raised">
          {rows.map(({ s, c }) => (
            <li key={c.id} className="flex min-h-[56px] flex-wrap items-center justify-between gap-2 px-4 py-2">
              <div>
                <Link href={`/app/students/${s.id}`} className="font-medium">
                  {studentName(s)}
                </Link>
                <div className="text-[12px] text-ink-soft tabular">
                  {CLOCK_LABELS[c.kind]} · {formatDay(c.dueOn)}
                </div>
              </div>
              <ClockPill clock={c} />
              <span className="sr-only">{clockTone(c)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
