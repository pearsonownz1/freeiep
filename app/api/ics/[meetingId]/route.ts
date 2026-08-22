import { NextResponse } from "next/server";
import { staffCanSeeStudent } from "@/lib/access";
import { currentUser } from "@/lib/auth";
import { meetingIcs } from "@/lib/ics";
import { readStore } from "@/lib/store";

export async function GET(_req: Request, { params }: { params: Promise<{ meetingId: string }> }) {
  const { meetingId } = await params;
  const store = (await readStore());
  const student = store.students.find((s) => s.meetings.some((m) => m.id === meetingId));
  const meeting = student?.meetings.find((m) => m.id === meetingId);
  if (!student || !meeting) return new NextResponse("Not found", { status: 404 });
  const staff = await currentUser("staff");
  const family = await currentUser("family");
  const staffOk = staff && staff.role !== "family" && staffCanSeeStudent(staff, student);
  const familyOk = family && family.studentId === student.id && !(student.revokedFamilyEmails ?? []).includes(family.email);
  if (!staffOk && !familyOk) return new NextResponse("Forbidden", { status: 403 });
  const ics = meetingIcs(student, meeting);
  if (!ics) return new NextResponse("No time yet", { status: 400 });
  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar",
      "Content-Disposition": `attachment; filename="meeting.ics"`,
    },
  });
}
