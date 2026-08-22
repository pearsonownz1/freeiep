import type { Metadata } from "next";
import Link from "next/link";
import { DocPage, Section } from "@/components/marketing/shell";

export const metadata: Metadata = {
  title: "Privacy · FreeIEP",
  description: "What we collect, why, FERPA school-official framing, no sale, no ads, no model training on student data.",
};

export default function PrivacyPage() {
  return (
    <DocPage title="Privacy" lede="Student records are not a growth strategy.">
      <Section title="What we collect">
        <p>
          Name, email, school, the student records you enter, and files you upload. We collect this
          to run the workspace — clocks, goals, progress, meetings, and the family view.
        </p>
      </Section>
      <Section title="FERPA">
        <p>
          Educators use FreeIEP in a school-official capacity for students they serve. Families are
          invited by the educator and see one child. Deny wins. Students do not create accounts.
        </p>
      </Section>
      <Section title="What we do not do">
        <p>No sale of records. No ads. No training a model on your caseload. US hosting.</p>
      </Section>
      <Section title="Family scope">
        <p>Invited family sees only what you publish for that one student. Staff notes stay staff.</p>
      </Section>
      <Section title="Export and delete">
        <p>
          Export JSON and files from Settings. Delete a student and their files go within 30 days
          (this demo deletes immediately).
        </p>
      </Section>
      <Section title="Assist">
        <p>
          Optional Assist is your key. Prompts are not stored. We will not send photos to a model in
          this version. We do not run a shared model on student data.
        </p>
      </Section>
      <Section title="Children">
        <p>
          COPPA: FreeIEP is not for children as users. Students never get accounts. The records
          belong to the educator’s workspace.
        </p>
      </Section>
      <Section title="Breach">
        <p>If we learn of a breach that involves your workspace, we email workspace owners within 72 hours.</p>
      </Section>
      <Section title="Contact">
        <p>
          privacy@freeiep.org — a placeholder inbox for this product. Also see{" "}
          <Link href="/terms" className="underline" style={{ textUnderlineOffset: 2 }}>
            Terms
          </Link>
          .
        </p>
      </Section>
      <p className="mt-10 text-[14px] text-ink-soft">Not the official IEP. Not legal advice.</p>
    </DocPage>
  );
}
