import type { Metadata } from 'next';
import { LP_META_SHOPIFY_META } from './copy';
import Landing from './Landing';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: LP_META_SHOPIFY_META.title,
  description: LP_META_SHOPIFY_META.description,
  robots: { index: false, follow: false },
  alternates: { canonical: LP_META_SHOPIFY_META.path },
};

/** Static HTML. Hero H1 is always the generic title from the first paint. */
export default function LpAgenciaShopifyPage() {
  return (
    <>
      <style>
        {`[data-lp-meta-shopify] h1{font-family:system-ui,-apple-system,"Segoe UI",sans-serif!important;opacity:1!important;visibility:visible!important}[data-illustration-slot=ads-hero] img{display:block!important;width:100%!important;height:352px!important;object-fit:cover!important;opacity:1!important;visibility:visible!important}`}
      </style>
      <Landing />
    </>
  );
}
