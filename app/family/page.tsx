import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { getStudentForFamily } from "@/lib/queries";
import { logout, acknowledgeNotice, familyMeetingReply } from "@/lib/actions";
import { Wordmark, FamilyPill } from "@/components/ui";
import { formatDay, formatWhen, plainLanguagePoint, studentName } from "@/lib/format";
import { GoalChart } from "@/components/chart";

export default async function FamilyPage() {
  const user = await currentUser("family");
  if (!user) redirect("/login");
  const student = await getStudentForFamily();
  if (!student) {
    return (
      <FamilyChrome>
        <h1 className="page-title text-[28px]">Nothing to open yet</h1>
        <p className="mt-2 text-ink-soft">Ask the teacher to send a new invite.</p>
      </FamilyChrome>
    );
  }

  const waitingNotices = student.notices.filter((n) => n.sentAt && !n.ackedAt);
  const waitingMeetings = student.meetings.filter((m) => m.status === "finding_time");
  const reports = student.progressReports.filter((r) => r.publishedToFamily);
  const files = student.documents.filter((d) => d.publishedToFamily);

  return (
    <FamilyChrome email={user.email}>
      <h1 className="page-title text-[28px] leading-[1.2]">{studentName(student)}</h1>
      <p className="mt-1 text-ink-soft">One student. Published items only.</p>

      <section className="mt-8">
        <h2 className="font-sans text-[16px] font-semibold">Waiting on you</h2>
        {!waitingNotices.length && !waitingMeetings.length ? (
          <p className="mt-2 text-ink-soft">Nothing waiting.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {waitingNotices.map((n) => (
              <li key={n.id} className="card p-4">
                <div className="font-medium">Written notice</div>
                <p className="mt-1 text-[15px]">
                  We {n.proposeOrRefuse}: {n.description}
                </p>
                <form action={acknowledgeNotice.bind(null, n.id)} className="mt-3">
                  <button className="btn btn-primary min-h-11" type="submit">
                    Acknowledge
                  </button>
                </form>
              </li>
            ))}
            {waitingMeetings.map((m) => (
              <li key={m.id} className="card p-4">
                <div className="font-medium capitalize">{m.type} meeting</div>
                <form action={familyMeetingReply} className="mt-3 space-y-3">
                  <input type="hidden" name="meetingId" value={m.id} />
                  <label className="field">
                    <span>Time</span>
                    <select name="slotId">
                      {m.slots.map((s) => (
                        <option key={s.id} value={s.id}>
                          {formatWhen(s.startsAt)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    <span>Other times</span>
                    <textarea name="suggestNote" />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button className="btn btn-primary min-h-11" name="reply" value="accept" type="submit">
                      Accept
                    </button>
                    <button className="btn btn-secondary min-h-11" name="reply" value="suggest" type="submit">
                      Suggest other
                    </button>
                    <button className="btn btn-danger min-h-11" name="reply" value="decline" type="submit">
                      Decline
                    </button>
                  </div>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-[16px] font-semibold">Progress</h2>
        {reports.length === 0 ? (
          <p className="mt-2 text-ink-soft">No published progress yet.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {student.iepPlan.goals.map((g) => {
              const summary = reports.flatMap((r) => r.summaries).find((s) => s.goalId === g.id);
              if (!summary) return null;
              const range = reports.find((r) => r.summaries.some((x) => x.goalId === g.id));
              const pts = student.dataPoints.filter(
                (p) => p.goalId === g.id && range && p.date >= range.from && p.date <= range.to,
              );
              const latest = pts[pts.length - 1];
              return (
                <div key={g.id} className="card p-4">
                  <div className="font-medium">{g.title}</div>
                  {latest ? (
                    <p className="mt-1">{plainLanguagePoint(g, latest.value)}</p>
                  ) : null}
                  {pts.length ? <GoalChart goal={g} points={pts} /> : null}
                  <p className="mt-2 text-[15px] text-ink-soft">{summary.text}</p>
                </div>
              );
            })}
            {reports.map((r) => (
              <div key={r.id} className="flex items-center gap-2 text-[13px]">
                <FamilyPill />
                <a className="link" href={`/api/pdf/progress/${r.id}`}>
                  Progress report {formatDay(r.createdAt)}
                </a>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-[16px] font-semibold">Documents</h2>
        {files.length === 0 ? (
          <p className="mt-2 text-ink-soft">No published files.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {files.map((f) => (
              <li key={f.id}>
                <a className="link" href={`/api/files/${f.id}`}>
                  {f.filename}
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </FamilyChrome>
  );
}

function FamilyChrome({ children, email }: { children: React.ReactNode; email?: string }) {
  return (
    <div className="min-h-screen bg-clay-soft">
      <header className="mx-auto flex max-w-[1080px] items-center justify-between px-6 py-5">
        <Wordmark href="/family" />
        <div className="flex items-center gap-4 text-[13px]">
          {email ? <span className="text-ink-soft">{email}</span> : null}
          <form action={logout}>
            <button className="link" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-[1080px] px-6 pb-20">{children}</main>
    </div>
  );
}
