import { notFound, redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { familyAccessForStudent, getStudentForStaff } from "@/lib/queries";
import { StudentView } from "./student-view";
import { hasAssistKey } from "@/lib/assist";

export default async function StudentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await currentUser("staff");
  if (!user) redirect("/app");
  const { id } = await params;
  const student = await getStudentForStaff(id);
  if (!student) notFound();
  const tab = (await searchParams).tab || "plan";
  const familyAccess = await familyAccessForStudent(id);
  return (
    <StudentView
      student={student}
      tab={tab}
      assistOn={hasAssistKey(user.assistKey)}
      canEdit={user.role === "owner"}
      familyUsers={familyAccess.users}
      familyPending={familyAccess.pending}
    />
  );
}
