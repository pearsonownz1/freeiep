import "server-only";
import { addDays, isoDate, nid } from "./ids";
import { mutateStore } from "./store";
import type { Activity, Goal, StoreData, Student } from "./types";

const DEMO_EMAIL = "demo@freeiep.app";

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

/** Upsert Maya on the shared auto-demo workspace. Never deletes extra students. Returns true if the store changed. */
export function ensureAutoDemoMaya(s: StoreData, workspaceId: string): boolean {
  const today = isoDate();
  let maya = s.students.find(
    (st) => st.workspaceId === workspaceId && st.firstName === "Maya" && st.lastName === "Rivera",
  );
  let changed = false;
  if (!maya) {
    maya = sampleStudents(workspaceId, DEMO_EMAIL)[0];
    s.students.push(maya);
    return true;
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
  return changed;
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
      documents: [],
      iepPlan: {
        ...emptyPlan(),
        presentLevels: {
          strengths: "Reads dialogue with expression. Asks for help when stuck.",
          needs: "Oral reading accuracy drops on multisyllabic words.",
          baselines: "58 words correct per minute on a grade 4 passage.",
        },
        goals,
      },
      dataPoints: [],
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
      notices: [],
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
      documents: [],
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
      notices: [],
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
      documents: [],
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
