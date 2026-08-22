"use server";

import { revalidatePath } from "next/cache";
import { actorName, staffCanSeeStudent } from "./access";
import {
  ASSIST_ACTIONS,
  buildAssistPrompt,
  callVendor,
  decryptAssistKey,
  encryptAssistKey,
  hasAssistKey,
  noteAssistCall,
  type AssistAction,
} from "./assist";
import { currentUser } from "./auth";
import { nid } from "./ids";
import { mutateStore, readStore } from "./store";

function fail(message: string): never {
  throw new Error(message);
}

export async function saveAssistKey(formData: FormData) {
  const user = await currentUser("staff");
  if (!user) fail("Sign in first.");
  const key = String(formData.get("assistKey") || "").trim();
  if (!key) fail("Paste an API key, or leave Assist hidden.");
  if (key.length < 12) fail("That does not look like an API key.");
  const wrapped = encryptAssistKey(key);
  await mutateStore((s) => {
    const u = s.users.find((x) => x.id === user.id);
    if (u) u.assistKey = wrapped;
  });
  revalidatePath("/app/settings");
  revalidatePath("/app");
}

export async function clearAssistKey() {
  const user = await currentUser("staff");
  if (!user) fail("Sign in first.");
  await mutateStore((s) => {
    const u = s.users.find((x) => x.id === user.id);
    if (u) u.assistKey = undefined;
  });
  revalidatePath("/app/settings");
  revalidatePath("/app");
}

export async function runAssist(input: {
  action: AssistAction;
  studentId: string;
  text?: string;
  title?: string;
  metric?: string;
  baseline?: string;
  target?: string;
  unit?: string;
  timeline?: string;
}): Promise<{ suggestion: string }> {
  const user = await currentUser("staff");
  if (!user || user.role === "family") fail("Sign in as staff first.");
  if (!hasAssistKey(user.assistKey)) fail("Add your own API key in Settings first.");
  const key = decryptAssistKey(user.assistKey);
  if (!key) fail("The saved key could not be read. Paste it again in Settings.");
  if (!ASSIST_ACTIONS.includes(input.action)) fail("Assist cannot do that.");
  const store = await readStore();
  const student = store.students.find((x) => x.id === input.studentId);
  if (!student || !staffCanSeeStudent(user, student)) fail("Student not found.");
  const prompt = buildAssistPrompt(input.action, student, input);
  noteAssistCall(input.action);
  const suggestion = await callVendor({ key, action: input.action, prompt });
  await mutateStore((s) => {
    const st = s.students.find((x) => x.id === input.studentId);
    if (!st) return;
    st.activity.unshift({
      id: nid("act"),
      who: actorName(user),
      verb: "used",
      object: "Assist",
      at: new Date().toISOString(),
    });
    st.activity = st.activity.slice(0, 80);
  });
  revalidatePath(`/app/students/${input.studentId}`);
  return { suggestion };
}
