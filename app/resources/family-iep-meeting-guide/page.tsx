import type { Metadata } from "next";
import { DocPage, Section, BulletList, CtaBand } from "@/components/marketing/shell";

export const metadata: Metadata = {
  title: "A family’s guide to the meeting · FreeIEP",
  description: "You are part of the team. Before, during, and after the IEP meeting in plain language.",
};

export default function Page() {
  return (
    <DocPage title="A family’s guide to the IEP meeting" lede="You are part of the team. The meeting should not feel like a briefing you were not invited to.">
      <Section title="Before">
        <BulletList items={["Ask for the draft and recent progress in time to read them.", "Write two things that work at home and two that do not.", "Know the time. If it is wrong, say so. In FreeIEP you can pick a slot from email."]} />
      </Section>
      <Section title="During">
        <BulletList items={["Present levels should sound like your child, not a test code.", "Every goal needs a number. Ask “How will we know?”", "Services and minutes are a team decision. Software should not invent them.", "You can ask for a break."]} />
      </Section>
      <Section title="After">
        <BulletList items={["You should get the plan and any notice in writing.", "In FreeIEP, published progress and acknowledgments stay on the student."]} />
      </Section>
      <p className="mt-10 text-[15px] text-ink-soft">This is not legal advice. For rights in your state, ask your parent center or an attorney.</p>
      <CtaBand />
    </DocPage>
  );
}
