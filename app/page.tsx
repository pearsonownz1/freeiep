import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell, StartFree } from "@/components/marketing/shell";

export const metadata: Metadata = {
  title: "FreeIEP · The IEP workspace anyone can use",
  description:
    "Free caseload clocks, measurable goals, progress you can date, and a family view. Not the official IEP. No card.",
};

export default function HomePage() {
  return (
    <MarketingShell>
      <main className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-70"
          style={{
            background:
              "radial-gradient(ellipse 50% 70% at 18% 40%, #FFE8DC 0%, transparent 60%), radial-gradient(ellipse 45% 65% at 82% 35%, #EDE7FF 0%, transparent 58%), radial-gradient(ellipse 40% 50% at 50% 80%, #E7F8F1 0%, transparent 55%)",
          }}
        />
        <div className="relative mx-auto max-w-[1080px] px-6 pb-24 pt-16 md:pt-24">
          <h1 className="page-title mx-auto max-w-[14ch] text-center text-[40px] font-medium leading-[1.15] md:text-[48px]">
            The IEP workspace
            <br />
            anyone can use.
          </h1>
          <p className="mx-auto mt-5 max-w-[36rem] text-center text-[16px] text-ink-soft">
            Clocks, goals, and a family view. No card. No district wait.
          </p>
          <div className="mt-8 flex justify-center">
            <StartFree note="Takes a minute. Students never get accounts." />
          </div>

          <section className="mt-20 grid gap-5 md:grid-cols-3">
            <Job
              title="Keep the dates honest"
              body="Annual, reevaluation, and progress-report windows sit on the student, not in a spreadsheet."
            />
            <Job
              title="Write a goal you can measure"
              body="A goal will not save without a metric and a target. Log what happened. See the line move."
            />
            <Job
              title="Let family in"
              body="They see only what you publish. They can confirm a meeting from an email link with no account."
            />
          </section>

          <section className="mx-auto mt-16 max-w-[38rem]">
            <h2 className="font-serif text-[22px] font-medium">What it is not</h2>
            <ul className="mt-3 space-y-2 text-[15px] text-ink">
              <li>Not your district’s IEP form.</li>
              <li>Not Medicaid.</li>
              <li>Not state reporting.</li>
              <li>Not an attorney.</li>
            </ul>
          </section>

          <section className="mx-auto mt-16 max-w-[38rem]">
            <h2 className="font-serif text-[22px] font-medium">How a week looks</h2>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-[15px] text-ink">
              <li>Add a student. Set the annual date.</li>
              <li>Write two goals with numbers.</li>
              <li>Log three points from class.</li>
              <li>Publish a progress note the family can read.</li>
              <li>Propose two meeting times. They pick one.</li>
            </ol>
          </section>

          <section className="mx-auto mt-16 max-w-[38rem] text-center">
            <p className="font-serif text-[24px] font-medium leading-[1.3]">
              Start free. The official IEP still lives where your district keeps it.
            </p>
            <div className="mt-6 flex justify-center">
              <Link href="/app" className="btn btn-primary">
                Start free
              </Link>
            </div>
          </section>
        </div>
      </main>
    </MarketingShell>
  );
}

function Job({ title, body }: { title: string; body: string }) {
  return (
    <div className="card p-7">
      <h2 className="font-serif text-[22px] font-medium leading-[1.25]">{title}</h2>
      <p className="mt-3 text-[15px] text-ink-soft">{body}</p>
    </div>
  );
}
