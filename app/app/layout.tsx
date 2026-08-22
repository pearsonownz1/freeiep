import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { readStore } from "@/lib/store";
import { logout } from "@/lib/actions";
import { Wordmark } from "@/components/ui";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser("staff");
  if (!user || user.role === "family") redirect("/login");
  const workspace = user.workspaceId
    ? (await readStore()).workspaces.find((w) => w.id === user.workspaceId)
    : null;

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-[220px] shrink-0 border-r border-line bg-paper md:flex md:flex-col">
        <div className="px-5 py-5">
          <Wordmark href="/app" size="sm" />
        </div>
        <nav className="flex flex-col gap-1 px-3 text-[15px]">
          <Nav href="/app">Caseload</Nav>
          <Nav href="/app/calendar">Calendar</Nav>
          <Nav href="/app/settings">Settings</Nav>
        </nav>
        <div className="mt-auto px-5 py-5 text-[12px] text-ink-soft">
          <div>{workspace?.name ?? "No workspace yet"}</div>
          <div>{user.email}</div>
          <form action={logout} className="mt-2">
            <button className="link" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-line px-4 py-3 md:hidden">
          <Wordmark href="/app" size="sm" />
          <nav className="flex gap-3 text-[13px]">
            <Link href="/app">Caseload</Link>
            <Link href="/app/calendar">Calendar</Link>
            <Link href="/app/settings">Settings</Link>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-[1080px] flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}

function Nav({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="rounded-[8px] px-3 py-2 hover:bg-meadow-soft">
      {children}
    </Link>
  );
}
