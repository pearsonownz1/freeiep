import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { workspaceStudents } from "@/lib/queries";
import { studentName } from "@/lib/format";
import { MeetingsHub } from "./meetings-hub";

export default async function MeetingsPage() {
  const user = await currentUser("staff");
  if (!user) redirect("/app");
  if (!user.workspaceId || !user.acceptedLegalAt) redirect("/app/settings?setup=1");
  const students = await workspaceStudents();
  const rows = students.flatMap((s) =>
    s.meetings.map((m) => {
      const when =
        m.slots.find((sl) => sl.id === m.confirmedSlotId)?.startsAt ??
        m.slots[0]?.startsAt ??
        null;
      return {
        id: m.id,
        studentId: s.id,
        student: studentName(s),
        grade: s.grade,
        type: m.type,
        status: m.status,
        when,
        attendees: m.attendees.map((a) => a.email).join(", "),
        waiting: m.attendees.filter((a) => !a.reply).length,
      };
    }),
  );
  const finding = rows.filter((r) => r.status === "finding_time").length;
  const confirmed = rows.filter((r) => r.status === "confirmed").length;
  const upcoming = rows.filter((r) => r.status !== "done").length;

  return (
    <MeetingsHub
      rows={rows}
      students={students.map((s) => ({ id: s.id, name: studentName(s) }))}
      canPropose={user.role === "owner"}
      kpis={{ upcoming, finding, confirmed }}
    />
  );
}
