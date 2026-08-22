import Link from "next/link";
import { Wordmark } from "@/components/ui";

export default function PrivacyPage() {
  return (
    <Legal title="Privacy">
      <p>FreeIEP is a working case file for educators acting in a professional capacity, and for invited families.</p>
      <p>We do not sell student records. We do not train models on your records. There are no ads against student data.</p>
      <p>Students do not create accounts.</p>
      <p>Data lives in your workspace. You can export JSON from Settings. Deleting a student removes their files from this app (we say 30 days; this demo deletes immediately).</p>
      <p>If we learn of a breach that involves your workspace, we email workspace owners within 72 hours.</p>
      <p>Optional Assist is bring-your-own-key. If you add a key, we do not log prompt bodies. Photos are not sent to a model in this version.</p>
      <p>This product is not the official IEP and is not legal advice.</p>
      <p className="text-ink-soft">FERPA framing: school-official use by the educator who created the workspace.</p>
    </Legal>
  );
}

export function Legal({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="mx-auto max-w-[38rem] px-6 py-5">
        <Wordmark />
      </header>
      <article className="mx-auto max-w-[38rem] px-6 pb-20">
        <h1 className="page-title text-[28px] leading-[1.2]">{title}</h1>
        <div className="mt-6 space-y-4">{children}</div>
        <p className="mt-10">
          <Link href="/" className="link">Back</Link>
        </p>
      </article>
    </div>
  );
}
