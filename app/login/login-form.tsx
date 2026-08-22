"use client";

import { useState } from "react";
import Link from "next/link";
import { sendLoginLink } from "@/lib/actions";
import { Wordmark } from "@/components/ui";

export function LoginForm({ error }: { error?: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(error ?? "");

  return (
    <div className="mx-auto flex min-h-screen max-w-[28rem] flex-col px-6 py-8">
      <Wordmark />
      <h1 className="page-title mt-10 text-[28px] leading-[1.05]">Sign in</h1>
      <p className="mt-2 text-ink-soft">We email a link. In this demo, the link is shown here so you need no mail server.</p>
      <form
        className="mt-6 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setErr("");
          try {
            const fd = new FormData(e.currentTarget);
            const res = await sendLoginLink(fd);
            setUrl(res.url);
          } catch (ex) {
            setErr(ex instanceof Error ? ex.message : "Could not send the link.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="field">
          <label htmlFor="email">Work email</label>
          <input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        {err ? <p className="rounded-[4px] bg-berry-soft px-3 py-2 text-[13px] text-berry">{err}</p> : null}
        <button className="btn btn-primary w-full" disabled={busy} type="submit">
          {busy ? "Working…" : "Send link"}
        </button>
      </form>
      {url ? (
        <p className="card mt-6 p-4 text-[15px]">
          Open your demo link:{" "}
          <Link href={url} className="link break-all">
            {url}
          </Link>
        </p>
      ) : null}
      <p className="mt-8 text-[13px] text-ink-soft">
        By continuing you will accept <Link href="/privacy" className="link">Privacy</Link> and{" "}
        <Link href="/terms" className="link">Terms</Link> before any student is saved.
      </p>
    </div>
  );
}
