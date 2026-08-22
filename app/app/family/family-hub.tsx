"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { revokeFamilyAccess } from "@/lib/actions";
import { formatDay } from "@/lib/format";
import type { FamilyHubRow, FamilyInviteStatus } from "@/lib/types";

const STATUS: Record<FamilyInviteStatus, { label: string; cls: string }> = {
  none: { label: "None", cls: "bg-paper text-ink-soft" },
  pending: { label: "Pending", cls: "bg-sun-soft text-sun" },
  active: { label: "Active", cls: "bg-meadow-soft text-meadow" },
  revoked: { label: "Revoked", cls: "bg-berry-soft text-berry" },
};

export function FamilyHub({
  rows,
  canRevoke,
  kpis,
}: {
  rows: FamilyHubRow[];
  canRevoke: boolean;
  kpis: { pending: number; active: number; waiting: number };
}) {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="page-title text-[28px] leading-[1.2]">Family</h1>
          <p className="mt-1 text-ink-soft">
            Parents get a login. Playground does not. They see only what you publish.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Kpi label="Pending invites" value={kpis.pending} />
        <Kpi label="Active family" value={kpis.active} />
        <Kpi label="Waiting on family" value={kpis.waiting} />
      </div>

      <ul className="mt-6 grid gap-3">
        {rows.map((row) => (
          <StudentCard key={row.id} row={row} canRevoke={canRevoke && row.canRevoke} />
        ))}
        {!rows.length ? (
          <li className="card p-6 text-[15px] text-ink-soft">
            Add a student, then send a family invite. No email is sent in this demo — copy the link.
          </li>
        ) : null}
      </ul>
    </div>
  );
}

function StudentCard({ row, canRevoke }: { row: FamilyHubRow; canRevoke: boolean }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const status = STATUS[row.inviteStatus];
  const invitePath = row.inviteTokenId ? `/r/${row.inviteTokenId}` : null;

  async function copy() {
    if (!invitePath) return;
    const url = `${window.location.origin}${invitePath}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <li className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-sans text-[16px] font-semibold">{row.name}</div>
          <p className="text-[13px] text-ink-soft">Grade {row.grade || "—"}</p>
        </div>
        <span className={`pill ${status.cls}`}>{status.label}</span>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        <Meta
          label="Last published progress"
          value={row.lastPublishedProgress ? formatDay(row.lastPublishedProgress) : "None"}
        />
        <Meta
          label="Unsigned notices"
          value={row.unsignedNotices ? String(row.unsignedNotices) : "None"}
          warn={row.unsignedNotices > 0}
        />
        <Meta
          label="Unconfirmed meetings"
          value={row.unconfirmedMeetings ? String(row.unconfirmedMeetings) : "None"}
          warn={row.unconfirmedMeetings > 0}
        />
      </dl>

      {row.inviteEmail ? (
        <p className="mt-3 text-[13px] text-ink-soft">
          {row.inviteStatus === "revoked" ? "Last family" : "Family"} · {row.inviteEmail}
          {row.inviteStatus === "pending" ? " · link ready, not emailed" : ""}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {invitePath ? (
          <button className="btn btn-primary" type="button" onClick={copy}>
            {copied ? "Copied" : "Copy invite link"}
          </button>
        ) : null}
        {canRevoke && row.inviteEmail ? (
          <button
            className="btn btn-danger"
            type="button"
            onClick={async () => {
              if (!confirm(`Revoke family access for ${row.inviteEmail}?`)) return;
              await revokeFamilyAccess(row.id, row.inviteEmail!);
              router.refresh();
            }}
          >
            Revoke
          </button>
        ) : null}
        <Link href={`/app/students/${row.id}?tab=family`} className="btn btn-secondary">
          Student family tab
        </Link>
      </div>
    </li>
  );
}

function Meta({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div>
      <dt className="text-[12px] font-medium uppercase tracking-[0.06em] text-ink-soft">{label}</dt>
      <dd className={`mt-1 text-[15px] ${warn ? "text-sun" : ""}`}>{value}</dd>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <div className="card px-4 py-3">
      <div className="text-[12px] font-medium uppercase tracking-[0.06em] text-ink-soft">{label}</div>
      <div className="mt-1 font-sans text-[22px] font-semibold tabular">{value}</div>
    </div>
  );
}
