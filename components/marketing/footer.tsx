import Link from "next/link";
import { Wordmark } from "@/components/ui";

const features = [
  ["Caseload", "/features/caseload"],
  ["Plan & goals", "/features/plan"],
  ["Progress", "/features/progress"],
  ["Meetings", "/features/scheduling"],
  ["Family portal", "/features/family-portal"],
  ["Privacy", "/features/privacy"],
  ["It’s free", "/pricing"],
] as const;

const audience = [
  ["Case managers", "/for/case-managers"],
  ["Co-teachers", "/for/co-teachers"],
  ["Service providers", "/for/service-providers"],
  ["Families", "/for/families"],
  ["Administrators", "/for/administrators"],
] as const;

const resources = [
  ["All resources", "/resources"],
  ["Uses", "/uses"],
  ["Alternatives", "/alternatives"],
  ["Research", "/research"],
  ["The IEP timeline", "/resources/iep-timeline"],
  ["Writing measurable goals", "/resources/measurable-goals"],
  ["A family’s guide to the meeting", "/resources/family-iep-meeting-guide"],
] as const;

const company = [
  ["Create an account", "/app"],
  ["Log in", "/app"],
  ["Terms", "/terms"],
  ["Privacy", "/privacy"],
] as const;

function Col({ title, items }: { title: string; items: readonly (readonly [string, string])[] }) {
  return (
    <div>
      <p className="text-[12px] font-semibold uppercase tracking-[0.06em] text-ink-soft">{title}</p>
      <ul className="mt-3 space-y-2">
        {items.map(([label, href]) => (
          <li key={href + label}>
            <Link href={href} className="text-[14px] text-ink hover:underline" style={{ textUnderlineOffset: 2 }}>{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-[1080px] gap-10 px-6 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
        <div>
          <Wordmark />
          <p className="mt-4 max-w-[22ch] text-[15px] text-ink">The IEP workspace anyone can use.</p>
          <p className="mt-2 max-w-[28ch] text-[14px] text-ink-soft">Clocks, goals, evidence, and a family view. No card.</p>
        </div>
        <Col title="Features" items={features} />
        <Col title="Who it’s for" items={audience} />
        <Col title="Resources" items={resources} />
        <Col title="Company" items={company} />
      </div>
      <div className="mx-auto max-w-[1080px] px-6 pb-10 text-[13px] text-ink-soft">
        Not the official IEP. Not legal advice.
      </div>
    </footer>
  );
}
