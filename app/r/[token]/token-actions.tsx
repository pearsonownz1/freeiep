"use client";

import { useState } from "react";
import { redeemPublicToken } from "@/lib/actions";

export function TokenActions({
  tokenId,
  kind,
  slots = [],
  defaultSlot,
}: {
  tokenId: string;
  kind: string;
  slots?: { id: string; startsAt: string; endsAt: string }[];
  defaultSlot?: string;
}) {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function go(extra?: FormData) {
    setBusy(true);
    try {
      const res = await redeemPublicToken(tokenId, extra);
      if (res && "reply" in res) {
        setMsg(
          res.reply === "accept"
            ? "Time confirmed. The first working slot sticks."
            : res.reply === "decline"
              ? "Declined. The teacher will see it."
              : "Note sent. The teacher will see it.",
        );
      }
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Could not save that.");
    } finally {
      setBusy(false);
    }
  }

  if (kind === "family_invite") {
    return (
      <form
        className="mt-6"
        onSubmit={async (e) => {
          e.preventDefault();
          await go();
        }}
      >
        <button className="btn btn-primary min-h-11" disabled={busy} type="submit">
          Open family view
        </button>
      </form>
    );
  }

  return (
    <form
      className="mt-6 space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        await go(new FormData(e.currentTarget));
      }}
    >
      {slots.length ? (
        <div className="field">
          <label htmlFor="slotId">If you accept, which time</label>
          <select id="slotId" name="slotId" defaultValue={defaultSlot}>
            {slots.map((s) => (
              <option key={s.id} value={s.id}>
                {s.startsAt}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      {kind === "meeting_suggest" ? (
        <div className="field">
          <label htmlFor="suggestNote">Other times that work</label>
          <textarea id="suggestNote" name="suggestNote" />
        </div>
      ) : null}
      <button className="btn btn-primary min-h-11 w-full" disabled={busy} type="submit">
        {kind === "meeting_accept" ? "Accept" : kind === "meeting_decline" ? "Decline" : "Suggest other"}
      </button>
      {msg ? <p className="text-[15px]">{msg}</p> : null}
    </form>
  );
}
