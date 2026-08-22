import Link from "next/link";

export function Wordmark({ href = "/", size = "md" }: { href?: string; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "text-[15px]" : "text-[18px]";
  return (
    <Link href={href} className={`inline-flex items-center gap-2 tracking-[-0.02em] ${cls}`} style={{ letterSpacing: "-0.02em" }}>
      <img src="/mark.svg" alt="" width={size === "sm" ? 24 : 28} height={size === "sm" ? 24 : 28} />
      <span>
        <span className="font-normal">Free</span>
        <span className="font-semibold">IEP</span>
      </span>
    </Link>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`card p-5 ${className}`}>{children}</div>;
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
      {hint ? <p className="text-[12px] text-ink-soft">{hint}</p> : null}
    </div>
  );
}

export function FamilySwitch({
  name = "published",
  defaultChecked = false,
  label = "Family can see this",
}: {
  name?: string;
  defaultChecked?: boolean;
  label?: string;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-[13px] font-medium text-clay">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="accent-[var(--clay)] h-4 w-4" />
      {label}
    </label>
  );
}

export function FamilyPill() {
  return <span className="pill bg-clay-soft text-clay">Published to family</span>;
}
