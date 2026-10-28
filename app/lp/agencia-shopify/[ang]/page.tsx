import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LP_META_SHOPIFY_META } from '../copy';
import { HERO_CRITICAL_STYLE } from '../hero-critical-style';
import Landing from '../Landing';
import { HeroLcpPreload } from '../HeroLcp';
import { isLpMetaStaticAngle, LP_META_STATIC_ANGLES } from '../variants';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return LP_META_STATIC_ANGLES.map((ang) => ({ ang }));
}

export const metadata: Metadata = {
  title: LP_META_SHOPIFY_META.title,
  description: LP_META_SHOPIFY_META.description,
  robots: { index: false, follow: false },
  alternates: { canonical: LP_META_SHOPIFY_META.path },
};

export default async function LpAgenciaShopifyAnglePage({
  params,
}: {
  params: Promise<{ ang: string }>;
}) {
  const { ang: raw } = await params;
  const ang = (raw || '').trim().toLowerCase();
  if (!isLpMetaStaticAngle(ang)) notFound();

  return (
    <>
      <HeroLcpPreload />
      <style>{HERO_CRITICAL_STYLE}</style>
      <Landing ang={ang} />
    </>
  );
}
