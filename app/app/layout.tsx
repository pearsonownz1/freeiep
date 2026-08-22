import { Suspense } from "react";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { workspaceStudents } from "@/lib/queries";
import { readStore } from "@/lib/store";
import { studentName } from "@/lib/format";
import { StaffChrome } from "@/components/app/staff-chrome";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser("staff");
  if (!user || user.role === "family") redirect("/app");
  const workspace = user.workspaceId
    ? (await readStore()).workspaces.find((w) => w.id === user.workspaceId)
    : null;
  const students = await workspaceStudents();

  return (
    <Suspense fallback={<div className="min-h-screen bg-paper" />}>
      <StaffChrome
        workspaceName={workspace?.name ?? "Demo"}
        email={user.email}
        roleLabel={user.role === "member" ? "Team member" : "Case manager"}
        students={students.map((s) => ({ id: s.id, name: studentName(s), grade: s.grade }))}
      >
        {children}
      </StaffChrome>
    </Suspense>
  );
}
