import type { Metadata } from "next";
import { DocPage, Section, BulletList, CtaBand } from "@/components/marketing/shell";

export const metadata: Metadata = {
  title: 'Service providers · FreeIEP',
  description: 'Log a session against a goal the case manager already wrote.',
};

export default function Page() {
  return (
    <DocPage title='Minutes and notes on the same student' lede='Log a session against a goal the case manager already wrote. The family can see progress if the teacher publishes it.'>
      <Section title='What you do'>
        <BulletList items={['Log a session against a goal already on the student.', 'Keep notes with the dated point.']} />
      </Section>
      <Section title='Not this'>
        <BulletList items={['Medicaid claiming.']} />
      </Section>
      <CtaBand />
    </DocPage>
  );
}
