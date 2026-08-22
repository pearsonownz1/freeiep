import "server-only";
import { addDays, isoDate, nid } from "./ids";
import { mutateStore } from "./store";
import type { Activity, DataPoint, DocumentFile, Goal, StoreData, Student } from "./types";

const DEMO_EMAIL = "demo@freeiep.app";
export const DEMO_FAMILY_EMAIL = "parent@freeiep.app";

function emptyPlan() {
  return {
    presentLevels: { strengths: "", needs: "", baselines: "" },
    goals: [],
    accommodations: [],
    services: [],
  };
}

export function isAutoDemoWorkspace(
  workspace: { name: string; state: string } | undefined,
  ownerEmail: string | undefined,
): boolean {
  return ownerEmail === DEMO_EMAIL && workspace?.name === "Demo" && workspace?.state === "OR";
}

function mayaGoals(today: string): Goal[] {
  return [
    {
      id: nid("gol"),
      title: "Oral reading",
      metric: "wcpm",
      baseline: "58",
      target: "90",
      unit: "wcpm",
      timelineDate: addDays(today, 120),
      objectives: [],
    },
    {
      id: nid("gol"),
      title: "Multisyllable accuracy",
      metric: "percent_accuracy",
      baseline: "60",
      target: "85",
      unit: "%",
      timelineDate: addDays(today, 120),
      objectives: [],
    },
  ];
}

function mayaActivityLines(): Omit<Activity, "id" | "at">[] {
  return [
    { who: "Demo teacher", verb: "logged", object: "72 wcpm on Goal 1" },
    { who: "Demo teacher", verb: "logged", object: "80% on Goal 2" },
  ];
}

function hasGoalActivity(student: Student, n: number): boolean {
  const needle = `Goal ${n}`;
  return student.activity.some((a) => a.object.includes(needle));
}

function mayaSeedPoints(goals: Goal[], today: string): DataPoint[] {
  const g1 = goals[0];
  const g2 = goals[1];
  const points: DataPoint[] = [];
  if (g1) {
    points.push({
      id: nid("dp"),
      goalId: g1.id,
      date: addDays(today, -3),
      value: 72,
      note: "Cold read, grade 4 passage.",
      authorId: "demo",
    });
  }
  if (g2) {
    points.push({
      id: nid("dp"),
      goalId: g2.id,
      date: addDays(today, -1),
      value: 80,
      note: "Multisyllable list, 10 words.",
      authorId: "demo",
    });
  }
  return points;
}

function ensureMayaDataPoints(maya: Student, today: string): boolean {
  if (!maya.dataPoints) maya.dataPoints = [];
  const goals = maya.iepPlan.goals;
  if (!goals.length) return false;
  let changed = false;
  const seeds = [
    { index: 0, value: 72, note: "Cold read, grade 4 passage.", days: -3 },
    { index: 1, value: 80, note: "Multisyllable list, 10 words.", days: -1 },
  ];
  for (const seed of seeds) {
    const goal = goals[seed.index];
    if (!goal) continue;
    if (maya.dataPoints.some((p) => p.goalId === goal.id && p.value === seed.value)) continue;
    maya.dataPoints.push({
      id: nid("dp"),
      goalId: goal.id,
      date: addDays(today, seed.days),
      value: seed.value,
      note: seed.note,
      authorId: "demo",
    });
    changed = true;
  }
  return changed;
}

export function mayaHasUsableFamilyInvite(s: StoreData, mayaId: string): boolean {
  const now = Date.now();
  return s.tokens.some(
    (t) =>
      t.kind === "family_invite" &&
      t.studentId === mayaId &&
      !t.usedAt &&
      new Date(t.expiresAt).getTime() > now,
  );
}

function mayaHasActiveFamily(s: StoreData, mayaId: string): boolean {
  return s.users.some((u) => u.role === "family" && u.studentId === mayaId);
}

export function mayaNeedsDemoFamilyInvite(s: StoreData, workspaceId: string): boolean {
  const maya = s.students.find(
    (st) => st.workspaceId === workspaceId && st.firstName === "Maya" && st.lastName === "Rivera",
  );
  if (!maya) return true;
  if (mayaHasUsableFamilyInvite(s, maya.id)) return false;
  if (mayaHasActiveFamily(s, maya.id)) return false;
  return true;
}

export function seedDemoFamilyInvite(s: StoreData, workspaceId: string): boolean {
  const maya = s.students.find(
    (st) => st.workspaceId === workspaceId && st.firstName === "Maya" && st.lastName === "Rivera",
  );
  if (!maya) return false;
  return ensureMayaFamilyInvite(s, maya);
}

