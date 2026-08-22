import Link from "next/link";
import { Wordmark } from "@/components/ui";

export function MarketingHeader() {
  return (
    <header className="mx-auto flex max-w-[1080px] items-center justify-between px-6 py-5">
      <Wordmark />
      <nav className="flex items-center gap-5">
        <Link href="/app" className="hidden text-[14px] font-medium text-ink-soft sm:inline hover:text-ink">Log in</Link>
        <Link href="/app" className="btn btn-primary">Start free</Link>
      </nav>
    </header>
  );
}
