import type { Metadata } from "next";
import { DocPage, Section, BulletList, CtaBand } from "@/components/marketing/shell";

export const metadata: Metadata = {
  title: 'Family portal · FreeIEP',
  description: 'Invited by you. One child. Only what you publish.',
};

export default function Page() {
  return (
    <DocPage title='Family sees the same student, not a different story' lede='Invited by you. One child. Only what you publish.'>
      <Section title='What family sees'>
        <BulletList items={['Home: “Waiting on you” (unsigned notice, unconfirmed meeting), then progress in plain language (“12 of 20 words correct”).', 'Document library is published files only. Staff notes stay staff.', 'Clay chrome so it does not look like the staff app.', 'Meeting reply works from email even if they never sign in.']} />
      </Section>
      <Section title='Not this'>
        <BulletList items={['A parent advocacy letter factory.', 'We do not draft due-process mail.']} />
      </Section>
      <CtaBand />
    </DocPage>
  );
}
