"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/ui";
import { StaffSearch, type SearchStudent } from "./staff-search";

type Item = {
  href: string;
  label: string;
  match?: "exact" | "prefix";
};

export function StaffChrome({
  children,
  workspaceName,
  email,
  roleLabel,
  students,
}: {
  children: React.ReactNode;
  workspaceName: string;
  email: string;
  roleLabel: string;
  students: SearchStudent[];
}) {
  const pathname = usePathname();

  const home: Item[] = [
    { href: "/app", label: "Dashboard", match: "exact" },
    { href: "/app/students", label: "Students", match: "prefix" },
  ];
  const work: Item[] = [
    { href: "/app/progress", label: "Progress", match: "prefix" },
    { href: "/app/meetings", label: "Meetings", match: "prefix" },
    { href: "/app/calendar", label: "Calendar", match: "prefix" },
    { href: "/app/family", label: "Family", match: "prefix" },
    { href: "/app/notices", label: "Notices", match: "prefix" },
    { href: "/app/team", label: "Team", match: "prefix" },
  ];

  function isActive(item: Item) {
    if (item.match === "exact") return pathname === item.href;
    if (item.href === "/app/students") {
      return pathname === "/app/students" || pathname.startsWith("/app/students/");
    }
    return pathname === item.href || pathname.startsWith(item.href + "/");
  }

  function NavLink({ item }: { item: Item }) {
    const active = isActive(item);
    return (
      <Link
        href={item.href}
        className={`rounded-[12px] px-3 py-2 text-[14px] font-medium ${
          active ? "bg-white text-ink shadow-[0_1px_0_var(--line)]" : "text-ink-soft hover:bg-white hover:text-ink"
        }`}
      >
        {item.label}
      </Link>
    );
  }

  function Section({ title, items }: { title: string; items: Item[] }) {
    return (
      <div className="mt-5">
        <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft">{title}</div>
        <nav className="flex flex-col gap-0.5">{items.map((item) => <NavLink key={item.label} item={item} />)}</nav>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-paper">
      <aside className="hidden w-[220px] shrink-0 flex-col border-r border-line bg-paper md:flex">
        <div className="px-5 py-5">
          <Wordmark href="/app" size="sm" />
        </div>
        <div className="flex-1 px-3 pb-4">
          <Section title="Home" items={home} />
          <Section title="Work" items={work} />
        </div>
        <div className="border-t border-line px-5 py-4 text-[12px] text-ink-soft">
          <div className="font-medium text-ink">{workspaceName}</div>
          <div className="truncate">{email}</div>
          <div>{roleLabel}</div>
          <Link href="/app/settings" className="mt-2 inline-block font-medium text-ink hover:underline">
            Settings
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-line bg-paper px-4 py-3">
          <div className="md:hidden">
            <Wordmark href="/app" size="sm" />
          </div>
          <div className="hidden min-w-0 flex-1 md:block">
            <StaffSearch students={students} />
          </div>
          <div className="ml-auto flex items-center gap-4 text-[13px] font-medium">
            <Link href="/app/support" className="text-ink-soft hover:text-ink">
              Support
            </Link>
            <Link href="/app/settings" className="text-ink-soft hover:text-ink">
              Settings
            </Link>
          </div>
        </header>

        <div className="flex flex-wrap gap-2 border-b border-line px-4 py-2 text-[13px] font-medium md:hidden">
          {[...home, ...work].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`rounded-full px-3 py-1 ${isActive(item) ? "bg-meadow-soft text-meadow" : "text-ink-soft"}`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <main className="mx-auto w-full max-w-[1080px] flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
