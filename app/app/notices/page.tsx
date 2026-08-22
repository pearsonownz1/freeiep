import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { noticeHubRows, workspaceStudents } from "@/lib/queries";
import { studentName } from "@/lib/format";
import { NoticesHub } from "./notices-hub";

export default async function NoticesPage() {
  const user = await currentUser("staff");
  if (!user) redirect("/app");
  if (!user.workspaceId || !user.acceptedLegalAt) redirect("/app/settings?setup=1");
  const students = await workspaceStudents();
  const rows = await noticeHubRows();
  const sent = rows.filter((r) => r.sent).length;
  const waiting = rows.filter((r) => r.sent && !r.acked).length;
  const acked = rows.filter((r) => r.acked).length;

  return (
    <NoticesHub
      rows={rows}
      students={students.map((s) => ({ id: s.id, name: studentName(s) }))}
      canSend={user.role === "owner"}
      kpis={{ sent, waiting, acked }}
    />
  );
}
