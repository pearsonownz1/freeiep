"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { actorName, staffCanSeeStudent } from "./access";
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
  StoreData,
  Student,
  User,
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

async function requireOwner() {
  const user = await requireStaff();
  if (user.role !== "owner") fail("Only the case manager can do that.");
  return user;
}

function staffStudent(s: StoreData, user: User, studentId: string): Student {
  const student = s.students.find((x) => x.id === studentId);
  if (!student || !staffCanSeeStudent(user, student)) fail("Student not found.");
  return student;
}

function goalLabel(student: Student, goalId: string): string {
  const i = student.iepPlan.goals.findIndex((g) => g.id === goalId);
  if (i < 0) return "a goal";
  return `Goal ${i + 1}`;
}

function formatLoggedValue(student: Student, goalId: string, value: number): string {
  const goal = student.iepPlan.goals.find((g) => g.id === goalId);
  if (!goal) return String(value);
  if (goal.metric === "percent_accuracy") return `${value}%`;
  if (goal.metric === "wcpm") return `${value} wcpm`;
  if (goal.unit) return `${value} ${goal.unit}`;
  return String(value);
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
  const user = await requireOwner();
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
  activity(student, actorName(user), "added", `${firstName} ${lastName}`);
  await mutateStore((s) => s.students.push(student));
  touch(student.id);
  redirect(`/app/students/${student.id}`);
}

export async function loadSampleCaseload() {
  const user = await requireOwner();
  const existing = (await readStore()).students.filter((s) => s.workspaceId === user.workspaceId);
  if (existing.length >= 3) {
    redirect("/app");
  }
  await seedSampleCaseload(user.workspaceId!, user.email);
  touch();
  redirect("/app");
}

