import type { Metadata } from "next";
import { DocPage, Section, BulletList, CtaBand } from "@/components/marketing/shell";

export const metadata: Metadata = {
  title: 'Meetings · FreeIEP',
  description: 'Propose one to three times. Staff and family answer. First yes that works is the time.',
};

export default function Page() {
  return (
    <DocPage title='One invite, not an email chain' lede='Propose one to three times. Staff and family answer. First yes that works is the time.'>
      <Section title='Meetings'>
        <BulletList items={['Meeting types: annual, amendment, reevaluation.', 'Family can Accept / Suggest / Decline from a link. No account required.', '.ics download. Google/Outlook connect is later.', 'A brief box: what gen-ed should know. You write it.']} />
      </Section>
      <Section title='Not this'>
        <BulletList items={['Scanning your whole calendar.', 'We do not read existing events in this version.']} />
      </Section>
      <CtaBand />
    </DocPage>
  );
}
