import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { readStore, readUpload } from "@/lib/store";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = await readStore();
  const student = store.students.find((s) => s.documents.some((d) => d.id === id));
  const doc = student?.documents.find((d) => d.id === id);
  if (!student || !doc) return new NextResponse("Not found", { status: 404 });

  const staff = await currentUser("staff");
  const family = await currentUser("family");
  const staffOk = staff && staff.role !== "family" && staff.workspaceId === student.workspaceId;
  const familyOk = family && family.studentId === student.id && doc.publishedToFamily;
  if (!staffOk && !familyOk) return new NextResponse("Forbidden", { status: 403 });

  const buf = await readUpload(doc.storedName);
  if (!buf) return new NextResponse("Missing file", { status: 404 });
  return new NextResponse(buf, {
    headers: {
      "Content-Type": doc.mime,
      "Content-Disposition": `inline; filename="${doc.filename}"`,
    },
  });
}
