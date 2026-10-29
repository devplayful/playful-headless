import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { isPayloadServicioSlug } from '@/lib/cms-servicios-flag';
import { buildServicioMetadata, findServicioBySlug } from '@/lib/cms-servicios';
import ServicioPayloadRenderer from '@/components/servicios/ServicioPayloadRenderer';

export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isPayloadServicioSlug(slug)) {
    notFound();
  }
  const fromPayload = await buildServicioMetadata(slug, { renderFromPayload: true });
  if (fromPayload) return fromPayload;
  notFound();
}

export default async function PreviewCmsServicioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isPayloadServicioSlug(slug)) {
    notFound();
  }
  const servicio = await findServicioBySlug(slug, { renderFromPayload: true });
  if (!servicio) {
    notFound();
  }
  return <ServicioPayloadRenderer doc={servicio} slug={slug} />;
}
