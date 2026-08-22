import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocPage, Section, CtaBand } from "@/components/marketing/shell";
import { alternativeBySlug, alternatives } from "@/data/alternatives";

export function generateStaticParams() {
  return alternatives.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = alternativeBySlug(slug);
  if (!page) return { title: "Alternatives · FreeIEP" };
  return { title: `FreeIEP and ${page.name} · FreeIEP`, description: `Different job. How FreeIEP sits next to ${page.name}.` };
}

export default async function AlternativePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = alternativeBySlug(slug);
  if (!page) notFound();
  return (
    <DocPage title={`FreeIEP and ${page.name}`} lede="Different job. Do not rip their marketing.">
      <Section title="What they are for">{page.they.map((p) => (<p key={p}>{p}</p>))}</Section>
      <Section title="What FreeIEP is for">{page.we.map((p) => (<p key={p}>{p}</p>))}</Section>
      <Section title="What we will not claim">{page.willNot.map((p) => (<p key={p}>{p}</p>))}</Section>
      <p className="mt-10 text-[14px] text-ink-soft">Not affiliated with {page.name}.</p>
      <CtaBand />
    </DocPage>
  );
}
