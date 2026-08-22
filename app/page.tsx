import Link from "next/link";
import { Wordmark } from "@/components/ui";

export default function MarketingPage() {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-[1080px] items-center justify-between px-6 py-5">
        <Wordmark />
        <Link href="/login" className="btn btn-primary">
          Start free
        </Link>
      </header>
      <main className="mx-auto max-w-[1080px] px-6 pb-24 pt-10">
        <h1 className="page-title max-w-[16ch] text-[40px] leading-[1.15] md:text-[48px]">
          The IEP workspace anyone can use.
        </h1>
        <p className="mt-5 max-w-[38rem] text-[17px] text-ink-soft">
          Clocks, goals, and a family view. No card. No district wait.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/login" className="btn btn-primary">
            Start free
          </Link>
          <Link href="/privacy" className="btn btn-secondary">
            Read privacy
          </Link>
        </div>
        <section className="mt-16 grid gap-4 md:grid-cols-3">
          <Job title="Keep the dates honest" body="Annual, reeval, progress, notice. Overdue is a word, not a color you have to decode." />
          <Job title="Write a goal you can measure" body="A goal will not save without a metric and a target. You type the minutes. We will not." />
          <Job title="Let family in without a fight" body="They see published progress in plain language. One student. No extra accounts for kids." />
        </section>
        <p className="mt-16 max-w-[38rem] text-[15px] text-ink-soft">
          FreeIEP holds the working case: clocks, goals, evidence, meeting times, a family view.
          The official IEP still lives in the district system. We do not replace it.
        </p>
      </main>
      <footer className="mx-auto flex max-w-[1080px] flex-wrap gap-x-6 gap-y-2 px-6 py-8 text-[13px] text-ink-soft">
        <Link href="/privacy" className="link">Privacy</Link>
        <Link href="/terms" className="link">Terms</Link>
        <span>Student records are not a growth strategy.</span>
      </footer>
    </div>
  );
}

function Job({ title, body }: { title: string; body: string }) {
  return (
    <div className="card p-5">
      <h2 className="font-sans text-[16px] font-semibold">{title}</h2>
      <p className="mt-2 text-[15px] text-ink-soft">{body}</p>
    </div>
  );
}
