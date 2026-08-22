import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { fileHubRows, workspaceStudents } from "@/lib/queries";
import { mutateStore } from "@/lib/store";
import { seedDemoDocuments } from "@/lib/sample";
import { studentName } from "@/lib/format";
import { FilesHub } from "./files-hub";

export default async function FilesPage() {
  const user = await currentUser("staff");
  if (!user) redirect("/app");
  if (!user.workspaceId || !user.acceptedLegalAt) redirect("/app/settings?setup=1");
  if (user.email === "demo@freeiep.app") {
    await mutateStore((s) => {
      seedDemoDocuments(s, user.workspaceId!);
    });
  }
  const students = await workspaceStudents();
  const rows = await fileHubRows();
  const published = rows.filter((r) => r.publishedToFamily).length;
  return (
    <FilesHub
      rows={rows}
      students={students.map((s) => ({ id: s.id, name: studentName(s) }))}
      canUpload={user.role === "owner"}
      kpis={{ files: rows.length, published, staffOnly: rows.length - published }}
    />
  );
}
