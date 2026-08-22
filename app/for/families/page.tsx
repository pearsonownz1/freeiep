import type { Metadata } from "next";
import { DocPage, Section, BulletList, CtaBand } from "@/components/marketing/shell";

export const metadata: Metadata = {
  title: 'Families · FreeIEP',
  description: 'See goals in plain language. Sign or acknowledge what’s waiting. Pick a meeting time from your email.',
};

export default function Page() {
  return (
    <DocPage title='One place the school actually invited you to' lede='See goals in plain language. Sign or acknowledge what’s waiting. Pick a meeting time from your email.'>
      <Section title='You will not see'>
        <BulletList items={['Other children.', 'Staff-only notes.', 'Anything unpublished.']} />
      </Section>
      <Section title='This is not'>
        <BulletList items={['A tool for writing demand letters. If you need advocacy, that’s a different product.']} />
      </Section>
      <CtaBand />
    </DocPage>
  );
}
