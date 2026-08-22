import type { Metadata } from "next";
import { DocPage, Section, BulletList, CtaBand } from "@/components/marketing/shell";

export const metadata: Metadata = {
  title: 'Progress · FreeIEP',
  description: 'Log a value in the goal’s unit. Optional photo. Chart baseline, points, target.',
};

export default function Page() {
  return (
    <DocPage title='Progress is a date and a number' lede='Log a value in the goal’s unit. Optional photo (stored, not auto-scored). Chart baseline, points, target.'>
      <Section title='How it works'>
        <BulletList items={['“Log progress” from the student page. Phone-friendly.', 'Click a point to see the note and photo.', 'Publish a progress report: you write 2–4 sentences per goal. PDF. Toggle “Family can see this” (off by default).']} />
      </Section>
      <Section title='Not this'>
        <BulletList items={['AI summaries unless you add your own API key in Settings.', 'No OCR scoring yet.']} />
      </Section>
      <CtaBand />
    </DocPage>
  );
}
