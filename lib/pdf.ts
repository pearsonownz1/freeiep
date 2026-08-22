import "server-only";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import type { ProgressReport, Student } from "./types";
import { formatDay, plainLanguagePoint, studentName } from "./format";
import { CLOCK_LABELS, METRIC_LABELS } from "./types";

const paper = rgb(0.969, 0.957, 0.933);
const ink = rgb(0.11, 0.098, 0.09);
const inkSoft = rgb(0.341, 0.325, 0.306);
const meadow = rgb(0.184, 0.42, 0.31);
const line = rgb(0.91, 0.894, 0.863);

async function drawHeader(page: ReturnType<PDFDocument["addPage"]>, font: Awaited<ReturnType<PDFDocument["embedFont"]>>, bold: Awaited<ReturnType<PDFDocument["embedFont"]>>) {
  const { width, height } = page.getSize();
  page.drawRectangle({ x: 36, y: height - 68, width: 22, height: 22, color: meadow, borderColor: meadow });
  page.drawRectangle({ x: 41, y: height - 64, width: 4, height: 10, color: rgb(1, 0.988, 0.969) });
  page.drawRectangle({ x: 48, y: height - 68 + 4, width: 4, height: 16, color: rgb(1, 0.988, 0.969) });
  page.drawText("Free", { x: 66, y: height - 54, size: 13, font, color: ink });
  const freeW = font.widthOfTextAtSize("Free", 13);
  page.drawText("IEP", { x: 66 + freeW, y: height - 54, size: 13, font: bold, color: ink });
  page.drawText("Not the official IEP.", { x: 66, y: height - 68, size: 9, font, color: inkSoft });
  page.drawLine({ start: { x: 36, y: height - 80 }, end: { x: width - 36, y: height - 80 }, thickness: 1, color: line });
}

function wrap(text: string, font: Awaited<ReturnType<PDFDocument["embedFont"]>>, size: number, max: number): string[] {
  const words = (text || "").replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (font.widthOfTextAtSize(next, size) > max && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = next;
    }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [""];
}

