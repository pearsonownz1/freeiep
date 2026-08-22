import { redirect } from "next/navigation";
import Link from "next/link";
import { currentUser } from "@/lib/auth";
import { readStore } from "@/lib/store";
import { workspaceFamily, workspaceMembers, workspaceStudents } from "@/lib/queries";
import { createWorkspace, saveAssistKey } from "@/lib/actions";
import { US_STATES } from "@/lib/types";
import { Field } from "@/components/ui";
import { ExportButton } from "./export-button";
import { MembersPanel } from "./members";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ setup?: string }>;
}) {
  const user = await currentUser("staff");
  if (!user) redirect("/app");
  const setup = (await searchParams).setup;
  const workspace = user.workspaceId
    ? (await readStore()).workspaces.find((w) => w.id === user.workspaceId)
    : null;
  const needsLegal = !user.acceptedLegalAt || !workspace;

  return (
    <div className="max-w-[38rem]">
      <h1 className="page-title text-[28px] leading-[1.2]">
        {needsLegal ? "Create workspace" : "Settings"}
      </h1>
      {setup || needsLegal ? (
        <p className="mt-2 text-ink-soft">
          School, state, and a yes on the legal pages. Then you can add students.
        </p>
      ) : null}

      <form action={createWorkspace} className="mt-6 space-y-4">
        <Field label="Your name">
          <input name="name" defaultValue={user.name || ""} />
        </Field>
        <Field label="School">
          <input name="school" required defaultValue={workspace?.name || ""} />
        </Field>
        <Field label="State">
          <select name="state" defaultValue={workspace?.state || "TX"} required>
            {US_STATES.map((st) => (
              <option key={st}>{st}</option>
            ))}
          </select>
        </Field>
        <label className="flex items-start gap-2 text-[14px]">
          <input type="checkbox" name="accept" required defaultChecked={!!user.acceptedLegalAt} className="mt-1" />
          <span>
            I accept the{" "}
            <Link href="/privacy" className="link">
              Privacy
            </Link>{" "}
            and{" "}
            <Link href="/terms" className="link">
              Terms
            </Link>
            . I am an educator or provider, not a student.
          </span>
        </label>
        <button className="btn btn-primary" type="submit">
          {workspace ? "Save workspace" : "Create workspace"}
        </button>
      </form>

      <h2 className="mt-12 font-sans text-[16px] font-semibold">Assist (optional)</h2>
      <p className="mt-1 text-[15px] text-ink-soft">
        Hidden everywhere unless you add your own API key. FreeIEP will not invent minutes or placement. Default path uses no model.
      </p>
      <form action={saveAssistKey} className="mt-4 space-y-3">
        <Field label="Bring-your-own API key">
          <input name="assistKey" type="password" placeholder={user.assistKey ? "Key on file. Paste another to replace." : "Leave empty to keep Assist hidden"} autoComplete="off" />
        </Field>
        <button className="btn btn-secondary" type="submit">
          Save key
        </button>
      </form>

      {user.workspaceId ? (
        <MembersPanel
          members={await workspaceMembers()}
          family={await workspaceFamily()}
          students={await workspaceStudents()}
          role={user.role}
        />
      ) : null}

      <h2 className="mt-12 font-sans text-[16px] font-semibold">Your data</h2>
      <p className="mt-1 text-[15px] text-ink-soft">Export the workspace JSON. Delete students from each student page.</p>
      <ExportButton />
    </div>
  );
}
