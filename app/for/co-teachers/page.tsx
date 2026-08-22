import type { Metadata } from "next";
import { DocPage, Section, BulletList, CtaBand } from "@/components/marketing/shell";

export const metadata: Metadata = {
  title: 'Co-teachers · FreeIEP',
  description: 'See accommodations and goals for students on your roster. Log a data point from class.',
};

export default function Page() {
  return (
    <DocPage title='What to try today, not a 40-page PDF' lede='See accommodations and goals for students on your roster. Log a data point from class. You cannot delete the case.'>
      <Section title='On this page'>
        <BulletList items={['See accommodations and goals for students on your roster.', 'Log a data point from class.', 'You cannot delete the case.', 'Extra team roles ship after the family portal. Invite is coming next.']} />
      </Section>
      <CtaBand />
    </DocPage>
  );
}
