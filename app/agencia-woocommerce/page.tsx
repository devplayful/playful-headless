import type { Metadata } from 'next';
import AgencyCopyLanding from '@/components/AgencyCopyLanding';
import { canonicalForPath } from '@/utils/canonical';
import { twitterFromOpenGraph } from '@/utils/page-seo-overrides.mjs';
import {
  SITE_OG_IMAGE,
  buildAgencyLandingJsonLd,
} from '@/lib/agency-copy-landing';
import { WOOCOMMERCE_COPY, WOOCOMMERCE_META } from './copy';

const PAGE_URL = canonicalForPath(WOOCOMMERCE_META.path);

export const metadata: Metadata = {
  title: WOOCOMMERCE_META.title,
  description: WOOCOMMERCE_META.description,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: WOOCOMMERCE_META.title,
    description: WOOCOMMERCE_META.description,
    url: PAGE_URL,
    images: [
      {
        url: SITE_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'Playful Agency',
      },
    ],
  },
  twitter: twitterFromOpenGraph(
    WOOCOMMERCE_META.title,
    WOOCOMMERCE_META.description,
    SITE_OG_IMAGE,
  ),
};

export default function AgenciaWoocommercePage() {
  return (
    <AgencyCopyLanding
      copy={WOOCOMMERCE_COPY}
      jsonLd={buildAgencyLandingJsonLd(WOOCOMMERCE_COPY, PAGE_URL)}
    />
  );
}
