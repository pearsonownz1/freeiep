import type { Metadata } from "next";
import Link from "next/link";
import { DocPage } from "@/components/marketing/shell";

export const metadata: Metadata = {
  title: "Research · FreeIEP",
  description: "Notes, not a journal. Short pieces with sources. No fake statistics.",
};

export default function ResearchPage() {
  return (
    <DocPage title="Notes, not a journal" lede="Short pieces with sources. No fake statistics.">
      <Link href="/research/special-education-teacher-shortage-statistics" className="card block p-6">
        <h2 className="font-serif text-[22px] font-medium">Special education staffing pressure</h2>
        <p className="mt-2 text-[15px] text-ink-soft">Why a free workspace is even a conversation.</p>
      </Link>
    </DocPage>
  );
}
