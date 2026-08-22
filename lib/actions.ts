"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  consumeToken,
  createMagicToken,
  currentUser,
  getToken,
  setSession,
  clearSession,
  upsertUser,
} from "./auth";
import { clockTone } from "./clocks";
import { addDays, isoDate, nid } from "./ids";
import { lastnameFilename } from "./format";
import { seedSampleCaseload } from "./sample";
import { mutateStore, readStore, writeUpload, deleteUpload } from "./store";
import type {
  Goal,
  Meeting,
  MeetingSlot,
  Metric,
  Notice,
  ProgressReport,
  Student,
} from "./types";

function fail(message: string): never {
  throw new Error(message);
}

async function requireStaff() {
  const user = await currentUser("staff");
  if (!user || user.role === "family") fail("Sign in as staff first.");
  if (!user.acceptedLegalAt) fail("Accept Privacy and Terms before you save a student.");
  if (!user.workspaceId) fail("Create a workspace first.");
  return user;
}

function touch(studentId?: string) {
  revalidatePath("/app");
  revalidatePath("/app/calendar");
  revalidatePath("/family");
  if (studentId) revalidatePath(`/app/students/${studentId}`);
}

function activity(student: Student, who: string, verb: string, object: string) {
  student.activity.unshift({
    id: nid("act"),
    who,
    verb,
    object,
    at: new Date().toISOString(),
  });
  student.activity = student.activity.slice(0, 80);
}

export async function sendLoginLink(formData: FormData): Promise<{ url: string }> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email || !email.includes("@")) fail("Enter a work email.");
  await upsertUser(email, { role: "owner" });
  const { url } = await createMagicToken({ kind: "login", email });
  return { url };
}

export async function redeemLogin(tokenId: string) {
  const token = await consumeToken(tokenId);
  if (!token || token.kind !== "login" || !token.email) {
    fail("That link is expired or already used. Request a new one.");
  }
  const user = await upsertUser(token.email, { role: "owner" });
  await setSession(user.id, "staff");
  if (!user.workspaceId || !user.acceptedLegalAt) redirect("/app/settings?setup=1");
  redirect("/app");
}

export async function logout() {
  await clearSession("both");
  redirect("/");
}

export async function createWorkspace(formData: FormData) {
  const user = await currentUser("staff");
  if (!user) fail("Sign in first.");
  const school = String(formData.get("school") || "").trim();
  const state = String(formData.get("state") || "").trim().toUpperCase();
  const accept = formData.get("accept");
  if (!school) fail("School name is required.");
  if (!state) fail("State is required.");
  if (!accept) fail("Accept Privacy and Terms before you continue.");
  const workspaceId = user.workspaceId ?? nid("ws");
  await mutateStore((s) => {
    const u = s.users.find((x) => x.id === user.id);
    if (!u) return;
    let ws = s.workspaces.find((w) => w.id === workspaceId);
    if (!ws) {
      ws = {
        id: workspaceId,
        name: school,
        state,
        ownerId: u.id,
        createdAt: new Date().toISOString(),
      };
      s.workspaces.push(ws);
    } else {
      ws.name = school;
      ws.state = state;
    }
    u.workspaceId = workspaceId;
    u.acceptedLegalAt = u.acceptedLegalAt ?? new Date().toISOString();
    u.name = String(formData.get("name") || u.name || "").trim() || u.email;
  });
  revalidatePath("/app");
  redirect("/app");
}

function parseName(raw: string): { firstName: string; lastName: string } {
  const name = raw.trim();
  if (name.includes(",")) {
    const [last, rest] = name.split(",", 2);
    return { lastName: last.trim(), firstName: (rest || "").trim() || last.trim() };
  }
  const parts = name.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  return { firstName: parts.slice(0, -1).join(" "), lastName: parts[parts.length - 1] };
}

function defaultClocks(annual?: string, reeval?: string, state?: string) {
  const today = isoDate();
  return [
    { id: nid("clk"), kind: "annual_review" as const, dueOn: annual || addDays(today, 365) },
    { id: nid("clk"), kind: "reevaluation" as const, dueOn: reeval || addDays(today, 1095) },
    { id: nid("clk"), kind: "progress_report" as const, dueOn: addDays(today, 45) },
  ];
}

