import Link from "next/link";
import { MarketingFooter } from "./footer";
import { MarketingHeader } from "./header";

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <MarketingHeader />
      {children}
      <MarketingFooter />
    </div>
  );
}

export function StartFree({ note }: { note?: string }) {
  return (
    <div>
      <Link href="/app" className="btn btn-primary">
        Start free
      </Link>
      {note ? <p className="mt-3 text-[13px] text-ink-soft">{note}</p> : null}
    </div>
  );
}

export function CtaBand({ children = "Start free. The official IEP still lives where your district keeps it." }: { children?: React.ReactNode }) {
  return (
    <div className="mt-16 rounded-[16px] border border-line bg-paper-raised px-6 py-8 shadow-card">
      <p className="font-serif text-[22px] font-medium leading-[1.3]">{children}</p>
      <div className="mt-5">
        <Link href="/app" className="btn btn-primary">
          Start free
        </Link>
      </div>
    </div>
  );
}

export function DocPage({
  title,
  lede,
  wide,
  children,
}: {
  title: string;
  lede?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <MarketingShell>
      <main className={`mx-auto px-6 pb-20 pt-10 ${wide ? "max-w-[1080px]" : "max-w-[38rem]"}`}>
        <h1 className="page-title text-[34px] leading-[1.15] md:text-[40px]">{title}</h1>
        {lede ? <p className="mt-4 text-[17px] leading-[1.55] text-ink-soft">{lede}</p> : null}
        <div className="mt-10">{children}</div>
      </main>
    </MarketingShell>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-serif text-[22px] font-medium leading-[1.25]">{title}</h2>
      <div className="mt-3 space-y-3 text-[15px] leading-[1.6] text-ink">{children}</div>
    </section>
  );
}

export function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-[1.6]">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function Related({ links }: { links: { href: string; label: string }[] }) {
  return (
    <p className="mt-10 text-[14px] text-ink-soft">
      Related:{" "}
      {links.map((l, i) => (
        <span key={l.href}>
          {i > 0 ? " · " : null}
          <Link href={l.href} className="text-ink underline" style={{ textUnderlineOffset: 2 }}>
            {l.label}
          </Link>
        </span>
      ))}
    </p>
  );
}
