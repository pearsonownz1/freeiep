"use client";

import { useState } from "react";
import { inviteMember, openAsCaseManager, openAsTeamMember, removeMember, updateMemberAssignments } from "@/lib/actions";
import { Field } from "@/components/ui";
import type { Student, User } from "@/lib/types";
import { studentName } from "@/lib/format";

export function MembersPanel({
  members,
  family,
  students,
  role,
}: {
  members: User[];
  family: User[];
  students: Student[];
  role: User["role"];
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [err, setErr] = useState("");

  return (
    <div className="mt-12">
      <h2 className="font-sans text-[16px] font-semibold">Members</h2>
      <p className="mt-1 text-[15px] text-ink-soft">
        Co-teachers and providers can log data and view accommodations on assigned students. They cannot edit the plan, clocks, or services, or delete a case.
      </p>
      <ul className="card mt-4 divide-y divide-line overflow-hidden">
        {members.map((m) => (
          <li key={m.id} className="px-4 py-3">
            <div className="flex min-h-[32px] items-center justify-between gap-3">
              <div>
                <div className="font-medium">{m.name || m.email}</div>
                <div className="text-[12px] text-ink-soft">{m.email}</div>
              </div>
              <span className="text-[12px] text-ink-soft">
                {m.role === "owner" ? "Case manager" : "Team member"}
                {m.role === "member"
                  ? ` · ${(m.assignedStudentIds ?? []).length} student${(m.assignedStudentIds ?? []).length === 1 ? "" : "s"}`
                  : ""}
              </span>
            </div>
            {role === "owner" && m.role === "member" ? (
              <MemberEdit member={m} students={students} />
            ) : null}
          </li>
        ))}
      </ul>

      {role === "owner" ? (
        <form
          className="card mt-4 space-y-3 p-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setErr("");
            try {
              const res = await inviteMember(new FormData(e.currentTarget));
              setUrl(res.url);
            } catch (ex) {
              setErr(ex instanceof Error ? ex.message : "Could not invite.");
            }
          }}
        >
          <Field label="Invite by email">
            <input name="email" type="email" required placeholder="provider@school.edu" />
          </Field>
          <fieldset>
            <legend className="mb-2 text-[13px] font-medium">Assigned students</legend>
            <div className="space-y-1">
              {students.map((s) => (
                <label key={s.id} className="flex items-center gap-2 text-[14px]">
                  <input type="checkbox" name="studentId" value={s.id} defaultChecked />
                  {studentName(s)}
                </label>
              ))}
              {!students.length ? <p className="text-[13px] text-ink-soft">Add a student first.</p> : null}
            </div>
          </fieldset>
          {err ? <p className="text-[13px] text-berry">{err}</p> : null}
          <p className="text-[13px] text-ink-soft">The invite URL appears on this page. Email send comes later.</p>
          <button className="btn btn-primary" type="submit">
            Send team invite
          </button>
        </form>
      ) : null}

      {url ? (
        <p className="card mt-3 p-4 text-[14px]">
          Team invite (copy this — mail is later):{" "}
          <a className="link break-all" href={url}>
            {url}
          </a>
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {role === "owner" ? (
          <form action={openAsTeamMember}>
            <button className="btn btn-secondary" type="submit">
              Open as team member
            </button>
          </form>
        ) : (
          <form action={openAsCaseManager}>
            <button className="btn btn-secondary" type="submit">
              Open as case manager
            </button>
          </form>
        )}
      </div>
      <p className="mt-2 text-[13px] text-ink-soft">
        Staff is open in this demo. The switch sets a member session cookie — no password.
      </p>

      {family.length ? (
        <>
          <h3 className="mt-8 font-sans text-[15px] font-semibold">Family</h3>
          <ul className="mt-2 space-y-1 text-[14px] text-ink-soft">
            {family.map((f) => (
              <li key={f.id}>{f.email} · one student</li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}

function MemberEdit({ member, students }: { member: User; students: Student[] }) {
  const [msg, setMsg] = useState("");
  const assigned = new Set(member.assignedStudentIds ?? []);
  return (
    <div className="mt-3 space-y-2 border-t border-line pt-3">
      <form
        className="space-y-2"
        onSubmit={async (e) => {
          e.preventDefault();
          setMsg("");
          try {
            await updateMemberAssignments(new FormData(e.currentTarget));
            setMsg("Assignments saved.");
          } catch (ex) {
            setMsg(ex instanceof Error ? ex.message : "Could not save.");
          }
        }}
      >
        <input type="hidden" name="memberId" value={member.id} />
        <fieldset>
          <legend className="mb-1 text-[12px] font-medium text-ink-soft">Assigned students</legend>
          <div className="space-y-1">
            {students.map((s) => (
              <label key={s.id} className="flex items-center gap-2 text-[14px]">
                <input type="checkbox" name="studentId" value={s.id} defaultChecked={assigned.has(s.id)} />
                {studentName(s)}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-secondary" type="submit">
            Save assignments
          </button>
        </div>
      </form>
      <form
        action={async () => {
          if (!confirm(`Remove ${member.email} from this workspace?`)) return;
          await removeMember(member.id);
        }}
      >
        <button className="text-[13px] text-berry" type="submit">
          Remove member
        </button>
      </form>
      {msg ? <p className="text-[13px] text-ink-soft">{msg}</p> : null}
    </div>
  );
}