export async function createStudent(formData: FormData) {
  const user = await requireStaff();
  const name = String(formData.get("name") || "").trim();
  const grade = String(formData.get("grade") || "").trim();
  const state = String(formData.get("state") || "").trim().toUpperCase();
  const annual = String(formData.get("annual_date") || "").trim();
  const reeval = String(formData.get("reeval_date") || "").trim();
  if (!name) fail("Name is required.");
  if (!grade) fail("Grade is required.");
  if (!state) fail("State is required.");
  const { firstName, lastName } = parseName(name);
  const student: Student = {
    id: nid("stu"),
    workspaceId: user.workspaceId!,
    firstName,
    lastName,
    grade,
    state,
    documents: [],
    iepPlan: {
      presentLevels: { strengths: "", needs: "", baselines: "" },
      goals: [],
      accommodations: [],
      services: [],
    },
    dataPoints: [],
    clocks: defaultClocks(annual, reeval, state),
    tasks: [
      { id: nid("tsk"), title: "Send notice", done: false, assignees: [] },
      { id: nid("tsk"), title: "Log data", done: false, assignees: [] },
      { id: nid("tsk"), title: "Attach eval", done: false, assignees: [] },
    ],
    meetings: [],
    notices: [],
    activity: [],
    progressReports: [],
    createdAt: new Date().toISOString(),
  };
  activity(student, user.email, "added", `${firstName} ${lastName}`);
  await mutateStore((s) => s.students.push(student));
  touch(student.id);
  redirect(`/app/students/${student.id}`);
}

export async function loadSampleCaseload() {
  const user = await requireStaff();
  const existing = (await readStore()).students.filter((s) => s.workspaceId === user.workspaceId);
  if (existing.length >= 3) {
    redirect("/app");
  }
  await seedSampleCaseload(user.workspaceId!, user.email);
  touch();
  redirect("/app");
}

export async function importCsv(formData: FormData) {
  const user = await requireStaff();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) fail("Choose a CSV file.");
  const mapName = String(formData.get("col_name") || "name");
  const mapGrade = String(formData.get("col_grade") || "grade");
  const mapAnnual = String(formData.get("col_annual") || "annual_date");
  const mapReeval = String(formData.get("col_reeval") || "reeval_date");
  const text = await file.text();
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) fail("CSV needs a header row and at least one student.");
  const headers = splitCsv(lines[0]).map((h) => h.trim().toLowerCase());
  const idx = (wanted: string) => {
    const i = headers.indexOf(wanted.toLowerCase());
    return i;
  };
  const iName = idx(mapName);
  const iGrade = idx(mapGrade);
  const iAnnual = idx(mapAnnual);
  const iReeval = idx(mapReeval);
  if (iName < 0 || iGrade < 0) fail("Map the name and grade columns before import.");
  const created: string[] = [];
  await mutateStore((s) => {
    for (const line of lines.slice(1)) {
      const cols = splitCsv(line);
      const name = (cols[iName] || "").trim();
      const grade = (cols[iGrade] || "").trim();
      if (!name || !grade) continue;
      const { firstName, lastName } = parseName(name);
      const annual = iAnnual >= 0 ? (cols[iAnnual] || "").trim() : "";
      const reeval = iReeval >= 0 ? (cols[iReeval] || "").trim() : "";
      const student: Student = {
        id: nid("stu"),
        workspaceId: user.workspaceId!,
        firstName,
        lastName,
        grade,
        state: s.workspaces.find((w) => w.id === user.workspaceId)?.state || "TX",
        documents: [],
        iepPlan: {
          presentLevels: { strengths: "", needs: "", baselines: "" },
          goals: [],
          accommodations: [],
          services: [],
        },
        dataPoints: [],
        clocks: defaultClocks(annual, reeval),
        tasks: [],
        meetings: [],
        notices: [],
        activity: [
          {
            id: nid("act"),
            who: user.email,
            verb: "imported",
            object: `${firstName} ${lastName}`,
            at: new Date().toISOString(),
          },
        ],
        progressReports: [],
        createdAt: new Date().toISOString(),
      };
      s.students.push(student);
      created.push(student.id);
    }
  });
  if (!created.length) fail("No valid rows. Check the column map.");
  touch();
}