export async function buildPlanPdf(student: Student): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page = pdf.addPage([612, 792]);
  let y = 700;
  const left = 36;
  const max = 540;

  const ensure = (need: number) => {
    if (y - need < 48) {
      page.drawText(`${studentName(student)}  ·  ${formatDay(new Date().toISOString())}`, {
        x: left,
        y: 28,
        size: 8,
        font,
        color: inkSoft,
      });
      page = pdf.addPage([612, 792]);
      y = 720;
    }
  };

  await drawHeader(page, font, bold);
  page.drawText(`Working plan — ${studentName(student)}`, { x: left, y, size: 16, font: bold, color: ink });
  y -= 18;
  page.drawText(`Grade ${student.grade}  ·  ${student.state}  ·  ${formatDay(new Date().toISOString())}`, {
    x: left,
    y,
    size: 10,
    font,
    color: inkSoft,
  });
  y -= 28;

  const pl = student.iepPlan.presentLevels;
  for (const [label, body] of [
    ["Strengths", pl.strengths],
    ["Needs", pl.needs],
    ["Baselines", pl.baselines],
  ] as const) {
    ensure(40);
    page.drawText(label, { x: left, y, size: 11, font: bold, color: meadow });
    y -= 16;
    for (const line of wrap(body || "—", font, 10, max)) {
      ensure(14);
      page.drawText(line, { x: left, y, size: 10, font, color: ink });
      y -= 13;
    }
    y -= 10;
  }

  ensure(24);
  page.drawText("Goals", { x: left, y, size: 11, font: bold, color: meadow });
  y -= 18;
  if (!student.iepPlan.goals.length) {
    page.drawText("No goals yet.", { x: left, y, size: 10, font, color: inkSoft });
    y -= 16;
  }
  student.iepPlan.goals.forEach((g, i) => {
    ensure(48);
    page.drawText(`${i + 1}. ${g.title}`, { x: left, y, size: 11, font: bold, color: ink });
    y -= 14;
    const meta = `Metric: ${METRIC_LABELS[g.metric]}  ·  Baseline: ${g.baseline || "—"}  ·  Target: ${g.target} ${g.unit || ""}  ·  By ${g.timelineDate || "—"}`;
    for (const line of wrap(meta, font, 9, max)) {
      ensure(12);
      page.drawText(line, { x: left, y, size: 9, font, color: inkSoft });
      y -= 12;
    }
    y -= 8;
  });

  ensure(24);
  page.drawText("Accommodations", { x: left, y, size: 11, font: bold, color: meadow });
  y -= 16;
  if (!student.iepPlan.accommodations.length) {
    page.drawText("None listed.", { x: left, y, size: 10, font, color: inkSoft });
    y -= 14;
  }
  for (const a of student.iepPlan.accommodations) {
    ensure(14);
    page.drawText(`• ${a.text}`, { x: left, y, size: 10, font, color: ink });
    y -= 13;
  }
  y -= 10;

  ensure(24);
  page.drawText("Services (typed by the teacher)", { x: left, y, size: 11, font: bold, color: meadow });
  y -= 16;
  if (!student.iepPlan.services.length) {
    page.drawText("None listed.", { x: left, y, size: 10, font, color: inkSoft });
    y -= 14;
  }
  for (const svc of student.iepPlan.services) {
    ensure(14);
    page.drawText(`• ${svc.name} — ${svc.minutes} min, ${svc.frequency}`, { x: left, y, size: 10, font, color: ink });
    y -= 13;
  }

  page.drawText(`${studentName(student)}  ·  ${formatDay(new Date().toISOString())}  ·  Not the official IEP.`, {
    x: left,
    y: 28,
    size: 8,
    font,
    color: inkSoft,
  });

  return pdf.save();
}

export async function buildProgressPdf(student: Student, report: ProgressReport): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page = pdf.addPage([612, 792]);
  let y = 700;
  const left = 36;
  const max = 540;
  await drawHeader(page, font, bold);
  page.drawText(`Progress report — ${studentName(student)}`, { x: left, y, size: 16, font: bold, color: ink });
  y -= 16;
  page.drawText(`${formatDay(report.from)} – ${formatDay(report.to)}`, { x: left, y, size: 10, font, color: inkSoft });
  y -= 24;

  for (const sum of report.summaries) {
    const goal = student.iepPlan.goals.find((g) => g.id === sum.goalId);
    if (!goal) continue;
    if (y < 120) {
      page.drawText(`${studentName(student)}  ·  ${formatDay(report.createdAt)}`, { x: left, y: 28, size: 8, font, color: inkSoft });
      page = pdf.addPage([612, 792]);
      y = 740;
    }
    page.drawText(goal.title, { x: left, y, size: 12, font: bold, color: ink });
    y -= 14;
    const points = student.dataPoints
      .filter((p) => p.goalId === goal.id && p.date >= report.from && p.date <= report.to)
      .sort((a, b) => a.date.localeCompare(b.date));
    if (points.length) {
      const last = points[points.length - 1];
      page.drawText(`Latest: ${plainLanguagePoint(goal, last.value)} on ${formatDay(last.date)}`, {
        x: left,
        y,
        size: 9,
        font,
        color: inkSoft,
      });
      y -= 14;
    }
    for (const line of wrap(sum.text, font, 10, max)) {
      page.drawText(line, { x: left, y, size: 10, font, color: ink });
      y -= 13;
    }
    y -= 14;
  }

  page.drawText(`${studentName(student)}  ·  ${formatDay(report.createdAt)}  ·  Not the official IEP.`, {
    x: left,
    y: 28,
    size: 8,
    font,
    color: inkSoft,
  });
  void paper;
  void CLOCK_LABELS;
  return pdf.save();
}
