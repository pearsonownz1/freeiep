"use client";

import { useState } from "react";
import { clearAssistKey, saveAssistKey } from "@/lib/assist-actions";
import { Field } from "@/components/ui";

export function AssistPanel({ hasKey }: { hasKey: boolean }) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");

  return (
    <section className="mt-12" data-assist-settings>
      <h2 className="font-sans text-[16px] font-semibold">Assist</h2>
      <p className="mt-1 text-[15px] text-ink-soft">
        Optional. Bring your own OpenAI or Anthropic key. FreeIEP has no shared vendor key. We store
        yours for your account only, encrypted. We never log the key or the prompt body. If there is
        no key, Assist stays hidden on student pages.
      </p>
      {hasKey ? (
        <p className="mt-3 rounded-[12px] border border-line bg-paper-raised px-3 py-2 text-[13px] text-ink-soft">
          Key on file. Assist is on for you. It will not invent minutes, placement, eligibility, or
          data points.
        </p>
      ) : null}
      {!open && !hasKey ? (
        <button className="btn btn-secondary mt-4" type="button" onClick={() => setOpen(true)}>
          Add your own API key
        </button>
      ) : null}
      {hasKey && !open ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button className="btn btn-secondary" type="button" onClick={() => setOpen(true)}>
            Replace key
          </button>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={async () => {
              await clearAssistKey();
              setMsg("Assist is hidden again.");
            }}
          >
            Remove key
          </button>
        </div>
      ) : null}
      {open ? (
        <form
          className="mt-4 space-y-3"
          action={async (fd) => {
            setMsg("");
            await saveAssistKey(fd);
            setOpen(false);
            setMsg("Key saved. Assist is on for you.");
          }}
        >
          <Field
            label="Your API key"
            hint="OpenAI (sk-…) or Anthropic (sk-ant-…). Never pasted into a student field."
          >
            <input name="assistKey" type="password" autoComplete="off" required placeholder="Paste key" />
          </Field>
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-primary" type="submit">
              Save key
            </button>
            <button className="btn btn-secondary" type="button" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : null}
      {msg ? <p className="mt-3 text-[13px] text-ink-soft">{msg}</p> : null}
    </section>
  );
}
