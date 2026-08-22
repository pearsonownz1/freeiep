"use client";

import { useEffect, useState } from "react";

export function AssistProposal({
  label,
  suggestion,
  busy,
  error,
  onSuggest,
  onAccept,
  onToss,
}: {
  label: string;
  suggestion: string | null;
  busy?: boolean;
  error?: string;
  onSuggest: () => void;
  onAccept: (text: string) => void;
  onToss: () => void;
}) {
  const [draft, setDraft] = useState(suggestion ?? "");
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    setDraft(suggestion ?? "");
    setEditing(false);
  }, [suggestion]);
  const shown = editing ? draft : (suggestion ?? draft);

  return (
    <div className="mt-2">
      {!suggestion ? (
        <button className="btn btn-secondary" type="button" disabled={busy} onClick={onSuggest}>
          {busy ? "Assist is working…" : label}
        </button>
      ) : (
        <div className="rounded-[12px] border border-line bg-paper-raised p-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft">Assist proposal</div>
          <p className="mt-1 text-[13px] text-ink-soft">You decide. Assist does not invent minutes, placement, or data.</p>
          <textarea
            className="mt-2 w-full"
            rows={4}
            value={shown}
            onChange={(e) => {
              setEditing(true);
              setDraft(e.target.value);
            }}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <button className="btn btn-primary" type="button" onClick={() => onAccept(shown)}>
              Accept
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => {
                setEditing(true);
                setDraft(suggestion);
              }}
            >
              Edit
            </button>
            <button className="btn btn-secondary" type="button" onClick={onToss}>
              Toss
            </button>
          </div>
        </div>
      )}
      {error ? <p className="mt-2 text-[13px] text-berry">{error}</p> : null}
    </div>
  );
}
