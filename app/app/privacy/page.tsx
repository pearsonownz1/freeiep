import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";

export default async function StaffPrivacyPage() {
  const user = await currentUser("staff");
  if (!user) redirect("/app");

  return (
    <div className="max-w-[38rem]">
      <h1 className="page-title text-[28px] leading-[1.2]">Privacy in this workspace</h1>
      <p className="mt-2 text-ink-soft">
        Short staff copy. Not legal advice. Full policy at{" "}
        <Link href="/privacy" className="link">
          /privacy
        </Link>
        .
      </p>

      <div className="card mt-6 space-y-4 p-5 text-[15px] leading-[1.55]">
        <div>
          <h2 className="font-sans text-[16px] font-semibold">FERPA</h2>
          <p className="mt-1 text-ink-soft">
            You use FreeIEP as a school official for students you serve. We host the records you enter
            so you can run clocks, goals, progress, meetings, and the family view. Students do not
            create accounts.
          </p>
        </div>
        <div>
          <h2 className="font-sans text-[16px] font-semibold">Deny wins</h2>
          <p className="mt-1 text-ink-soft">
            Family sees one child, and only what you publish. Staff notes stay staff. If access is
            unclear, they do not see it. Revoke an invite and that email is done.
          </p>
        </div>
        <div>
          <h2 className="font-sans text-[16px] font-semibold">What we do not do</h2>
          <p className="mt-1 text-ink-soft">
            No sale. No ads. No training a model on the caseload. US hosting. Optional Assist is your
            key and stays hidden unless you add one.
          </p>
        </div>
        <div>
          <h2 className="font-sans text-[16px] font-semibold">Export and delete</h2>
          <p className="mt-1 text-ink-soft">
            JSON and PDFs live on{" "}
            <Link href="/app/export" className="link">
              Export
            </Link>
            . Delete a student from their page. Files go with them.
          </p>
        </div>
      </div>

      <p className="mt-6 text-[13px] text-ink-soft">
        Terms:{" "}
        <Link href="/terms" className="link">
          /terms
        </Link>
        . Questions: privacy@freeiep.org.
      </p>
    </div>
  );
}
