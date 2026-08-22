import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { workspaceStudents } from "@/lib/queries";
import { nextClock, sortCaseload, clockTone } from "@/lib/clocks";
import { loadSampleCaseload } from "@/lib/actions";
import { activityCopy, studentName } from "@/lib/format";
import { readStore } from "@/lib/store";
import { CaseloadTable, type StudentRow } from "@/components/app/caseload-table";

function weekdayName() {
  return new Date().toLocaleDateString("en-US", {
    timeZone: "America/Chicago",
    weekday: "long",
  });
}

export default async function DashboardPage() {
  const user = await currentUser("staff");
  if (!user) redirect("/app");
  if (!user.workspaceId || !user.acceptedLegalAt) redirect("/app/settings?setup=1");
  const workspace = (await readStore()).workspaces.find((w) => w.id === user.workspaceId);
  const students = sortCaseload(await workspaceStudents());

  const rows: StudentRow[] = students.map((s) => ({
    id: s.id,
    name: studentName(s),
    grade: s.grade,
    lastActivity: s.activity[0] ? activityCopy(s.activity[0]) : "",
    clock: nextClock(s),
    overdue: s.clocks.some((c) => clockTone(c) === "overdue"),
    hasMeeting: s.meetings.length > 0,
  }));

  const overdueClocks = students.reduce(
    (n, s) => n + s.clocks.filter((c) => clockTone(c) === "overdue").length,
    0,
  );
  const unconfirmedMeetings = students.reduce(
    (n, s) => n + s.meetings.filter((m) => m.status !== "confirmed" && m.status !== "done").length,
    0,
  );
  const unsignedPwn = students.reduce(
    (n, s) => n + s.notices.filter((note) => note.sentAt && !note.ackedAt).length,
    0,
  );

  const logHref = "/app/progress";
  const familyHref = "/app/family";

  return (
    <div>
      <p className="text-[13px] font-medium text-ink-soft">{workspace?.name ?? "School"}</p>
      <h1 className="page-title mt-1 text-[32px] leading-[1.15]">Happy {weekdayName()}.</h1>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="pill bg-meadow-soft text-meadow">Designed for FERPA</span>
        <span className="pill bg-meadow-soft text-meadow">Students never get accounts</span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <QuickCard href="/app/students/new" title="Add student" body="Open a working case." ownerOnly={user.role !== "owner"} />
        <QuickCard href={logHref} title="Log progress" body="A number and a note." />
        <QuickCard href="/app/meetings" title="Schedule meeting" body="Table of meetings, then propose times." />
        <QuickCard href={familyHref} title="Invite family" body="A link. They do not create an account first." />
      </div>

      {(overdueClocks > 0 || unconfirmedMeetings > 0 || unsignedPwn > 0) && (
        <div className="mt-6 flex flex-wrap gap-2">
          {overdueClocks > 0 ? (
            <Link href="/app/calendar" className="pill bg-berry-soft text-berry">
              {overdueClocks} overdue clock{overdueClocks === 1 ? "" : "s"}
            </Link>
          ) : null}
          {unconfirmedMeetings > 0 ? (
            <Link href="/app/meetings" className="pill bg-sun-soft text-sun">
              {unconfirmedMeetings} unconfirmed meeting{unconfirmedMeetings === 1 ? "" : "s"}
            </Link>
          ) : null}
          {unsignedPwn > 0 ? (
            <Link href="/app/notices" className="pill bg-clay-soft text-clay">
              {unsignedPwn} unsigned PWN
            </Link>
          ) : null}
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-sans text-[16px] font-semibold">Students</h2>
          <p className="text-[13px] text-ink-soft">Soonest clock first. The student is the unit of work.</p>
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
          <p className="text-[13px] text-ink-soft">Assigned students only. You can add data. You cannot delete a case.</p>
        )}
      </div>

      {students.length === 0 ? (
        <div className="mt-10 text-center">
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
        <div className="mt-4">
          <CaseloadTable rows={rows} />
        </div>
      )}
    </div>
  );
}

function QuickCard({
  href,
  title,
  body,
  ownerOnly,
}: {
  href: string;
  title: string;
  body: string;
  ownerOnly?: boolean;
}) {
  if (ownerOnly) {
    return (
      <div className="card p-5 opacity-60">
        <div className="font-serif text-[20px] font-semibold">{title}</div>
        <p className="mt-1 text-[13px] text-ink-soft">Case manager only.</p>
      </div>
    );
  }
  return (
    <Link href={href} className="card block p-5 transition-colors hover:border-ink/20">
      <div className="font-serif text-[20px] font-semibold">{title}</div>
      <p className="mt-1 text-[13px] text-ink-soft">{body}</p>
    </Link>
  );
}