function splitCsv(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (q && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else q = !q;
    } else if (ch === "," && !q) {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out;
}

export async function savePresentLevels(studentId: string, field: "strengths" | "needs" | "baselines", value: string) {
  const user = await requireStaff();
  await mutateStore((s) => {
    const student = s.students.find((x) => x.id === studentId && x.workspaceId === user.workspaceId);
    if (!student) fail("Student not found.");
    student.iepPlan.presentLevels[field] = value;
  });
  touch(studentId);
}

export async function saveGoal(studentId: string, raw: {
  id?: string;
  title: string;
  metric: string;
  baseline: string;
  target: string;
  unit: string;
  timelineDate: string;
  standardCode?: string;
}) {
  const user = await requireStaff();
  if (!raw.metric) fail("A goal needs a metric.");
  if (!String(raw.target).trim()) fail("A goal needs a target.");
  if (!raw.title.trim()) fail("Give the goal a name.");
  const metric = raw.metric as Metric;
  await mutateStore((s) => {
    const student = s.students.find((x) => x.id === studentId && x.workspaceId === user.workspaceId);
    if (!student) fail("Student not found.");
    const goal: Goal = {
      id: raw.id || nid("gol"),
      title: raw.title.trim(),
      metric,
      baseline: raw.baseline,
      target: String(raw.target).trim(),
      unit: raw.unit,
      timelineDate: raw.timelineDate,
      standardCode: raw.standardCode,
      objectives: [],
    };
    const i = student.iepPlan.goals.findIndex((g) => g.id === goal.id);
    if (i >= 0) student.iepPlan.goals[i] = goal;
    else student.iepPlan.goals.push(goal);
    activity(student, user.email, raw.id ? "updated" : "wrote", `goal “${goal.title}”`);
  });
  touch(studentId);
}

export async function deleteGoal(studentId: string, goalId: string) {
  const user = await requireStaff();
  await mutateStore((s) => {
    const student = s.students.find((x) => x.id === studentId && x.workspaceId === user.workspaceId);
    if (!student) fail("Student not found.");
    student.iepPlan.goals = student.iepPlan.goals.filter((g) => g.id !== goalId);
  });
  touch(studentId);
}

export async function addAccommodation(studentId: string, text: string) {
  const user = await requireStaff();
  const t = text.trim();
  if (!t) fail("Write the accommodation first.");
  await mutateStore((s) => {
    const student = s.students.find((x) => x.id === studentId && x.workspaceId === user.workspaceId);
    if (!student) fail("Student not found.");
    student.iepPlan.accommodations.push({ id: nid("acc"), text: t });
  });
  touch(studentId);
}

export async function removeAccommodation(studentId: string, id: string) {
  const user = await requireStaff();
  await mutateStore((s) => {
    const student = s.students.find((x) => x.id === studentId && x.workspaceId === user.workspaceId);
    if (!student) return;
    student.iepPlan.accommodations = student.iepPlan.accommodations.filter((a) => a.id !== id);
  });
  touch(studentId);
}

export async function addService(studentId: string, name: string, minutes: string, frequency: string) {
  const user = await requireStaff();
  if (!name.trim()) fail("Name the service.");
  await mutateStore((s) => {
    const student = s.students.find((x) => x.id === studentId && x.workspaceId === user.workspaceId);
    if (!student) fail("Student not found.");
    student.iepPlan.services.push({
      id: nid("svc"),
      name: name.trim(),
      minutes: minutes.trim(),
      frequency: frequency.trim(),
    });
    activity(student, user.email, "added", `service ${name.trim()}`);
  });
  touch(studentId);
}

export async function removeService(studentId: string, id: string) {
  const user = await requireStaff();
  await mutateStore((s) => {
    const student = s.students.find((x) => x.id === studentId && x.workspaceId === user.workspaceId);
    if (!student) return;
    student.iepPlan.services = student.iepPlan.services.filter((a) => a.id !== id);
  });
  touch(studentId);
}

export async function logProgress(formData: FormData) {
  const user = await requireStaff();
  const studentId = String(formData.get("studentId") || "");
  const goalId = String(formData.get("goalId") || "");
  const date = String(formData.get("date") || isoDate());
  const value = Number(formData.get("value"));
  const note = String(formData.get("note") || "");
  if (!goalId) fail("Pick a goal.");
  if (!Number.isFinite(value)) fail("Enter a number you can graph.");
  let photoId: string | undefined;
  const photo = formData.get("photo");
  if (photo instanceof File && photo.size > 0) {
    const saved = await saveUpload(photo, studentId, "progress-photo", false);
    photoId = saved.id;
  }
  await mutateStore((s) => {
    const student = s.students.find((x) => x.id === studentId && x.workspaceId === user.workspaceId);
    if (!student) fail("Student not found.");
    if (!student.iepPlan.goals.some((g) => g.id === goalId)) fail("Goal not found.");
    student.dataPoints.push({
      id: nid("dp"),
      goalId,
      date,
      value,
      note,
      photoId,
      authorId: user.id,
    });
    activity(student, user.email, "logged", `${value} on a goal`);
  });
  touch(studentId);
}

const ALLOWED_MIME = new Set(["application/pdf", "image/png", "image/jpeg", "image/webp"]);
const ALLOWED_EXT = new Set(["pdf", "png", "jpg", "jpeg", "webp"]);

export async function saveUpload(
  file: File,
  studentId: string,
  kind: string,
  publishedToFamily: boolean,
) {
  const user = await requireStaff();
  if (file.size > 10 * 1024 * 1024) fail("Files stay under 10 MB.");
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  if (!ALLOWED_EXT.has(ext) || !ALLOWED_MIME.has(file.type || guessMime(ext))) {
    fail("Only pdf, png, jpg, and webp.");
  }
  const id = nid("fil");
  const storedName = `${id}.${ext === "jpeg" ? "jpg" : ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  await writeUpload(storedName, buf);
  const doc = {
    id,
    filename: file.name,
    storedName,
    mime: file.type || guessMime(ext),
    kind,
    publishedToFamily,
    size: file.size,
    createdAt: new Date().toISOString(),
  };
  await mutateStore((s) => {
    const student = s.students.find((x) => x.id === studentId && x.workspaceId === user.workspaceId);
    if (!student) fail("Student not found.");
    if (student.documents.length >= 50) fail("50 files per student in this version.");
    student.documents.push(doc);
    activity(student, user.email, "attached", file.name);
  });
  touch(studentId);
  return doc;
}

function guessMime(ext: string): string {
  if (ext === "pdf") return "application/pdf";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}

export async function uploadFile(formData: FormData) {
  const studentId = String(formData.get("studentId") || "");
  const file = formData.get("file");
  const published = formData.get("published") === "on";
  if (!(file instanceof File)) fail("Choose a file.");
  await saveUpload(file, studentId, String(formData.get("kind") || "file"), published);
}

export async function setFilePublished(studentId: string, fileId: string, published: boolean) {
  const user = await requireStaff();
  await mutateStore((s) => {
    const student = s.students.find((x) => x.id === studentId && x.workspaceId === user.workspaceId);
    const doc = student?.documents.find((d) => d.id === fileId);
    if (!doc) fail("File not found.");
    doc.publishedToFamily = published;
  });
  touch(studentId);
}

export async function publishProgressReport(formData: FormData) {
  const user = await requireStaff();
  const studentId = String(formData.get("studentId") || "");
  const from = String(formData.get("from") || "");
  const to = String(formData.get("to") || isoDate());
  const publishedToFamily = formData.get("published") === "on";
  const report: ProgressReport = {
    id: nid("pr"),
    from,
    to,
    summaries: [],
    publishedToFamily,
    createdAt: new Date().toISOString(),
  };
  await mutateStore((s) => {
    const student = s.students.find((x) => x.id === studentId && x.workspaceId === user.workspaceId);
    if (!student) fail("Student not found.");
    for (const g of student.iepPlan.goals) {
      const text = String(formData.get(`summary_${g.id}`) || "").trim();
      if (text) report.summaries.push({ goalId: g.id, text });
    }
    if (!report.summaries.length) fail("Write 2–4 sentences for at least one goal.");
    student.progressReports.push(report);
    activity(student, user.email, "published", "a progress report");
  });
  touch(studentId);
}

export async function setReportPublished(studentId: string, reportId: string, published: boolean) {
  const user = await requireStaff();
  await mutateStore((s) => {
    const student = s.students.find((x) => x.id === studentId && x.workspaceId === user.workspaceId);
    const r = student?.progressReports.find((p) => p.id === reportId);
    if (!r) fail("Report not found.");
    r.publishedToFamily = published;
  });
  touch(studentId);
}

export async function updateClocks(formData: FormData) {
  const user = await requireStaff();
  const studentId = String(formData.get("studentId") || "");
  await mutateStore((s) => {
    const student = s.students.find((x) => x.id === studentId && x.workspaceId === user.workspaceId);
    if (!student) fail("Student not found.");
    const set = (kind: Student["clocks"][number]["kind"], dueOn: string) => {
      if (!dueOn) return;
      const c = student.clocks.find((x) => x.kind === kind);
      if (c) c.dueOn = dueOn;
      else student.clocks.push({ id: nid("clk"), kind, dueOn });
    };
    set("annual_review", String(formData.get("annual") || ""));
    set("reevaluation", String(formData.get("reeval") || ""));
    set("progress_report", String(formData.get("progress") || ""));
    set("meeting_notice", String(formData.get("notice") || ""));
  });
  touch(studentId);
}

export async function toggleTask(studentId: string, taskId: string) {
  const user = await requireStaff();
  await mutateStore((s) => {
    const student = s.students.find((x) => x.id === studentId && x.workspaceId === user.workspaceId);
    const t = student?.tasks.find((x) => x.id === taskId);
    if (!t) return;
    t.done = !t.done;
  });
  touch(studentId);
}

export async function addTask(studentId: string, title: string, dueOn?: string) {
  const user = await requireStaff();
  if (!title.trim()) fail("Name the task.");
  await mutateStore((s) => {
    const student = s.students.find((x) => x.id === studentId && x.workspaceId === user.workspaceId);
    if (!student) fail("Student not found.");
    student.tasks.push({ id: nid("tsk"), title: title.trim(), dueOn, done: false, assignees: [] });
  });
  touch(studentId);
}

export async function proposeMeeting(formData: FormData): Promise<{ links: { email: string; accept: string; suggest: string; decline: string }[] }> {
  const user = await requireStaff();
  const studentId = String(formData.get("studentId") || "");
  const type = String(formData.get("type") || "annual") as Meeting["type"];
  const roleBrief = String(formData.get("roleBrief") || "");
  const emails = String(formData.get("emails") || "")
    .split(/[,;\s]+/)
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.includes("@"));
  if (!emails.length) fail("Add at least one attendee email.");
  const slots: MeetingSlot[] = [];
  for (let i = 1; i <= 3; i++) {
    const start = String(formData.get(`slot${i}_start`) || "");
    const end = String(formData.get(`slot${i}_end`) || "");
    if (start && end) slots.push({ id: nid("slt"), startsAt: new Date(start).toISOString(), endsAt: new Date(end).toISOString() });
  }
  if (!slots.length) fail("Propose at least one time.");
  const meeting: Meeting = {
    id: nid("mtg"),
    type,
    status: "finding_time",
    slots,
    attendees: emails.map((email) => ({ email })),
    roleBrief,
  };
  await mutateStore((s) => {
    const student = s.students.find((x) => x.id === studentId && x.workspaceId === user.workspaceId);
    if (!student) fail("Student not found.");
    student.meetings.push(meeting);
    const noticeDue = isoDate(new Date(slots[0].startsAt));
    const c = student.clocks.find((x) => x.kind === "meeting_notice");
    if (c) c.dueOn = noticeDue;
    else student.clocks.push({ id: nid("clk"), kind: "meeting_notice", dueOn: addDays(noticeDue, -10) });
    activity(student, user.email, "proposed", `a ${type} meeting`);
  });
  const links = [];
  for (const email of emails) {
    const accept = await createMagicToken({
      kind: "meeting_accept",
      email,
      studentId,
      meetingId: meeting.id,
      slotId: slots[0].id,
    });
    const suggest = await createMagicToken({
      kind: "meeting_suggest",
      email,
      studentId,
      meetingId: meeting.id,
    });
    const decline = await createMagicToken({
      kind: "meeting_decline",
      email,
      studentId,
      meetingId: meeting.id,
    });
    links.push({ email, accept: accept.url, suggest: suggest.url, decline: decline.url });
  }
  // extra accept tokens per slot
  for (const slot of slots.slice(1)) {
    for (const email of emails) {
      await createMagicToken({
        kind: "meeting_accept",
        email,
        studentId,
        meetingId: meeting.id,
        slotId: slot.id,
      });
    }
  }
  touch(studentId);
  return { links };
}

export async function inviteFamily(formData: FormData): Promise<{ url: string }> {
  const user = await requireStaff();
  const studentId = String(formData.get("studentId") || "");
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email.includes("@")) fail("Enter a family email.");
  const student = (await readStore()).students.find((s) => s.id === studentId && s.workspaceId === user.workspaceId);
  if (!student) fail("Student not found.");
  await upsertUser(email, {
    role: "family",
    workspaceId: user.workspaceId,
    studentId,
  });
  const { url } = await createMagicToken({
    kind: "family_invite",
    email,
    studentId,
    workspaceId: user.workspaceId!,
  });
  await mutateStore((s) => {
    const st = s.students.find((x) => x.id === studentId);
    if (st) activity(st, user.email, "invited", email);
  });
  touch(studentId);
  return { url };
}

export async function redeemPublicToken(tokenId: string, formData?: FormData) {
  const token = await getToken(tokenId);
  if (!token) fail("That link expired. Ask the teacher for a new one.");
  if (token.kind === "family_invite") {
    const used = await consumeToken(tokenId);
    if (!used?.email || !used.studentId) fail("Invite is incomplete.");
    const user = await upsertUser(used.email, {
      role: "family",
      workspaceId: used.workspaceId ?? null,
      studentId: used.studentId,
    });
    await setSession(user.id, "family");
    redirect("/family");
  }
  if (token.kind === "meeting_accept" || token.kind === "meeting_suggest" || token.kind === "meeting_decline") {
    const reply = token.kind === "meeting_accept" ? "accept" : token.kind === "meeting_suggest" ? "suggest" : "decline";
    const suggestNote = formData ? String(formData.get("suggestNote") || "") : "";
    const slotId = formData ? String(formData.get("slotId") || token.slotId || "") : token.slotId;
    await mutateStore((s) => {
      const student = s.students.find((x) => x.id === token.studentId);
      const meeting = student?.meetings.find((m) => m.id === token.meetingId);
      if (!student || !meeting) fail("Meeting not found.");
      let att = meeting.attendees.find((a) => a.email === token.email);
      if (!att) {
        att = { email: token.email || "guest" };
        meeting.attendees.push(att);
      }
      att.reply = reply;
      att.repliedAt = new Date().toISOString();
      att.suggestNote = suggestNote || att.suggestNote;
      if (reply === "accept") {
        att.slotId = slotId;
        if (meeting.status !== "confirmed") {
          meeting.status = "confirmed";
          meeting.confirmedAt = new Date().toISOString();
          meeting.confirmedSlotId = slotId;
        }
      }
      activity(student, token.email || "family", reply === "accept" ? "accepted" : reply === "decline" ? "declined" : "suggested times for", "the meeting");
    });
    if (token.kind !== "meeting_suggest") {
      await consumeToken(tokenId);
    }
    return { ok: true as const, reply };
  }
  fail("Unknown link.");
}

export async function acknowledgeNotice(noticeId: string) {
  const user = await currentUser("family");
  if (!user?.studentId) fail("Family sign-in required.");
  await mutateStore((s) => {
    const student = s.students.find((x) => x.id === user.studentId);
    const n = student?.notices.find((x) => x.id === noticeId);
    if (!n) fail("Notice not found.");
    n.ackedAt = new Date().toISOString();
    if (student) activity(student, user.email, "acknowledged", "a notice");
  });
  revalidatePath("/family");
  revalidatePath("/app");
}

export async function sendNotice(formData: FormData) {
  const user = await requireStaff();
  const studentId = String(formData.get("studentId") || "");
  const notice: Notice = {
    id: nid("pwn"),
    date: String(formData.get("date") || isoDate()),
    proposeOrRefuse: formData.get("proposeOrRefuse") === "refuse" ? "refuse" : "propose",
    description: String(formData.get("description") || "").trim(),
    reasons: String(formData.get("reasons") || "").trim(),
    options: String(formData.get("options") || "").trim(),
    sentAt: new Date().toISOString(),
  };
  if (!notice.description) fail("Describe what you propose or refuse.");
  await mutateStore((s) => {
    const student = s.students.find((x) => x.id === studentId && x.workspaceId === user.workspaceId);
    if (!student) fail("Student not found.");
    student.notices.push(notice);
    activity(student, user.email, "sent", "a written notice");
  });
  touch(studentId);
}

export async function saveAssistKey(formData: FormData) {
  const user = await currentUser("staff");
  if (!user) fail("Sign in first.");
  const key = String(formData.get("assistKey") || "").trim();
  if (!key) return;
  await mutateStore((s) => {
    const u = s.users.find((x) => x.id === user.id);
    if (u) u.assistKey = key || undefined;
  });
  revalidatePath("/app/settings");
}

export async function exportMyData(): Promise<{ json: string }> {
  const user = await requireStaff();
  const store = (await readStore());
  const payload = {
    user: store.users.find((u) => u.id === user.id),
    workspace: store.workspaces.find((w) => w.id === user.workspaceId),
    students: store.students.filter((s) => s.workspaceId === user.workspaceId),
  };
  return { json: JSON.stringify(payload, null, 2) };
}

export async function deleteStudent(studentId: string) {
  const user = await requireStaff();
  const names: string[] = [];
  await mutateStore((s) => {
    const student = s.students.find((x) => x.id === studentId && x.workspaceId === user.workspaceId);
    if (!student) return;
    for (const d of student.documents) {
      names.push(d.storedName);
    }
    s.students = s.students.filter((x) => x.id !== studentId);
    for (const u of s.users) {
      if (u.studentId === studentId) u.studentId = undefined;
    }
  });
  for (const name of names) {
    await deleteUpload(name);
  }
  touch();
  redirect("/app");
}

export async function familyMeetingReply(formData: FormData) {
  const user = await currentUser("family");
  if (!user?.studentId) fail("Family sign-in required.");
  const meetingId = String(formData.get("meetingId") || "");
  const reply = String(formData.get("reply") || "") as "accept" | "suggest" | "decline";
  const slotId = String(formData.get("slotId") || "");
  const suggestNote = String(formData.get("suggestNote") || "");
  await mutateStore((s) => {
    const student = s.students.find((x) => x.id === user.studentId);
    const meeting = student?.meetings.find((m) => m.id === meetingId);
    if (!student || !meeting) fail("Meeting not found.");
    let att = meeting.attendees.find((a) => a.email === user.email);
    if (!att) {
      att = { email: user.email };
      meeting.attendees.push(att);
    }
    att.reply = reply;
    att.repliedAt = new Date().toISOString();
    att.slotId = slotId || att.slotId;
    att.suggestNote = suggestNote || att.suggestNote;
    if (reply === "accept" && meeting.status !== "confirmed") {
      meeting.status = "confirmed";
      meeting.confirmedAt = new Date().toISOString();
      meeting.confirmedSlotId = slotId || meeting.slots[0]?.id;
    }
    activity(student, user.email, reply, "the meeting");
  });
  revalidatePath("/family");
}

void clockTone;
void lastnameFilename;
