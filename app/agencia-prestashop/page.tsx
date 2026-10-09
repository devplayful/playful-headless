import type { Metadata } from 'next';
import AgencyCopyLanding from '@/components/AgencyCopyLanding';
import { canonicalForPath } from '@/utils/canonical';
import { twitterFromOpenGraph } from '@/utils/page-seo-overrides.mjs';
import { buildAgencyLandingJsonLd } from '@/lib/agency-copy-landing';
import { PRESTASHOP_COPY, PRESTASHOP_META } from './copy';

const PAGE_URL = canonicalForPath(PRESTASHOP_META.path);
const HERO_IMAGE = '/images/heros/agencia-prestashop-hero.webp';
const PAGE_OG_IMAGE = '/images/heros/agencia-prestashop-og.jpg';
const HERO_ALT = 'Ilustración de una persona y una figura con forma de P paseando de la mano';

export const metadata: Metadata = {
  title: PRESTASHOP_META.title,
  description: PRESTASHOP_META.description,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: PRESTASHOP_META.title,
    description: PRESTASHOP_META.description,
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
    PRESTASHOP_META.title,
    PRESTASHOP_META.description,
    PAGE_OG_IMAGE,
  ),
};

export default function AgenciaPrestashopPage() {
  return (
    <AgencyCopyLanding
      copy={PRESTASHOP_COPY}
      jsonLd={buildAgencyLandingJsonLd(PRESTASHOP_COPY, PAGE_URL)}
      heroImage={{ src: HERO_IMAGE, alt: HERO_ALT }}
    />
  );
}
