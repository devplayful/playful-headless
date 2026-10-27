import type { Metadata } from 'next';
import AdsMetaShopifyLanding from '../_components/AdsMetaShopifyLanding';
import { LP_META_SHOPIFY_META } from './copy';

export const metadata: Metadata = {
  title: LP_META_SHOPIFY_META.title,
  description: LP_META_SHOPIFY_META.description,
  robots: { index: false, follow: false },
  alternates: { canonical: LP_META_SHOPIFY_META.path },
};

export default function LpAgenciaShopifyPage() {
  return <AdsMetaShopifyLanding />;
}
