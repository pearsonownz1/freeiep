import { NextResponse } from "next/server";
import { staffCanSeeStudent } from "@/lib/access";
import { currentUser } from "@/lib/auth";
import { lastnameFilename } from "@/lib/format";
import { buildProgressPdf } from "@/lib/pdf";
import { readStore } from "@/lib/store";

export async function GET(_req: Request, { params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params;
  const store = (await readStore());
  const student = store.students.find((s) => s.progressReports.some((r) => r.id === reportId));
  const report = student?.progressReports.find((r) => r.id === reportId);
  if (!student || !report) return new NextResponse("Not found", { status: 404 });
  const staff = await currentUser("staff");
  const family = await currentUser("family");
  const staffOk = staff && staff.role !== "family" && staffCanSeeStudent(staff, student);
  const familyOk = family && family.studentId === student.id && report.publishedToFamily && !(student.revokedFamilyEmails ?? []).includes(family.email);
  if (!staffOk && !familyOk) return new NextResponse("Forbidden", { status: 403 });
  const bytes = await buildProgressPdf(student, report);
  const name = lastnameFilename(student.lastName, "progress", report.createdAt.slice(0, 10));
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${name}"`,
    },
  });
}
