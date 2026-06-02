import { notFound } from 'next/navigation';
import { LabLayout } from '@/components/LabLayout';
import { getLab, labs } from '@/labs/registry';

export function generateStaticParams() {
  return labs.map((l) => ({ slug: l.meta.slug }));
}

export default async function LabPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lab = getLab(slug);
  if (!lab) notFound();

  const { Component, meta } = lab;
  return (
    <LabLayout meta={meta}>
      <Component />
    </LabLayout>
  );
}
