import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { CsvImport } from "@/components/app/csv-import";

export default async function ImportStudentsPage() {
  const user = await currentUser("staff");
  if (!user) redirect("/app");
  if (user.role !== "owner") redirect("/app/students");
  if (!user.workspaceId || !user.acceptedLegalAt) redirect("/app/settings?setup=1");

  return (
    <div>
      <p className="text-[13px]">
        <Link href="/app/students" className="text-ink-soft hover:underline">
          Students
        </Link>
        <span className="text-ink-soft"> / Import</span>
      </p>
      <h1 className="page-title mt-2 text-[28px] leading-[1.2]">Upload CSV</h1>
      <p className="mt-1 text-[15px] text-ink-soft">
        Columns: name, grade, annual_date, reeval_date. Map them if the headers differ.
      </p>
      <div className="mt-6">
        <CsvImport />
      </div>
    </div>
  );
}
