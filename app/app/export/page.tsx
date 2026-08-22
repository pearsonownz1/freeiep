import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { workspaceStudents } from "@/lib/queries";
import { studentName } from "@/lib/format";
import { ExportHub } from "./export-hub";

export default async function ExportPage() {
  const user = await currentUser("staff");
  if (!user) redirect("/app");
  if (!user.workspaceId || !user.acceptedLegalAt) redirect("/app/settings?setup=1");
  const students = await workspaceStudents();

  return (
    <ExportHub
      students={students.map((s) => ({
        id: s.id,
        name: studentName(s),
        lastName: s.lastName,
        grade: s.grade,
        reports: s.progressReports.map((r) => ({
          id: r.id,
          from: r.from,
          to: r.to,
          published: r.publishedToFamily,
        })),
      }))}
    />
  );
}