export async function importCsv(formData: FormData) {
  const user = await requireOwner();
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
  const user = await requireOwner();
  await mutateStore((s) => {
    const student = staffStudent(s, user, studentId);
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
  const user = await requireOwner();
  if (!raw.metric) fail("A goal needs a metric.");
  if (!String(raw.target).trim()) fail("A goal needs a target.");
  if (!raw.title.trim()) fail("Give the goal a name.");
  const metric = raw.metric as Metric;
  await mutateStore((s) => {
    const student = staffStudent(s, user, studentId);
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
    activity(student, actorName(user), raw.id ? "updated" : "wrote", `goal “${goal.title}”`);
  });
  touch(studentId);
}

export async function deleteGoal(studentId: string, goalId: string) {
  const user = await requireOwner();
  await mutateStore((s) => {
    const student = staffStudent(s, user, studentId);
    student.iepPlan.goals = student.iepPlan.goals.filter((g) => g.id !== goalId);
  });
  touch(studentId);
}

export async function addAccommodation(studentId: string, text: string) {
  const user = await requireOwner();
  const t = text.trim();
  if (!t) fail("Write the accommodation first.");
  await mutateStore((s) => {
    const student = staffStudent(s, user, studentId);
    student.iepPlan.accommodations.push({ id: nid("acc"), text: t });
  });
  touch(studentId);
}

export async function removeAccommodation(studentId: string, id: string) {
  const user = await requireOwner();
  await mutateStore((s) => {
    const student = s.students.find((x) => x.id === studentId);
    if (!student || !staffCanSeeStudent(user, student)) return;
    student.iepPlan.accommodations = student.iepPlan.accommodations.filter((a) => a.id !== id);
  });
  touch(studentId);
}

export async function addService(studentId: string, name: string, minutes: string, frequency: string) {
  const user = await requireOwner();
  if (!name.trim()) fail("Name the service.");
  await mutateStore((s) => {
    const student = staffStudent(s, user, studentId);
    student.iepPlan.services.push({
      id: nid("svc"),
      name: name.trim(),
      minutes: minutes.trim(),
      frequency: frequency.trim(),
    });
    activity(student, actorName(user), "added", `service ${name.trim()}`);
  });
  touch(studentId);
}

export async function removeService(studentId: string, id: string) {
  const user = await requireOwner();
  await mutateStore((s) => {
    const student = s.students.find((x) => x.id === studentId);
    if (!student || !staffCanSeeStudent(user, student)) return;
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
    const student = staffStudent(s, user, studentId);
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
    activity(
      student,
      actorName(user),
      "logged",
      `${formatLoggedValue(student, goalId, value)} on ${goalLabel(student, goalId)}`,
    );
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
  const user = kind === "progress-photo" ? await requireStaff() : await requireOwner();
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
    const student = staffStudent(s, user, studentId);
    if (student.documents.length >= 50) fail("50 files per student in this version.");
    student.documents.push(doc);
    activity(student, actorName(user), "attached", file.name);
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

export async function deleteFile(studentId: string, fileId: string) {
  const user = await requireOwner();
  let storedName = "";
  await mutateStore((s) => {
    const student = staffStudent(s, user, studentId);
    const doc = student.documents.find((d) => d.id === fileId);
    if (!doc) fail("File not found.");
    storedName = doc.storedName;
    student.documents = student.documents.filter((d) => d.id !== fileId);
    for (const dp of student.dataPoints) {
      if (dp.photoId === fileId) dp.photoId = undefined;
    }
    activity(student, actorName(user), "removed", doc.filename);
  });
  if (storedName) await deleteUpload(storedName);
  touch(studentId);
}

export async function setFilePublished(studentId: string, fileId: string, published: boolean) {
  const user = await requireOwner();
  await mutateStore((s) => {
    const student = staffStudent(s, user, studentId);
    const doc = student.documents.find((d) => d.id === fileId);
    if (!doc) fail("File not found.");
    doc.publishedToFamily = published;
  });
  touch(studentId);
}

export async function publishProgressReport(formData: FormData) {
  const user = await requireOwner();
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
    const student = staffStudent(s, user, studentId);
    for (const g of student.iepPlan.goals) {
      const text = String(formData.get(`summary_${g.id}`) || "").trim();
      if (text) report.summaries.push({ goalId: g.id, text });
    }
    if (!report.summaries.length) fail("Write 2–4 sentences for at least one goal.");
    student.progressReports.push(report);
    activity(student, actorName(user), "published", "a progress report");
  });
  touch(studentId);
}

export async function setReportPublished(studentId: string, reportId: string, published: boolean) {
  const user = await requireOwner();
  await mutateStore((s) => {
    const student = staffStudent(s, user, studentId);
    const r = student.progressReports.find((p) => p.id === reportId);
    if (!r) fail("Report not found.");
    r.publishedToFamily = published;
  });
  touch(studentId);
}

export async function updateClocks(formData: FormData) {
  const user = await requireOwner();
  const studentId = String(formData.get("studentId") || "");
  await mutateStore((s) => {
    const student = staffStudent(s, user, studentId);
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
  const user = await requireOwner();
  await mutateStore((s) => {
    const student = s.students.find((x) => x.id === studentId);
    if (!student || !staffCanSeeStudent(user, student)) return;
    const t = student.tasks.find((x) => x.id === taskId);
    if (!t) return;
    t.done = !t.done;
  });
  touch(studentId);
}

export async function addTask(studentId: string, title: string, dueOn?: string) {
  const user = await requireOwner();
  if (!title.trim()) fail("Name the task.");
  await mutateStore((s) => {
    const student = staffStudent(s, user, studentId);
    student.tasks.push({ id: nid("tsk"), title: title.trim(), dueOn, done: false, assignees: [] });
  });
  touch(studentId);
}

export async function proposeMeeting(formData: FormData): Promise<{ links: { email: string; accept: string; suggest: string; decline: string }[] }> {
  const user = await requireOwner();
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
    const student = staffStudent(s, user, studentId);
    student.meetings.push(meeting);
    const noticeDue = isoDate(new Date(slots[0].startsAt));
    const c = student.clocks.find((x) => x.kind === "meeting_notice");
    if (c) c.dueOn = noticeDue;
    else student.clocks.push({ id: nid("clk"), kind: "meeting_notice", dueOn: addDays(noticeDue, -10) });
    activity(student, actorName(user), "proposed", `a ${type} meeting`);
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
  const user = await requireOwner();
  const studentId = String(formData.get("studentId") || "");
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email.includes("@")) fail("Enter a family email.");
  const student = (await readStore()).students.find((s) => s.id === studentId && s.workspaceId === user.workspaceId);
  if (!student) fail("Student not found.");
  await mutateStore((s) => {
    const st = s.students.find((x) => x.id === studentId && x.workspaceId === user.workspaceId);
    if (st) {
      st.revokedFamilyEmails = (st.revokedFamilyEmails ?? []).filter((e) => e !== email);
    }
  });
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
    if (st) activity(st, actorName(user), "invited", "family");
  });
  touch(studentId);
  return { url };
}

function stripFamilyAccess(s: StoreData, studentId: string, email: string) {
  const normalized = email.trim().toLowerCase();
  const st = s.students.find((x) => x.id === studentId);
  if (st) {
    st.revokedFamilyEmails = [...new Set([...(st.revokedFamilyEmails ?? []), normalized])];
  }
  const now = new Date().toISOString();
  for (const tok of s.tokens) {
    if (
      tok.kind === "family_invite" &&
      tok.studentId === studentId &&
      tok.email === normalized &&
      !tok.usedAt
    ) {
      tok.usedAt = now;
    }
  }
  for (const u of s.users) {
    if (u.email !== normalized || u.role !== "family") continue;
    if (u.studentId !== studentId) continue;
    u.studentId = undefined;
    u.workspaceId = null;
    s.sessions = s.sessions.filter((ses) => ses.userId !== u.id);
  }
}

export async function revokeFamilyAccess(studentId: string, email: string) {
  const user = await requireOwner();
  const normalized = email.trim().toLowerCase();
  if (!normalized.includes("@")) fail("Enter a family email.");
  await mutateStore((s) => {
    const student = staffStudent(s, user, studentId);
    stripFamilyAccess(s, student.id, normalized);
    activity(student, actorName(user), "revoked", "family access");
  });
  touch(studentId);
  revalidatePath("/app/settings");
  revalidatePath("/family");
}

export async function redeemPublicToken(tokenId: string, formData?: FormData) {
  const token = await getToken(tokenId);
  if (!token) fail("That link expired. Ask the teacher for a new one.");
  if (token.kind === "family_invite") {
    if (token.usedAt) fail("That link expired. Ask the teacher for a new one.");
    const preview = await readStore();
    const invited = preview.students.find((st) => st.id === token.studentId);
    if (!invited) fail("Student not found.");
    if ((invited.revokedFamilyEmails ?? []).includes((token.email || "").toLowerCase())) {
      fail("This invite was revoked.");
    }
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
  if (token.kind === "member_invite") {
    const used = await consumeToken(tokenId);
    if (!used?.email || !used.workspaceId) fail("Invite is incomplete.");
    const assigned = used.studentIds?.length
      ? used.studentIds
      : used.studentId
        ? [used.studentId]
        : [];
    const user = await upsertUser(used.email, {
      role: "member",
      workspaceId: used.workspaceId,
      assignedStudentIds: assigned,
      acceptedLegalAt: new Date().toISOString(),
      name: used.email.split("@")[0],
    });
    await mutateStore((s) => {
      for (const id of assigned) {
        const st = s.students.find((x) => x.id === id);
        if (st) activity(st, actorName(user), "joined", "the team");
      }
    });
    await setSession(user.id, "staff");
    redirect("/app");
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
    if (student) activity(student, "Family", "acked", "notice");
  });
  revalidatePath("/family");
  revalidatePath("/app");
}

export async function sendNotice(formData: FormData) {
  const user = await requireOwner();
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
    const student = staffStudent(s, user, studentId);
    student.notices.push(notice);
    activity(student, actorName(user), "sent", "a written notice");
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
    students: store.students.filter((s) => staffCanSeeStudent(user, s)),
  };
  return { json: JSON.stringify(payload, null, 2) };
}

export async function deleteStudent(studentId: string) {
  const user = await requireOwner();
  const names: string[] = [];
  await mutateStore((s) => {
    const student = s.students.find((x) => x.id === studentId);
    if (!student || !staffCanSeeStudent(user, student)) return;
    for (const d of student.documents) {
      names.push(d.storedName);
    }
    s.students = s.students.filter((x) => x.id !== studentId);
    for (const u of s.users) {
      if (u.studentId === studentId) u.studentId = undefined;
      if (u.assignedStudentIds) u.assignedStudentIds = u.assignedStudentIds.filter((id) => id !== studentId);
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
    activity(student, "Family", reply === "accept" ? "accepted" : reply === "decline" ? "declined" : "suggested times for", "the meeting");
  });
  revalidatePath("/family");
}


const TEAM_EMAIL = "teammate@freeiep.app";
const DEMO_EMAIL = "demo@freeiep.app";

export async function inviteMember(formData: FormData): Promise<{ url: string }> {
  const user = await requireOwner();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email.includes("@")) fail("Enter a work email.");
  if (email === DEMO_EMAIL) fail("That address is the case manager demo. Use another email.");
  const picked = formData
    .getAll("studentId")
    .map((v) => String(v).trim())
    .filter(Boolean);
  const store = await readStore();
  const all = store.students.filter((s) => s.workspaceId === user.workspaceId);
  const assigned = picked.length ? all.filter((s) => picked.includes(s.id)).map((s) => s.id) : all.map((s) => s.id);
  await mutateStore((s) => {
    const ws = s.workspaces.find((w) => w.id === user.workspaceId);
    if (ws) {
      ws.removedMemberEmails = (ws.removedMemberEmails ?? []).filter((e) => e !== email);
    }
  });
  const member = await upsertUser(email, {
    role: "member",
    workspaceId: user.workspaceId,
    assignedStudentIds: assigned,
    acceptedLegalAt: new Date().toISOString(),
    name: String(formData.get("name") || "").trim() || email.split("@")[0],
  });
  const { url } = await createMagicToken({
    kind: "member_invite",
    email,
    workspaceId: user.workspaceId!,
    studentIds: assigned,
    studentId: assigned[0],
  });
  await mutateStore((s) => {
    for (const id of assigned) {
      const st = s.students.find((x) => x.id === id);
      if (st) activity(st, actorName(user), "invited", `${actorName(member)} to the team`);
    }
  });
  if (assigned[0]) touch(assigned[0]);
  else touch();
  revalidatePath("/app/settings");
  return { url };
}

export async function updateMemberAssignments(formData: FormData) {
  const user = await requireOwner();
  const memberId = String(formData.get("memberId") || "");
  const picked = formData
    .getAll("studentId")
    .map((v) => String(v).trim())
    .filter(Boolean);
  await mutateStore((s) => {
    const member = s.users.find((x) => x.id === memberId);
    if (!member || member.workspaceId !== user.workspaceId || member.role !== "member") {
      fail("Member not found.");
    }
    const allowed = new Set(s.students.filter((st) => st.workspaceId === user.workspaceId).map((st) => st.id));
    member.assignedStudentIds = picked.filter((id) => allowed.has(id));
  });
  revalidatePath("/app/settings");
  revalidatePath("/app");
}

export async function removeMember(memberId: string) {
  const user = await requireOwner();
  await mutateStore((s) => {
    const member = s.users.find((x) => x.id === memberId);
    if (!member || member.workspaceId !== user.workspaceId) fail("Member not found.");
    if (member.role === "owner" || member.id === user.id) fail("The case manager stays on the workspace.");
    const ws = s.workspaces.find((w) => w.id === user.workspaceId);
    if (ws) {
      ws.removedMemberEmails = [...new Set([...(ws.removedMemberEmails ?? []), member.email])];
    }
    member.workspaceId = null;
    member.assignedStudentIds = [];
    s.sessions = s.sessions.filter((ses) => ses.userId !== member.id);
    s.tokens = s.tokens.filter((tok) => !(tok.email === member.email && tok.kind === "member_invite" && !tok.usedAt));
  });
  revalidatePath("/app/settings");
  revalidatePath("/app");
}

export async function openAsTeamMember() {
  const owner = await requireStaff();
  const workspaceId = owner.workspaceId!;
  const store = await readStore();
  const ws = store.workspaces.find((w) => w.id === workspaceId);
  if ((ws?.removedMemberEmails ?? []).includes(TEAM_EMAIL)) {
    fail("The demo teammate was removed from this workspace. Invite them again to restore access.");
  }
  const existing = store.users.find(
    (u) => u.email === TEAM_EMAIL && u.workspaceId === workspaceId && u.role === "member",
  );
  const students = store.students.filter((s) => s.workspaceId === workspaceId);
  const maya = students.find((s) => s.firstName === "Maya");
  const assigned = maya ? [maya.id] : students.slice(0, 1).map((s) => s.id);
  const member =
    existing ??
    (await upsertUser(TEAM_EMAIL, {
      role: "member",
      workspaceId,
      assignedStudentIds: assigned,
      acceptedLegalAt: new Date().toISOString(),
      name: "Demo team member",
    }));
  await setSession(member.id, "staff");
  revalidatePath("/app");
  redirect("/app");
}

export async function openAsCaseManager() {
  const user = await upsertUser(DEMO_EMAIL, {
    role: "owner",
    name: "Demo teacher",
    acceptedLegalAt: new Date().toISOString(),
  });
  await setSession(user.id, "staff");
  revalidatePath("/app");
  redirect("/app");
}

void clockTone;
void lastnameFilename;
