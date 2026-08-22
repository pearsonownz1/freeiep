import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { familyHubRows } from "@/lib/queries";
import { seedDemoFamilyInvite } from "@/lib/sample";
import { mutateStore } from "@/lib/store";
import { FamilyHub } from "./family-hub";

export default async function StaffFamilyPage() {
  const user = await currentUser("staff");
  if (!user) redirect("/app");
  if (!user.workspaceId || !user.acceptedLegalAt) redirect("/app/settings?setup=1");
  if (user.email === "demo@freeiep.app") {
    await mutateStore((s) => {
      seedDemoFamilyInvite(s, user.workspaceId!);
    });
  }
  const rows = await familyHubRows();
  const pending = rows.filter((r) => r.inviteStatus === "pending").length;
  const active = rows.filter((r) => r.inviteStatus === "active").length;
  const waiting =
    rows.reduce((n, r) => n + r.unsignedNotices + r.unconfirmedMeetings, 0);
  return (
    <FamilyHub
      rows={rows}
      canRevoke={user.role === "owner"}
      kpis={{ pending, active, waiting }}
    />
  );
}
