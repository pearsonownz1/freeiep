import type { Meeting, Student } from "./types";
import { studentName } from "./format";

function icsStamp(iso: string): string {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}00Z`;
}

export function meetingIcs(student: Student, meeting: Meeting): string | null {
  const slot = meeting.slots.find((s) => s.id === meeting.confirmedSlotId) ?? meeting.slots[0];
  if (!slot) return null;
  const uid = `${meeting.id}@freeiep.local`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FreeIEP//Meetings//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${icsStamp(meeting.confirmedAt || new Date().toISOString())}`,
    `DTSTART:${icsStamp(slot.startsAt)}`,
    `DTEND:${icsStamp(slot.endsAt)}`,
    `SUMMARY:IEP meeting — ${studentName(student)}`,
    `DESCRIPTION:Not the official IEP. A working meeting time from FreeIEP.`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}
