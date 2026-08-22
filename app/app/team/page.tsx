import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { workspaceFamily, workspaceMembers, workspaceStudents } from "@/lib/queries";
import { MembersPanel } from "../settings/members";

export default async function TeamPage() {
  const user = await currentUser("staff");
  if (!user) redirect("/app");
  if (!user.workspaceId || !user.acceptedLegalAt) redirect("/app/settings?setup=1");

  return (
    <div>
      <h1 className="page-title text-[28px] leading-[1.2]">Team</h1>
      <p className="mt-1 text-ink-soft">Staff on this workspace. Invite, assign, or remove. Same actions as Settings.</p>
      <MembersPanel
        heading="Staff"
        showFamily={false}
        members={await workspaceMembers()}
        family={await workspaceFamily()}
        students={await workspaceStudents()}
        role={user.role}
      />
    </div>
  );
}
