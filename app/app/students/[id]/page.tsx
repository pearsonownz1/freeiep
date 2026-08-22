import { notFound, redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { getStudentForStaff } from "@/lib/queries";
import { StudentView } from "./student-view";

export default async function StudentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const user = await currentUser("staff");
  if (!user) redirect("/login");
  const { id } = await params;
  const student = await getStudentForStaff(id);
  if (!student) notFound();
  const tab = (await searchParams).tab || "plan";
  return <StudentView student={student} tab={tab} assistOn={Boolean(user.assistKey && user.assistKey !== "••••••••")} />;
}
