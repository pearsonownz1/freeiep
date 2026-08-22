import type { Metadata } from "next";
import { DocPage, Section, BulletList, CtaBand } from "@/components/marketing/shell";

export const metadata: Metadata = {
  title: 'Plan & goals · FreeIEP',
  description: 'Present levels, goals with metrics, accommodations, and services you type yourself.',
};

export default function Page() {
  return (
    <DocPage title='A plan you can export, not a fake district form' lede='Present levels, goals with metrics, accommodations, and services you type yourself.'>
      <Section title='On the plan'>
        <BulletList items={['Present levels: strengths, needs, baselines. Autosave.', 'Goal: title, metric, baseline, target, timeline. No metric, no save.', 'Services and minutes are human-typed. FreeIEP will not invent them.', 'Export a Plan PDF. Header says “Not the official IEP.”']} />
      </Section>
      <Section title='Not this'>
        <BulletList items={['Overlay of Frontline/SEIS/EasyIEP PDFs.', 'No 50-state goal bank in this version.']} />
      </Section>
      <CtaBand />
    </DocPage>
  );
}
