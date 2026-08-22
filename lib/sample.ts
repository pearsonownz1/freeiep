import "server-only";
import { addDays, isoDate, nid } from "./ids";
import { mutateStore } from "./store";
import type { Student } from "./types";

function emptyPlan() {
  return {
    presentLevels: { strengths: "", needs: "", baselines: "" },
    goals: [],
    accommodations: [],
    services: [],
  };
}

export function seedSampleCaseload(workspaceId: string, actorEmail: string): Student[] {
  const today = isoDate();
  const students: Student[] = [
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
          who: actorEmail,
          verb: "added",
          object: "sample student Maya Rivera",
          at: new Date().toISOString(),
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

  mutateStore((s) => {
    s.students.push(...students);
  });
  return students;
}
