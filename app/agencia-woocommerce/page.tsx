import type { Metadata } from 'next';
import AgencyCopyLanding from '@/components/AgencyCopyLanding';
import { canonicalForPath } from '@/utils/canonical';
import { twitterFromOpenGraph } from '@/utils/page-seo-overrides.mjs';
import { buildAgencyLandingJsonLd } from '@/lib/agency-copy-landing';
import { WOOCOMMERCE_COPY, WOOCOMMERCE_META } from './copy';

const PAGE_URL = canonicalForPath(WOOCOMMERCE_META.path);
const HERO_IMAGE = '/images/heros/agencia-woocommerce-hero.webp';
const PAGE_OG_IMAGE = '/images/heros/agencia-woocommerce-og.jpg';
const HERO_ALT =
  'Ilustración de un aficionado celebrando en un estadio con una camiseta que dice wooo';

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
        url: PAGE_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: HERO_ALT,
      },
    ],
  },
  twitter: twitterFromOpenGraph(
    WOOCOMMERCE_META.title,
    WOOCOMMERCE_META.description,
    PAGE_OG_IMAGE,
  ),
};

export default function AgenciaWoocommercePage() {
  return (
    <AgencyCopyLanding
      copy={WOOCOMMERCE_COPY}
      jsonLd={buildAgencyLandingJsonLd(WOOCOMMERCE_COPY, PAGE_URL)}
      heroImage={{ src: HERO_IMAGE, alt: HERO_ALT }}
    />
  );
}
