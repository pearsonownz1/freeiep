import type { Metadata } from "next";
import { DocPage, Section, CtaBand } from "@/components/marketing/shell";

export const metadata: Metadata = {
  title: "Special education teacher shortage · FreeIEP",
  description: "Shortage designations are published annually. FreeIEP does not fix hiring. It keeps clocks off a spreadsheet.",
};

export default function Page() {
  return (
    <DocPage title="Why a free workspace is even a conversation">
      <Section title="Shortage is a known area">
        <p>Special education has been a shortage area in the US for years. Districts report unfilled SPED posts more often than many other teaching fields.</p>
        <p>Shortage designations are published annually by the Department of Education. Check the current shortage-area list for your state: <a href="https://tsa.ed.gov" className="underline" style={{ textUnderlineOffset: 2 }}>tsa.ed.gov</a>. Cite NCES / US Dept of Ed teacher shortage area lists and CEC commentary. We do not invent a percentage here.</p>
      </Section>
      <Section title="What FreeIEP does and does not do">
        <p>Paperwork is the usual complaint next to caseload size. FreeIEP does not fix hiring. It keeps clocks and progress off a personal spreadsheet.</p>
        <p>We do not claim FreeIEP reduces burnout by a number.</p>
      </Section>
      <CtaBand />
    </DocPage>
  );
}
