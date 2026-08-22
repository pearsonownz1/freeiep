import type { Metadata } from "next";
import { DocPage, Section, BulletList, CtaBand } from "@/components/marketing/shell";

export const metadata: Metadata = {
  title: "It’s free · FreeIEP",
  description: "Every feature. No trial cliff. No Pro. Case manager, family, and invited staff are $0.",
};

export default function PricingPage() {
  return (
    <DocPage title="It’s free." lede="Every feature. No trial cliff. No Pro.">
      <Section title="What it costs">
        <BulletList items={["Case manager: $0.", "Family: $0.", "Invited co-teachers and providers: $0.", "No per-student fee. No card."]} />
      </Section>
      <CtaBand>Start free</CtaBand>
    </DocPage>
  );
}
