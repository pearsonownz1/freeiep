"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ClockPill } from "@/components/clock-pill";
import { GoalChart } from "@/components/chart";
import { FamilyPill, FamilySwitch, Field } from "@/components/ui";
import {
  addAccommodation,
  addService,
  addTask,
  deleteGoal,
  deleteStudent,
  inviteFamily,
  logProgress,
  proposeMeeting,
  publishProgressReport,
  removeAccommodation,
  removeService,
  saveGoal,
  savePresentLevels,
  sendNotice,
  setFilePublished,
  setReportPublished,
  toggleTask,
  updateClocks,
  uploadFile,
} from "@/lib/actions";
import { formatDay, formatWhen, plainLanguagePoint, studentName } from "@/lib/format";
import { isoDate } from "@/lib/ids";
import { CLOCK_LABELS, METRIC_LABELS, type Student } from "@/lib/types";
import { METRICS } from "@/lib/format";

const TABS = ["plan", "progress", "meetings", "files", "family"] as const;

export function StudentView({
  student,
  tab,
  assistOn,
}: {
  student: Student;
  tab: string;
  assistOn: boolean;
}) {
  const router = useRouter();
  const current = TABS.includes(tab as (typeof TABS)[number]) ? tab : "plan";
  const [logOpen, setLogOpen] = useState(false);

  return (
    <div className="pb-24">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="page-title text-[28px] leading-[1.2]">{studentName(student)}</h1>
          <p className="text-[13px] text-ink-soft">
            Grade {student.grade} · {student.state}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-primary" type="button" onClick={() => setLogOpen(true)}>
            Add data
          </button>
          <Link href={`/app/students/${student.id}?tab=meetings`} className="btn btn-secondary">
            Schedule meeting
          </Link>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {student.clocks.map((c) => (
          <ClockPill key={c.id} clock={c} />
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-1 border-b border-line">
        {TABS.map((t) => (
          <Link
            key={t}
            href={`/app/students/${student.id}?tab=${t}`}
            className={`px-3 py-2 text-[13px] font-medium capitalize ${
              current === t ? "border-b-2 border-meadow text-ink" : "text-ink-soft"
            }`}
          >
            {t}
          </Link>
        ))}
      </div>

      <div className="mt-6">
        {current === "plan" && <PlanTab student={student} assistOn={assistOn} />}
        {current === "progress" && <ProgressTab student={student} onLog={() => setLogOpen(true)} />}
        {current === "meetings" && <MeetingsTab student={student} />}
        {current === "files" && <FilesTab student={student} />}
        {current === "family" && <FamilyTab student={student} />}
      </div>

      <section className="mt-10">
        <h2 className="font-sans text-[16px] font-semibold">Tasks</h2>
        <ul className="mt-3 space-y-2">
          {student.tasks.map((t) => (
            <li key={t.id}>
              <label className="flex items-center gap-2 text-[15px]">
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={() => toggleTask(student.id, t.id).then(() => router.refresh())}
                />
                <span className={t.done ? "text-ink-soft line-through" : ""}>{t.title}</span>
              </label>
            </li>
          ))}
        </ul>
        <AddTask studentId={student.id} />
      </section>

      <section className="mt-10">
        <h2 className="font-sans text-[16px] font-semibold">Activity</h2>
        <ul className="mt-3 space-y-1 text-[13px] text-ink-soft">
          {student.activity.slice(0, 8).map((a) => (
            <li key={a.id}>
              {a.who} {a.verb} {a.object} · {formatWhen(a.at)}
            </li>
          ))}
          {!student.activity.length ? <li>Nothing logged yet.</li> : null}
        </ul>
      </section>

      {logOpen ? <LogModal student={student} onClose={() => setLogOpen(false)} /> : null}

      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-paper p-3 md:hidden">
        <button className="btn btn-primary w-full" type="button" onClick={() => setLogOpen(true)}>
          Log progress
        </button>
      </div>
    </div>
  );
}

function AddTask({ studentId }: { studentId: string }) {
  const [title, setTitle] = useState("");
  return (
    <form
      className="mt-3 flex gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        await addTask(studentId, title);
        setTitle("");
      }}
    >
      <input className="flex-1 rounded-[8px] border border-line bg-paper-raised px-3" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New task" />
      <button className="btn btn-secondary" type="submit">
        Add
      </button>
    </form>
  );
}

function PlanTab({ student, assistOn }: { student: Student; assistOn: boolean }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-sans text-[16px] font-semibold">Present levels</h2>
        <AutosaveArea studentId={student.id} field="strengths" label="Strengths" defaultValue={student.iepPlan.presentLevels.strengths} />
        <AutosaveArea studentId={student.id} field="needs" label="Needs" defaultValue={student.iepPlan.presentLevels.needs} />
        <AutosaveArea studentId={student.id} field="baselines" label="Baselines" defaultValue={student.iepPlan.presentLevels.baselines} />
        {assistOn ? (
          <p className="mt-2 rounded-[8px] border-l-[3px] border-meadow-soft bg-paper-raised px-3 py-2 text-[13px] text-ink-soft">
            Assist suggestion — you decide. (Key saved. This demo will not invent minutes or placement.)
          </p>
        ) : null}
      </div>
      <GoalsBlock student={student} />
      <div>
        <h2 className="font-sans text-[16px] font-semibold">Accommodations</h2>
        <ul className="mt-3 space-y-2">
          {student.iepPlan.accommodations.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-2">
              <span>{a.text}</span>
              <button className="text-[13px] text-berry" type="button" onClick={() => removeAccommodation(student.id, a.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
        <SimpleAdd
          placeholder="Add an accommodation"
          onAdd={(t) => addAccommodation(student.id, t)}
        />
      </div>
      <div>
        <h2 className="font-sans text-[16px] font-semibold">Services</h2>
        <p className="mt-1 text-[13px] text-ink-soft">You type this. FreeIEP will not invent minutes or placement.</p>
        <ul className="mt-3 space-y-2">
          {student.iepPlan.services.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-2">
              <span>
                {s.name} — {s.minutes} min, {s.frequency}
              </span>
              <button className="text-[13px] text-berry" type="button" onClick={() => removeService(student.id, s.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
        <ServiceForm studentId={student.id} />
      </div>
      <ClocksForm student={student} />
      <div className="flex flex-wrap gap-2">
        <a className="btn btn-primary" href={`/api/pdf/plan/${student.id}`}>
          Export Plan PDF
        </a>
        <button
          className="btn btn-danger"
          type="button"
          onClick={() => {
            if (confirm("Delete this student and their files?")) deleteStudent(student.id);
          }}
        >
          Delete student
        </button>
      </div>
    </div>
  );
}

function AutosaveArea({
  studentId,
  field,
  label,
  defaultValue,
}: {
  studentId: string;
  field: "strengths" | "needs" | "baselines";
  label: string;
  defaultValue: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [, start] = useTransition();
  return (
    <div className="field mt-3">
      <label htmlFor={field}>{label}</label>
      <textarea
        id={field}
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          setValue(v);
          start(() => {
            void savePresentLevels(studentId, field, v);
          });
        }}
      />
    </div>
  );
}

function GoalsBlock({ student }: { student: Student }) {
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState("");
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-sans text-[16px] font-semibold">Goals</h2>
        <button className="btn btn-secondary" type="button" onClick={() => setOpen(true)}>
          Add goal
        </button>
      </div>
      {student.iepPlan.goals.length === 0 ? (
        <p className="mt-3 font-serif text-[20px]">No goals yet. A goal needs a number you can see change.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {student.iepPlan.goals.map((g) => (
            <li key={g.id} className="card p-4">
              <div className="font-medium">{g.title}</div>
              <p className="text-[13px] text-ink-soft">
                {g.target}
                {g.metric === "percent_accuracy" ? "% accuracy" : ` ${g.unit || METRIC_LABELS[g.metric]}`}
                {g.title ? ` on ${g.title}` : ""}.
              </p>
              <button className="mt-2 text-[13px] text-berry" type="button" onClick={() => deleteGoal(student.id, g.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      {open ? (
        <form
          className="card mt-4 space-y-3 p-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setErr("");
            const fd = new FormData(e.currentTarget);
            const metric = String(fd.get("metric") || "");
            const target = String(fd.get("target") || "");
            if (!metric || !target.trim()) {
              setErr("A goal needs a metric and a target.");
              return;
            }
            try {
              await saveGoal(student.id, {
                title: String(fd.get("title") || ""),
                metric,
                baseline: String(fd.get("baseline") || ""),
                target,
                unit: String(fd.get("unit") || ""),
                timelineDate: String(fd.get("timelineDate") || ""),
                standardCode: String(fd.get("standardCode") || ""),
              });
              setOpen(false);
            } catch (ex) {
              setErr(ex instanceof Error ? ex.message : "Could not save.");
            }
          }}
        >
          <Field label="Title">
            <input name="title" required />
          </Field>
          <Field label="Metric">
            <select name="metric" required defaultValue="">
              <option value="" disabled>
                Choose a metric
              </option>
              {METRICS.map((m) => (
                <option key={m} value={m}>
                  {METRIC_LABELS[m]}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="Baseline">
              <input name="baseline" />
            </Field>
            <Field label="Target">
              <input name="target" required />
            </Field>
            <Field label="Unit">
              <input name="unit" placeholder="optional" />
            </Field>
          </div>
          <Field label="Timeline">
            <input type="date" name="timelineDate" />
          </Field>
          <Field label="Standard code">
            <input name="standardCode" />
          </Field>
          {err ? <p className="text-[13px] text-berry">{err}</p> : null}
          <div className="flex gap-2">
            <button className="btn btn-primary" type="submit">
              Save goal
            </button>
            <button className="btn btn-secondary" type="button" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}

function SimpleAdd({ placeholder, onAdd }: { placeholder: string; onAdd: (t: string) => Promise<void> }) {
  const [v, setV] = useState("");
  return (
    <form
      className="mt-3 flex gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        await onAdd(v);
        setV("");
      }}
    >
      <input className="flex-1 rounded-[8px] border border-line bg-paper-raised px-3" value={v} onChange={(e) => setV(e.target.value)} placeholder={placeholder} />
      <button className="btn btn-secondary" type="submit">
        Add
      </button>
    </form>
  );
}

function ServiceForm({ studentId }: { studentId: string }) {
  return (
    <form
      className="mt-3 grid gap-2 md:grid-cols-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        await addService(studentId, String(fd.get("name")), String(fd.get("minutes")), String(fd.get("frequency")));
        e.currentTarget.reset();
      }}
    >
      <input name="name" placeholder="Service name" className="rounded-[8px] border border-line bg-paper-raised px-3" required />
      <input name="minutes" placeholder="Minutes" className="rounded-[8px] border border-line bg-paper-raised px-3" />
      <input name="frequency" placeholder="Frequency" className="rounded-[8px] border border-line bg-paper-raised px-3" />
      <button className="btn btn-secondary" type="submit">
        Add service
      </button>
    </form>
  );
}

function ClocksForm({ student }: { student: Student }) {
  const val = (kind: string) => student.clocks.find((c) => c.kind === kind)?.dueOn ?? "";
  return (
    <form action={updateClocks} className="card space-y-3 p-4">
      <input type="hidden" name="studentId" value={student.id} />
      <h2 className="font-sans text-[16px] font-semibold">Clocks</h2>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label={CLOCK_LABELS.annual_review}>
          <input type="date" name="annual" defaultValue={val("annual_review")} />
        </Field>
        <Field label={CLOCK_LABELS.reevaluation}>
          <input type="date" name="reeval" defaultValue={val("reevaluation")} />
        </Field>
        <Field label={CLOCK_LABELS.progress_report}>
          <input type="date" name="progress" defaultValue={val("progress_report")} />
        </Field>
        <Field label={CLOCK_LABELS.meeting_notice}>
          <input type="date" name="notice" defaultValue={val("meeting_notice")} />
        </Field>
      </div>
      <button className="btn btn-secondary" type="submit">
        Save dates
      </button>
    </form>
  );
}

function ProgressTab({ student, onLog }: { student: Student; onLog: () => void }) {
  return (
    <div className="space-y-8">
      {student.iepPlan.goals.length === 0 ? (
        <p className="font-serif text-[20px]">Write a goal first. Then you can log a number.</p>
      ) : (
        student.iepPlan.goals.map((g) => {
          const pts = student.dataPoints.filter((p) => p.goalId === g.id);
          return (
            <div key={g.id} className="card p-4">
              <div className="font-medium">{g.title}</div>
              <p className="text-[13px] text-ink-soft">
                {pts.length
                  ? plainLanguagePoint(g, pts[pts.length - 1].value)
                  : "No points yet."}
              </p>
              <div className="mt-3">
                <GoalChart goal={g} points={pts} />
              </div>
              <ul className="mt-3 space-y-1 text-[13px] text-ink-soft">
                {pts.map((p) => (
                  <li key={p.id}>
                    {formatDay(p.date)} · {p.value}
                    {p.note ? ` — ${p.note}` : ""}
                    {p.photoId ? (
                      <>
                        {" "}
                        <a className="link" href={`/api/files/${p.photoId}`}>
                          photo
                        </a>
                      </>
                    ) : null}
                  </li>
                ))}
              </ul>
              <button className="btn btn-secondary mt-3" type="button" onClick={onLog}>
                Log progress
              </button>
            </div>
          );
        })
      )}
      <PublishReport student={student} />
    </div>
  );
}

function PublishReport({ student }: { student: Student }) {
  return (
    <form action={publishProgressReport} className="card space-y-3 p-4">
      <h2 className="font-sans text-[16px] font-semibold">Publish progress report</h2>
      <p className="text-[13px] text-ink-soft">Write 2–4 sentences per goal. You write it. Default: family cannot see it.</p>
      <input type="hidden" name="studentId" value={student.id} />
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="From">
          <input type="date" name="from" defaultValue={isoDate()} />
        </Field>
        <Field label="To">
          <input type="date" name="to" defaultValue={isoDate()} />
        </Field>
      </div>
      {student.iepPlan.goals.map((g) => (
        <Field key={g.id} label={g.title}>
          <textarea name={`summary_${g.id}`} />
        </Field>
      ))}
      <FamilySwitch />
      <button className="btn btn-primary" type="submit">
        Save report
      </button>
      <ul className="space-y-2 text-[13px]">
        {student.progressReports.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center gap-2">
            <a className="link" href={`/api/pdf/progress/${r.id}`}>
              Progress PDF {formatDay(r.createdAt)}
            </a>
            {r.publishedToFamily ? <FamilyPill /> : null}
            <button
              className="text-clay"
              type="button"
              onClick={() => setReportPublished(student.id, r.id, !r.publishedToFamily)}
            >
              {r.publishedToFamily ? "Hide from family" : "Family can see this"}
            </button>
          </li>
        ))}
      </ul>
    </form>
  );
}

function MeetingsTab({ student }: { student: Student }) {
  const [links, setLinks] = useState<{ email: string; accept: string; suggest: string; decline: string }[] | null>(null);
  const [err, setErr] = useState("");
  return (
    <div className="space-y-6">
      <form
        className="card space-y-3 p-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setErr("");
          try {
            const res = await proposeMeeting(new FormData(e.currentTarget));
            setLinks(res.links);
          } catch (ex) {
            setErr(ex instanceof Error ? ex.message : "Could not propose.");
          }
        }}
      >
        <h2 className="font-sans text-[16px] font-semibold">Propose times</h2>
        <input type="hidden" name="studentId" value={student.id} />
        <Field label="Type">
          <select name="type" defaultValue="annual">
            <option value="annual">Annual</option>
            <option value="amendment">Amendment</option>
            <option value="reeval">Reeval</option>
          </select>
        </Field>
        <Field label="Attendees (emails)">
          <input name="emails" placeholder="parent@example.com, teacher@school.edu" required />
        </Field>
        {[1, 2, 3].map((n) => (
          <div key={n} className="grid gap-3 md:grid-cols-2">
            <Field label={`Slot ${n} start`}>
              <input type="datetime-local" name={`slot${n}_start`} />
            </Field>
            <Field label={`Slot ${n} end`}>
              <input type="datetime-local" name={`slot${n}_end`} />
            </Field>
          </div>
        ))}
        <Field label="Role brief" hint="What gen-ed should know. You write it.">
          <textarea name="roleBrief" />
        </Field>
        {err ? <p className="text-berry text-[13px]">{err}</p> : null}
        <button className="btn btn-primary" type="submit">
          Send times
        </button>
      </form>
      {links ? (
        <div className="card space-y-3 p-4">
          <h3 className="font-medium">Demo links (also logged)</h3>
          {links.map((l) => (
            <div key={l.email} className="text-[13px]">
              <div className="font-medium">{l.email}</div>
              <div>
                <a className="link" href={l.accept}>
                  Accept
                </a>{" "}
                ·{" "}
                <a className="link" href={l.suggest}>
                  Suggest other
                </a>{" "}
                ·{" "}
                <a className="link" href={l.decline}>
                  Decline
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : null}
      {student.meetings.map((m) => (
        <div key={m.id} className="card p-4">
          <div className="font-medium capitalize">
            {m.type} · {m.status}
          </div>
          {m.roleBrief ? <p className="mt-1 text-[13px] text-ink-soft">{m.roleBrief}</p> : null}
          <ul className="mt-2 text-[13px]">
            {m.slots.map((s) => (
              <li key={s.id}>
                {formatWhen(s.startsAt)}
                {m.confirmedSlotId === s.id ? " · confirmed" : ""}
              </li>
            ))}
          </ul>
          <ul className="mt-2 text-[13px] text-ink-soft">
            {m.attendees.map((a) => (
              <li key={a.email}>
                {a.email}
                {a.reply ? ` · ${a.reply}` : " · waiting"}
              </li>
            ))}
          </ul>
          {m.status === "confirmed" ? (
            <a className="btn btn-secondary mt-3" href={`/api/ics/${m.id}`}>
              Download .ics
            </a>
          ) : null}
        </div>
      ))}
      <NoticeForm student={student} />
    </div>
  );
}

function NoticeForm({ student }: { student: Student }) {
  return (
    <form action={sendNotice} className="card space-y-3 p-4">
      <h2 className="font-sans text-[16px] font-semibold">Written notice (PWN-lite)</h2>
      <p className="text-[13px] text-ink-soft">
        This is a record your team keeps. It is not a substitute for your district’s official notice if your district requires a specific form. Not legal advice.
      </p>
      <input type="hidden" name="studentId" value={student.id} />
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
      <ul className="text-[13px] text-ink-soft">
        {student.notices.map((n) => (
          <li key={n.id}>
            Sent {n.sentAt ? formatWhen(n.sentAt) : "—"}
            {n.ackedAt ? ` · acknowledged ${formatWhen(n.ackedAt)}` : " · waiting"}
          </li>
        ))}
      </ul>
    </form>
  );
}

function FilesTab({ student }: { student: Student }) {
  return (
    <div className="space-y-4">
      <form action={uploadFile} className="card space-y-3 p-4">
        <input type="hidden" name="studentId" value={student.id} />
        <Field label="File" hint="pdf, png, jpg, webp. 10 MB.">
          <input type="file" name="file" accept=".pdf,.png,.jpg,.jpeg,.webp" required />
        </Field>
        <FamilySwitch />
        <button className="btn btn-primary" type="submit">
          Upload
        </button>
      </form>
      <ul className="space-y-2">
        {student.documents.map((d) => (
          <li key={d.id} className="card flex flex-wrap items-center justify-between gap-2 p-3">
            <a className="link" href={`/api/files/${d.id}`}>
              {d.filename}
            </a>
            <div className="flex items-center gap-2">
              {d.publishedToFamily ? <FamilyPill /> : null}
              <button
                className="text-[13px] text-clay"
                type="button"
                onClick={() => setFilePublished(student.id, d.id, !d.publishedToFamily)}
              >
                {d.publishedToFamily ? "Hide" : "Family can see this"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FamilyTab({ student }: { student: Student }) {
  const [url, setUrl] = useState<string | null>(null);
  const [err, setErr] = useState("");
  return (
    <div className="space-y-4">
      <p className="text-ink-soft">Invite one family member. They see this student only, and only what you publish.</p>
      <form
        className="card space-y-3 p-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setErr("");
          try {
            const res = await inviteFamily(new FormData(e.currentTarget));
            setUrl(res.url);
          } catch (ex) {
            setErr(ex instanceof Error ? ex.message : "Could not invite.");
          }
        }}
      >
        <input type="hidden" name="studentId" value={student.id} />
        <Field label="Family email">
          <input name="email" type="email" required />
        </Field>
        {err ? <p className="text-berry text-[13px]">{err}</p> : null}
        <button className="btn btn-primary" type="submit">
          Send invite
        </button>
      </form>
      {url ? (
        <p className="card p-4">
          Demo invite:{" "}
          <a className="link break-all" href={url}>
            {url}
          </a>
        </p>
      ) : null}
    </div>
  );
}

function LogModal({ student, onClose }: { student: Student; onClose: () => void }) {
  const first = student.iepPlan.goals[0]?.id ?? "";
  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-[rgb(28_25_23/0.4)] p-4 md:items-center">
      <form
        className="card w-full max-w-md space-y-3 p-5"
        onSubmit={async (e) => {
          e.preventDefault();
          await logProgress(new FormData(e.currentTarget));
          onClose();
        }}
      >
        <h2 className="font-sans text-[16px] font-semibold">Log progress</h2>
        <input type="hidden" name="studentId" value={student.id} />
        <Field label="Goal">
          <select name="goalId" defaultValue={first} required>
            {student.iepPlan.goals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Date">
          <input type="date" name="date" defaultValue={isoDate()} />
        </Field>
        <Field label="Value">
          <input name="value" type="number" step="any" required />
        </Field>
        <Field label="Note">
          <textarea name="note" />
        </Field>
        <Field label="Photo (stored, not scored)">
          <input type="file" name="photo" accept=".png,.jpg,.jpeg,.webp,.pdf" />
        </Field>
        <div className="flex gap-2">
          <button className="btn btn-primary" type="submit">
            Save point
          </button>
          <button className="btn btn-secondary" type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
