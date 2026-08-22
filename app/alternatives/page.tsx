import type { Metadata } from "next";
import Link from "next/link";
import { DocPage } from "@/components/marketing/shell";
import { alternatives } from "@/data/alternatives";

export const metadata: Metadata = {
  title: "Alternatives · FreeIEP",
  description: "We are free. We are not the system of record. How FreeIEP sits next to other tools.",
};

const rows = [
  [
    "Official state IEP forms, Medicaid, state reporting",
    "Frontline, PowerSchool Special Programs, SEIS, EasyIEP, Embrace, SpedTrack, SameGoal",
    "No. Sit beside them.",
  ],
  [
    "AI writers and gen-ed snapshots, IEP stays in the district system",
    "Playground IEP",
    "We are the working case + family view, not a Copilot suite.",
  ],
  [
    "Goal-writing PD and strategy banks",
    "Goalbook",
    "Not our product.",
  ],
  [
    "A paid all-in-one that fills the district PDF",
    "SyncIEP",
    "We do not overlay the official form. We cost $0. Family portal and clocks are the overlap.",
  ],
  [
    "Parent-only advocacy (letters, cited law, hidden from school)",
    "IEP Compass, IEP Desk, IEP Guardian",
    "We are school-invited. Not a demand-letter tool.",
  ],
] as const;

export default function AlternativesIndex() {
  return (
    <DocPage
      title="How FreeIEP sits next to other tools"
      lede="We are free. We are not the system of record. Pick the row that is true."
      wide
    >
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left text-[15px]">
          <thead>
            <tr className="border-b border-line text-[12px] uppercase tracking-[0.06em] text-ink-soft">
              <th className="py-3 pr-4 font-semibold">If you need</th>
              <th className="py-3 pr-4 font-semibold">Use</th>
              <th className="py-3 font-semibold">FreeIEP</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([need, use, us]) => (
              <tr key={need} className="border-b border-line align-top">
                <td className="py-4 pr-4">{need}</td>
                <td className="py-4 pr-4">{use}</td>
                <td className="py-4">{us}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-4 md:hidden">
        {rows.map(([need, use, us]) => (
          <div key={need} className="card p-5">
            <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-soft">If you need</p>
            <p className="mt-1">{need}</p>
            <p className="mt-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-soft">Use</p>
            <p className="mt-1">{use}</p>
            <p className="mt-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-soft">FreeIEP</p>
            <p className="mt-1">{us}</p>
          </div>
        ))}
      </div>
      <ul className="mt-10 space-y-2 text-[15px]">
        {alternatives.map((a) => (
          <li key={a.slug}>
            <Link href={`/alternatives/${a.slug}`} className="underline" style={{ textUnderlineOffset: 2 }}>
              FreeIEP and {a.name}
            </Link>
          </li>
        ))}
      </ul>
    </DocPage>
  );
}
