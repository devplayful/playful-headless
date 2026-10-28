import type { Metadata } from 'next';
import { LP_META_SHOPIFY_META } from './copy';
import { HERO_CRITICAL_STYLE } from './hero-critical-style';
import Landing from './Landing';
import { DEFAULT_LP_META_ANGLE } from './variants';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: LP_META_SHOPIFY_META.title,
  description: LP_META_SHOPIFY_META.description,
  robots: { index: false, follow: false },
  alternates: { canonical: LP_META_SHOPIFY_META.path },
};

/** Base variant: same generic H1 as f59d442 when ang is missing. */
export default function LpAgenciaShopifyPage() {
  return (
    <>
      <style>{HERO_CRITICAL_STYLE}</style>
      <Landing ang={DEFAULT_LP_META_ANGLE} />
    </>
  );
}
