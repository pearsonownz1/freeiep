import type { Metadata } from "next";
import { DocPage, Section, BulletList, CtaBand } from "@/components/marketing/shell";

export const metadata: Metadata = {
  title: 'Administrators · FreeIEP',
  description: 'A case manager can begin today. No procurement. A school-wide rollup is not in this version.',
};

export default function Page() {
  return (
    <DocPage title='Start with one teacher' lede='A case manager can begin today. No procurement. No DPA wait to try it (still read Privacy). A school-wide rollup is not in this version.'>
      <Section title='Honest'>
        <BulletList items={['If you need state reporting and official forms, keep your district system. FreeIEP sits beside it.']} />
      </Section>
      <CtaBand />
    </DocPage>
  );
}
