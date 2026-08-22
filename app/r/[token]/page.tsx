import { getToken } from "@/lib/auth";
import { readStore } from "@/lib/store";
import { studentName, formatWhen } from "@/lib/format";
import { TokenActions } from "./token-actions";
import { Wordmark } from "@/components/ui";

export default async function TokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token: id } = await params;
  const token = await getToken(id);
  if (!token) {
    return (
      <Shell>
        <h1 className="page-title text-[28px]">This link is done</h1>
        <p className="mt-3 text-ink-soft">Ask the teacher for a new one. Links last 14 days.</p>
      </Shell>
    );
  }
  const student = token.studentId ? (await readStore()).students.find((s) => s.id === token.studentId) : null;
  const meeting = student?.meetings.find((m) => m.id === token.meetingId);

  if (token.kind === "family_invite") {
    return (
      <Shell>
        <h1 className="page-title text-[28px]">Family invite</h1>
        <p className="mt-3 text-ink-soft">
          {student ? `You are opening ${studentName(student)}.` : "Open the student the teacher shared."} No student account is created.
        </p>
        <TokenActions tokenId={id} kind={token.kind} />
      </Shell>
    );
  }

  return (
    <Shell>
      <h1 className="page-title text-[28px]">Meeting reply</h1>
      <p className="mt-3 text-ink-soft">
        {student ? studentName(student) : "A student"} · no account needed.
      </p>
      {meeting ? (
        <ul className="mt-4 space-y-2">
          {meeting.slots.map((slot) => (
            <li key={slot.id} className="card px-4 py-3 text-[15px]">
              {formatWhen(slot.startsAt)} – {formatWhen(slot.endsAt)}
            </li>
          ))}
        </ul>
      ) : null}
      <TokenActions tokenId={id} kind={token.kind} slots={meeting?.slots ?? []} defaultSlot={token.slotId} />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-clay-soft">
      <div className="mx-auto max-w-[32rem] px-6 py-8">
        <Wordmark href="/" />
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
