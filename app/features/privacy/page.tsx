import type { Metadata } from "next";
import Link from "next/link";
import { DocPage, Section, BulletList, CtaBand } from "@/components/marketing/shell";

export const metadata: Metadata = {
  title: 'Privacy · FreeIEP',
  description: 'FERPA-minded. US hosting. No ads. No sale of records. No training a model on your caseload.',
};

export default function Page() {
  return (
    <DocPage title='Student records are not a growth strategy' lede='FERPA-minded. US hosting. No ads. No sale of records. No training a model on your caseload.'>
      <Section title='How we treat records'>
        <BulletList items={['Magic link or Google. Students never create accounts.', 'Family sees one student, deny-wins.', 'Export JSON + files. Delete a student, files go within 30 days.', 'Assist (optional) is your key. Prompts are not stored. We will not send photos to a model in this version.']} />
      </Section>
      <p className="mt-6 text-[15px]">Full policy: <Link href="/privacy" className="underline" style={{ textUnderlineOffset: 2 }}>Privacy</Link>. Terms: <Link href="/terms" className="underline" style={{ textUnderlineOffset: 2 }}>Terms</Link>.</p>
      <CtaBand />
    </DocPage>
  );
}
