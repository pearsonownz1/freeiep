import type { Metadata } from "next";
import { DocPage, Section, CtaBand } from "@/components/marketing/shell";

export const metadata: Metadata = {
  title: "The IEP timeline · FreeIEP",
  description: "A plain-language sketch of common IDEA clocks in the US. Not legal advice.",
};

export default function Page() {
  return (
    <DocPage
      title="The IEP timeline, without the fog"
      lede="This is a plain-language sketch of common IDEA clocks in the US. Your state can be shorter. Your district’s official dates win. FreeIEP is not legal advice."
    >
      <Section title="Referral and consent"><p>School gets a request to evaluate. They need your consent to start.</p></Section>
      <Section title="Initial evaluation"><p>Many places use about 60 days from consent. Some states are tighter.</p></Section>
      <Section title="Eligibility and the first IEP"><p>If the student qualifies, the team writes the first plan. Services start by the date on that plan.</p></Section>
      <Section title="Progress reports"><p>As often as the IEP says. Often quarterly. The number should match the goal’s metric.</p></Section>
      <Section title="Annual review"><p>At least once a year. The team looks at progress and updates the plan.</p></Section>
      <Section title="Reevaluation"><p>At least every three years, unless the team agrees otherwise. Sometimes sooner.</p></Section>
      <Section title="Notice"><p>Before the school proposes or refuses a change in identification, evaluation, placement, or FAPE, they owe you written notice. Your district may have a required form. FreeIEP’s notice is a record your team can keep. It does not replace a required district form.</p></Section>
      <p className="mt-10 text-[15px]">Put the dates on the student in FreeIEP so they do not live in a spreadsheet.</p>
      <CtaBand />
    </DocPage>
  );
}
