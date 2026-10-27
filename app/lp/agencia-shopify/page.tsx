import type { Metadata } from 'next';
import { LP_META_SHOPIFY_META } from './copy';
import Landing from './Landing';

export const metadata: Metadata = {
  title: LP_META_SHOPIFY_META.title,
  description: LP_META_SHOPIFY_META.description,
  robots: { index: false, follow: false },
  alternates: { canonical: LP_META_SHOPIFY_META.path },
};

export default function LpAgenciaShopifyPage() {
  return (
    <>
      <style>{`[data-lp-meta-shopify] h1{font-family:system-ui,-apple-system,"Segoe UI",sans-serif!important}`}</style>
      <Landing />
    </>
  );
}
