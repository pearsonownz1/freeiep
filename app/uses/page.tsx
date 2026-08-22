import type { Metadata } from "next";
import Link from "next/link";
import { DocPage } from "@/components/marketing/shell";
import { uses } from "@/data/uses";

export const metadata: Metadata = {
  title: "Uses · FreeIEP",
  description: "How people actually use FreeIEP. Same product. Different door.",
};

export default function UsesIndex() {
  return (
    <DocPage title="How people actually use FreeIEP" lede="Same product. Different door." wide>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {uses.map((u) => (
          <Link key={u.slug} href={`/uses/${u.slug}`} className="card p-6">
            <h2 className="font-serif text-[20px] font-medium leading-[1.25]">{u.title}</h2>
            <p className="mt-2 text-[14px] text-ink-soft">{u.oneLine}</p>
          </Link>
        ))}
      </div>
    </DocPage>
  );
}
