import "server-only";
import crypto from "crypto";
import type { Student } from "./types";

export const ASSIST_ACTIONS = [
  "rewrite_present_levels",
  "smart_goal",
  "plain_progress_note",
] as const;

export type AssistAction = (typeof ASSIST_ACTIONS)[number];

const WRAP_PREFIX = "enc:v1:";

function wrapSecret(): Buffer {
  const raw = process.env.TOKEN_SECRET || process.env.ASSIST_WRAP_SECRET || "freeiep-local-assist-wrap";
  return crypto.createHash("sha256").update(raw).digest();
}

export function encryptAssistKey(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", wrapSecret(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${WRAP_PREFIX}${iv.toString("base64")}:${tag.toString("base64")}:${enc.toString("base64")}`;
}

export function decryptAssistKey(stored: string | undefined): string | null {
  if (!stored || stored === "••••••••") return null;
  if (!stored.startsWith(WRAP_PREFIX)) return stored;
  const parts = stored.slice(WRAP_PREFIX.length).split(":");
  if (parts.length !== 3) return null;
  try {
    const [ivB64, tagB64, dataB64] = parts;
    const decipher = crypto.createDecipheriv("aes-256-gcm", wrapSecret(), Buffer.from(ivB64, "base64"));
    decipher.setAuthTag(Buffer.from(tagB64, "base64"));
    return Buffer.concat([decipher.update(Buffer.from(dataB64, "base64")), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}

export function hasAssistKey(stored: string | undefined): boolean {
  return Boolean(stored && stored !== "••••••••");
}

export function detectProvider(key: string): "openai" | "anthropic" {
  if (key.startsWith("sk-ant-")) return "anthropic";
  return "openai";
}

function looksLikeFilePayload(text: string): boolean {
  return /data:image\/|data:application\/pdf|%PDF-|filename=.+\.(pdf|png|jpe?g|webp)/i.test(text);
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function stripStudentNames(text: string, student: Student): string {
  let next = text;
  const names = [student.firstName, student.lastName, student.localId].filter(
    (n): n is string => Boolean(n && n.trim().length > 1),
  );
  for (const name of names) {
    next = next.replace(new RegExp(`\\b${escapeRe(name)}\\b`, "gi"), "the student");
  }
  return next;
}

const SYSTEM = [
  "You are Assist in FreeIEP. Propose clearer wording only.",
  "Return plain text. No markdown fences. No JSON.",
  "Never invent service minutes, placement, eligibility, disability category, or data points.",
  "Never draft a full IEP. Never ask for or describe photos or official PDFs.",
  "Do not add facts that are not in the input. The teacher must accept any change.",
].join(" ");

function promptFor(
  action: AssistAction,
  input: { text?: string; title?: string; metric?: string; baseline?: string; target?: string; unit?: string; timeline?: string },
): string {
  if (action === "rewrite_present_levels") {
    return `Rewrite these present levels for clarity. Keep every fact. Do not add minutes, placement, eligibility, or new data.\n\n${input.text || ""}`;
  }
  if (action === "smart_goal") {
    return [
      "Turn this goal title and metric into one cleaner SMART sentence.",
      "Use only the numbers and facts given. Do not invent a baseline, target, minutes, placement, or eligibility.",
      `Title: ${input.title || ""}`,
      `Metric: ${input.metric || ""}`,
      input.baseline ? `Baseline: ${input.baseline}` : "",
      input.target ? `Target: ${input.target}` : "",
      input.unit ? `Unit: ${input.unit}` : "",
      input.timeline ? `Timeline: ${input.timeline}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }
  return `Rewrite this progress note in plain language a family can read. Keep the facts. Do not invent scores or data points.\n\n${input.text || ""}`;
}

export async function callVendor(params: {
  key: string;
  action: AssistAction;
  prompt: string;
}): Promise<string> {
  const provider = detectProvider(params.key);
  const userPrompt = params.prompt;
  if (provider === "anthropic") {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": params.key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 500,
        system: SYSTEM,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
    if (!res.ok) throw new Error("Assist could not reach Anthropic. Check the key.");
    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    const text = data.content?.find((c) => c.type === "text")?.text?.trim();
    if (!text) throw new Error("Assist came back empty.");
    return text;
  }
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${params.key}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 500,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: userPrompt },
      ],
    }),
  });
  if (!res.ok) throw new Error("Assist could not reach OpenAI. Check the key.");
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("Assist came back empty.");
  return text;
}

export function buildAssistPrompt(
  action: AssistAction,
  student: Student,
  input: { text?: string; title?: string; metric?: string; baseline?: string; target?: string; unit?: string; timeline?: string },
): string {
  const cleaned = {
    text: stripStudentNames(input.text || "", student),
    title: stripStudentNames(input.title || "", student),
    metric: input.metric || "",
    baseline: stripStudentNames(input.baseline || "", student),
    target: stripStudentNames(input.target || "", student),
    unit: input.unit || "",
    timeline: input.timeline || "",
  };
  const joined = Object.values(cleaned).join("\n");
  if (looksLikeFilePayload(joined)) {
    throw new Error("Assist will not read photos or official PDFs.");
  }
  if (action === "rewrite_present_levels" && !cleaned.text.trim()) {
    throw new Error("Write present levels first. Assist will not draft a full IEP from empty.");
  }
  if (action === "smart_goal" && !cleaned.title.trim() && !cleaned.metric.trim()) {
    throw new Error("Add a goal title and metric first.");
  }
  if (action === "plain_progress_note" && !cleaned.text.trim()) {
    throw new Error("Write a note first. Assist will not invent data points.");
  }
  return promptFor(action, cleaned);
}

export function noteAssistCall(action: AssistAction): void {
  console.log(`[FreeIEP] Assist call happened (${action})`);
}
