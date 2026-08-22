import type { Metadata } from "next";
import { DocPage, Section, BulletList, CtaBand } from "@/components/marketing/shell";

export const metadata: Metadata = {
  title: 'Case managers · FreeIEP',
  description: 'You add the student. You write the goals. You send the invite. The week lives here.',
};

export default function Page() {
  return (
    <DocPage title='Built for the person who owns the case' lede='You add the student. You write the goals. You send the invite. The week lives here. The official form still lives at the district.'>
      <Section title='Jobs'>
        <BulletList items={['Clocks.', 'Measurable goals.', 'Dated points.', 'Meeting slots.', 'PWN-lite.', 'Family publish.']} />
      </Section>
      <CtaBand />
    </DocPage>
  );
}