function ensureMayaFamilyInvite(s: StoreData, maya: Student): boolean {
  if (mayaHasUsableFamilyInvite(s, maya.id)) return false;
  if (mayaHasActiveFamily(s, maya.id)) return false;
  s.tokens.push({
    id: nid("tok"),
    kind: "family_invite",
    email: DEMO_FAMILY_EMAIL,
    studentId: maya.id,
    workspaceId: maya.workspaceId,
    expiresAt: new Date(Date.now() + 14 * 86400000).toISOString(),
  });
  maya.activity.unshift({
    id: nid("act"),
    who: "Demo teacher",
    verb: "invited",
    object: "family",
    at: new Date().toISOString(),
  });
  return true;
}

export function ensureAutoDemoMaya(s: StoreData, workspaceId: string): boolean {
  const today = isoDate();
  let maya = s.students.find(
    (st) => st.workspaceId === workspaceId && st.firstName === "Maya" && st.lastName === "Rivera",
  );
  let changed = false;
  if (!maya) {
    maya = sampleStudents(workspaceId, DEMO_EMAIL)[0];
    s.students.push(maya);
    changed = true;
  }
  if (!maya.iepPlan.goals.length) {
    maya.iepPlan.goals = mayaGoals(today);
    const pl = maya.iepPlan.presentLevels;
    if (!pl.strengths && !pl.needs && !pl.baselines) {
      maya.iepPlan.presentLevels = {
        strengths: "Reads dialogue with expression. Asks for help when stuck.",
        needs: "Oral reading accuracy drops on multisyllabic words.",
        baselines: "58 words correct per minute on a grade 4 passage.",
      };
    }
    changed = true;
  }
  const now = Date.now();
  mayaActivityLines().forEach((line, i) => {
    const n = i + 1;
    if (hasGoalActivity(maya!, n)) return;
    maya!.activity.unshift({
      id: nid("act"),
      who: line.who,
      verb: line.verb,
      object: line.object,
      at: new Date(now - (mayaActivityLines().length - 1 - i) * 3600_000).toISOString(),
    });
    changed = true;
  });
  if (ensureMayaDataPoints(maya, today)) changed = true;
  if (ensureMayaNotices(maya, today)) changed = true;
  if (seedDemoDocuments(s, workspaceId)) changed = true;
  if (ensureMayaFamilyInvite(s, maya)) changed = true;
  return changed;
}

