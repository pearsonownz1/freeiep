import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocPage, Section, BulletList, CtaBand, Related } from "@/components/marketing/shell";
import { useBySlug, uses } from "@/data/uses";

export function generateStaticParams() {
  return uses.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = useBySlug(slug);
  if (!page) return { title: "Uses · FreeIEP" };
  return { title: `${page.title} · FreeIEP`, description: `${page.oneLine} FreeIEP is not the official IEP.` };
}

export default async function UsePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = useBySlug(slug);
  if (!page) notFound();
  return (
    <DocPage title={page.title} lede={`${page.oneLine} FreeIEP is not the official IEP.`}>
      <Section title="What you do"><BulletList items={[...page.doItems]} /></Section>
      <Section title="What you do not get"><BulletList items={[...page.dontItems]} /></Section>
      <CtaBand />
      <Related links={page.related} />
    </DocPage>
  );
}
