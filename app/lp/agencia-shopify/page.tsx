import type { Metadata } from 'next';
import { LP_META_SHOPIFY_META } from './copy';
import Landing from './Landing';
import {
  firstSearchParam,
  parseLpMetaAngle,
  parseLpMetaMarket,
  searchStringFromParams,
} from './variants';

export const metadata: Metadata = {
  title: LP_META_SHOPIFY_META.title,
  description: LP_META_SHOPIFY_META.description,
  robots: { index: false, follow: false },
  alternates: { canonical: LP_META_SHOPIFY_META.path },
};

export default async function LpAgenciaShopifyPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = (await searchParams) || {};
  const search = searchStringFromParams(raw);
  const mkt = parseLpMetaMarket(firstSearchParam(raw.mkt));
  const ang = parseLpMetaAngle(firstSearchParam(raw.ang), firstSearchParam(raw.utm_content));

  return (
    <>
      <style>{`[data-lp-meta-shopify] h1{font-family:system-ui,-apple-system,"Segoe UI",sans-serif!important}`}</style>
      <Landing mkt={mkt} ang={ang} search={search} />
    </>
  );
}
