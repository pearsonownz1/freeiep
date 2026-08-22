import type { Metadata } from "next";
import { DocPage, Section, CtaBand } from "@/components/marketing/shell";

export const metadata: Metadata = {
  title: "Writing measurable goals · FreeIEP",
  description: "A goal is a number you can see change. Metric, baseline, target, and timeline are required.",
};

export default function Page() {
  return (
    <DocPage title="A goal is a number you can see change" lede="If you cannot graph it, it is a hope, not a goal.">
      <Section title="Pattern"><p>By [date], given [condition], [student] will [skill] at [metric], from [baseline] to [target], as measured by [source].</p></Section>
      <Section title="Good"><p>By May 15, given a fourth-grade passage, Jordan will read 92 words correct per minute, up from 61, on three of four weekly probes.</p></Section>
      <Section title="Weak"><p>Jordan will improve reading. Jordan will try their best. Jordan will be successful in class.</p></Section>
      <Section title="In FreeIEP"><p>Metric, baseline, target, and timeline are required. We do not save a goal that is only a sentence.</p></Section>
      <Section title="We do not"><p>Invent service minutes or placement from a goal.</p></Section>
      <CtaBand />
    </DocPage>
  );
}
