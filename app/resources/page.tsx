import type { Metadata } from "next";
import Link from "next/link";
import { DocPage } from "@/components/marketing/shell";

export const metadata: Metadata = {
  title: "Resources · FreeIEP",
  description: "Short guides. No newsletter wall. Timeline, measurable goals, and a family meeting guide.",
};

const cards = [
  ["The IEP timeline", "/resources/iep-timeline", "Common IDEA clocks in plain language."],
  ["Writing measurable goals", "/resources/measurable-goals", "If you cannot graph it, it is a hope."],
  ["A family’s guide to the meeting", "/resources/family-iep-meeting-guide", "You are part of the team."],
  ["Uses", "/uses", "Same product. Different door."],
  ["Research notes", "/research", "Short pieces with sources."],
] as const;

export default function ResourcesPage() {
  return (
    <DocPage title="Short guides. No newsletter wall." wide>
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map(([title, href, line]) => (
          <Link key={href} href={href} className="card p-6 hover:border-ink">
            <h2 className="font-serif text-[22px] font-medium leading-[1.25]">{title}</h2>
            <p className="mt-2 text-[15px] text-ink-soft">{line}</p>
          </Link>
        ))}
      </div>
    </DocPage>
  );
}
