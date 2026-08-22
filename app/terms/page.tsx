import type { Metadata } from "next";
import Link from "next/link";
import { DocPage, Section } from "@/components/marketing/shell";

export const metadata: Metadata = {
  title: "Terms · FreeIEP",
  description: "Educator or invited family only. $0. Not the official IEP. Not legal advice.",
};

export default function TermsPage() {
  return (
    <DocPage title="Terms" lede="Educator, provider, or invited family. $0. Not the official IEP.">
      <Section title="Who may use this">
        <p>
          You must be an educator or provider acting in a professional capacity, or an invited family
          member or educational rights-holder. Do not create accounts for students.
        </p>
      </Section>
      <Section title="Price">
        <p>FreeIEP is $0. There is no paid plan and no feature gate in this product.</p>
      </Section>
      <Section title="Not the official IEP">
        <p>
          This is not the official IEP and not legal advice. You are responsible for what you enter.
          Minutes, placement, eligibility, and official notices still belong to the district process.
          If your district requires a specific form, use that form.
        </p>
      </Section>
      <Section title="Assist">
        <p>
          Assist is optional and uses your own API key. We do not invent minutes, placement,
          eligibility, or data points.
        </p>
      </Section>
      <Section title="Abuse">
        <p>We can take a workspace down for abuse or unlawful use.</p>
      </Section>
      <Section title="Law">
        <p>
          Use is US-oriented. Governing law is a US placeholder and can be set to a specific state
          later. Host where your district allows student records.
        </p>
      </Section>
      <p className="mt-10 text-[15px]">
        <Link href="/privacy" className="underline" style={{ textUnderlineOffset: 2 }}>
          Privacy
        </Link>
      </p>
    </DocPage>
  );
}
