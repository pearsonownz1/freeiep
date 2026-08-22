import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { isoDate } from "@/lib/ids";
import { lastnameFilename } from "@/lib/format";
import { buildPlanPdf } from "@/lib/pdf";
import { readStore } from "@/lib/store";

export async function GET(_req: Request, { params }: { params: Promise<{ studentId: string }> }) {
  const user = await currentUser("staff");
  if (!user || user.role === "family") return new NextResponse("Forbidden", { status: 403 });
  const { studentId } = await params;
  const student = (await readStore()).students.find((s) => s.id === studentId && s.workspaceId === user.workspaceId);
  if (!student) return new NextResponse("Not found", { status: 404 });
  const bytes = await buildPlanPdf(student);
  const name = lastnameFilename(student.lastName, "plan", isoDate());
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${name}"`,
    },
  });
}