function demoNotices(today: string): Student["notices"] {
  return [
    {
      id: nid("pwn"),
      date: addDays(today, -14),
      proposeOrRefuse: "propose",
      description: "Add extra reading minutes before the annual review.",
      reasons: "Oral reading is below the target on cold passages.",
      options: "Keep current minutes; add small-group reading.",
      sentAt: new Date(Date.now() - 14 * 86400000).toISOString(),
      ackedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    },
    {
      id: nid("pwn"),
      date: addDays(today, -3),
      proposeOrRefuse: "propose",
      description: "Hold the annual IEP meeting in the next 10 school days.",
      reasons: "The annual date is overdue.",
      options: "In-person after school; video conference.",
      sentAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
  ];
}

function demoDoc(filename: string, kind: string, published: boolean, daysAgo: number): DocumentFile {
  const ext = (filename.split(".").pop() || "pdf").toLowerCase();
  const mime = ext === "pdf" ? "application/pdf" : ext === "png" ? "image/png" : "image/jpeg";
  return {
    id: nid("fil"),
    filename,
    storedName: `demo-${nid("fil")}.${ext === "jpeg" ? "jpg" : ext}`,
    mime,
    kind,
    publishedToFamily: published,
    size: 48000,
    createdAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
  };
}

export function seedDemoDocuments(s: StoreData, workspaceId: string): boolean {
  let changed = false;
  const maya = s.students.find(
    (st) => st.workspaceId === workspaceId && st.firstName === "Maya" && st.lastName === "Rivera",
  );
  const jordan = s.students.find(
    (st) => st.workspaceId === workspaceId && st.firstName === "Jordan" && st.lastName === "Chen",
  );
  const sam = s.students.find(
    (st) => st.workspaceId === workspaceId && st.firstName === "Sam" && st.lastName === "Okonkwo",
  );
  if (maya && !(maya.documents ?? []).length) {
    maya.documents = [
      demoDoc("Rivera_eval_2026-07-12.pdf", "eval", false, 40),
      demoDoc("Rivera_progress_photo.jpg", "progress-photo", true, 6),
    ];
    changed = true;
  }
  if (jordan && !(jordan.documents ?? []).length) {
    jordan.documents = [demoDoc("Chen_IEP_draft.pdf", "iep", false, 12)];
    changed = true;
  }
  if (sam && !(sam.documents ?? []).length) {
    sam.documents = [demoDoc("Okonkwo_notice.pdf", "notice", true, 4)];
    changed = true;
  }
  return changed;
}

function ensureMayaNotices(maya: Student, today: string): boolean {
  if (maya.notices?.length) return false;
  maya.notices = demoNotices(today);
  return true;
}

export function sampleStudents(workspaceId: string, actorEmail: string): Student[] {
  const today = isoDate();
  const goals = mayaGoals(today);
  return [
    {
      id: nid("stu"),
      workspaceId,
      firstName: "Maya",
      lastName: "Rivera",
      grade: "4",
      state: "TX",
      documents: [
        demoDoc("Rivera_eval_2026-07-12.pdf", "eval", false, 40),
        demoDoc("Rivera_progress_photo.jpg", "progress-photo", true, 6),
      ],
      iepPlan: {
        ...emptyPlan(),
        presentLevels: {
          strengths: "Reads dialogue with expression. Asks for help when stuck.",
          needs: "Oral reading accuracy drops on multisyllabic words.",
          baselines: "58 words correct per minute on a grade 4 passage.",
        },
        goals,
      },
      dataPoints: mayaSeedPoints(goals, today),
      clocks: [
        { id: nid("clk"), kind: "annual_review", dueOn: addDays(today, -11) },
        { id: nid("clk"), kind: "reevaluation", dueOn: addDays(today, 180) },
        { id: nid("clk"), kind: "progress_report", dueOn: addDays(today, 20) },
      ],
      tasks: [
        { id: nid("tsk"), title: "Send notice", dueOn: today, done: false, assignees: [] },
        { id: nid("tsk"), title: "Log data", dueOn: today, done: false, assignees: [] },
      ],
      meetings: [],
      notices: demoNotices(today),
      activity: [
        {
          id: nid("act"),
          who: "Demo teacher",
          verb: "logged",
          object: "80% on Goal 2",
          at: new Date().toISOString(),
        },
        {
          id: nid("act"),
          who: "Demo teacher",
          verb: "logged",
          object: "72 wcpm on Goal 1",
          at: new Date(Date.now() - 1800_000).toISOString(),
        },
        {
          id: nid("act"),
          who: "Family",
          verb: "acked",
          object: "notice",
          at: new Date(Date.now() - 3600_000).toISOString(),
        },
      ],
      progressReports: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: nid("stu"),
      workspaceId,
      firstName: "Jordan",
      lastName: "Chen",
      grade: "7",
      state: "TX",
      documents: [demoDoc("Chen_IEP_draft.pdf", "iep", false, 12)],
      iepPlan: emptyPlan(),
      dataPoints: [],
      clocks: [
        { id: nid("clk"), kind: "annual_review", dueOn: addDays(today, 9) },
        { id: nid("clk"), kind: "reevaluation", dueOn: addDays(today, 8) },
        { id: nid("clk"), kind: "progress_report", dueOn: addDays(today, 30) },
      ],
      tasks: [
        { id: nid("tsk"), title: "Attach eval", dueOn: addDays(today, 5), done: false, assignees: [] },
      ],
      meetings: [],
      notices: [
        {
          id: nid("pwn"),
          date: addDays(today, -6),
          proposeOrRefuse: "refuse",
          description: "A request to drop speech minutes this quarter.",
          reasons: "Present levels still show a service need.",
          options: "Keep minutes; review again at annual.",
          sentAt: new Date(Date.now() - 6 * 86400000).toISOString(),
        },
      ],
      activity: [
        {
          id: nid("act"),
          who: actorEmail,
          verb: "added",
          object: "sample student Jordan Chen",
          at: new Date().toISOString(),
        },
      ],
      progressReports: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: nid("stu"),
      workspaceId,
      firstName: "Sam",
      lastName: "Okonkwo",
      grade: "2",
      state: "TX",
      documents: [demoDoc("Okonkwo_notice.pdf", "notice", true, 4)],
      iepPlan: emptyPlan(),
      dataPoints: [],
      clocks: [
        { id: nid("clk"), kind: "annual_review", dueOn: addDays(today, 60) },
        { id: nid("clk"), kind: "reevaluation", dueOn: addDays(today, 240) },
        { id: nid("clk"), kind: "progress_report", dueOn: addDays(today, 25) },
      ],
      tasks: [],
      meetings: [],
      notices: [],
      activity: [
        {
          id: nid("act"),
          who: actorEmail,
          verb: "added",
          object: "sample student Sam Okonkwo",
          at: new Date().toISOString(),
        },
      ],
      progressReports: [],
      createdAt: new Date().toISOString(),
    },
  ];
}

export async function seedSampleCaseload(workspaceId: string, actorEmail: string): Promise<Student[]> {
  const students = sampleStudents(workspaceId, actorEmail);
  await mutateStore((s) => {
    s.students.push(...students);
  });
  return students;
}
