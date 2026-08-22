import type { Metadata } from "next";
import { DocPage, Section, BulletList, CtaBand } from "@/components/marketing/shell";

export const metadata: Metadata = {
  title: 'Caseload · FreeIEP',
  description: 'One board for the whole caseload. Every student, the next date that matters, overdue in red.',
};

export default function Page() {
  return (
    <DocPage title='One board for the whole caseload' lede='Every student, the next date that matters, overdue in red. Empty state is “Add your first student,” not a blank database.'>
      <Section title='What you see'>
        <BulletList items={['Name, grade, next clock, overdue pill.', 'Open a student and you are in the case: plan, progress, meetings, files, family.', 'CSV import: name, grade, annual date, reevaluation date. You map columns. We do not talk to your SIS.', 'Sample caseload button for a first look.']} />
      </Section>
      <Section title='Not this'>
        <BulletList items={['Live PowerSchool sync.', 'Medicaid minutes claiming.', 'A director command center (that is later).']} />
      </Section>
      <CtaBand />
    </DocPage>
  );
}
