import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { workspaceStudents } from "@/lib/queries";
import { clockTone } from "@/lib/clocks";
import { studentName } from "@/lib/format";
import { isoDate } from "@/lib/ids";
import { ProgressHub } from "./progress-hub";

export default async function ProgressPage() {
  const user = await currentUser("staff");
  if (!user) redirect("/app");
  if (!user.workspaceId || !user.acceptedLegalAt) redirect("/app/settings?setup=1");
  const students = await workspaceStudents();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const cut = isoDate(cutoff);

  const withGoals = students.filter((s) => s.iepPlan.goals.length > 0).length;
  const notes30 = students.reduce(
    (n, s) => n + s.dataPoints.filter((p) => p.date >= cut).length,
    0,
  );
  const overdue = students.reduce(
    (n, s) => n + s.clocks.filter((c) => clockTone(c) === "overdue").length,
    0,
  );

  return (
    <ProgressHub
      canLog
      kpis={{ withGoals, notes30, overdue }}
      students={students.map((s) => ({
        id: s.id,
        name: studentName(s),
        grade: s.grade,
        goals: s.iepPlan.goals.map((g) => ({
          id: g.id,
          title: g.title,
          metric: g.metric,
          target: g.target,
          unit: g.unit,
        })),
        notes: s.dataPoints.map((p) => ({
          id: p.id,
          goalId: p.goalId,
          date: p.date,
          value: p.value,
          note: p.note,
          photoId: p.photoId,
        })),
        reports: s.progressReports.map((r) => ({
          id: r.id,
          createdAt: r.createdAt,
          published: r.publishedToFamily,
        })),
      }))}
    />
  );
}
