import type { Metadata } from 'next';
import AgencyCopyLanding from '@/components/AgencyCopyLanding';
import { canonicalForPath } from '@/utils/canonical';
import { twitterFromOpenGraph } from '@/utils/page-seo-overrides.mjs';
import {
  SITE_OG_IMAGE,
  buildAgencyLandingJsonLd,
} from '@/lib/agency-copy-landing';
import { PRESTASHOP_COPY, PRESTASHOP_META } from './copy';

const PAGE_URL = canonicalForPath(PRESTASHOP_META.path);

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
        url: SITE_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'Playful Agency',
      },
    ],
  },
  twitter: twitterFromOpenGraph(
    PRESTASHOP_META.title,
    PRESTASHOP_META.description,
    SITE_OG_IMAGE,
  ),
};

export default function AgenciaPrestashopPage() {
  return (
    <AgencyCopyLanding
      copy={PRESTASHOP_COPY}
      jsonLd={buildAgencyLandingJsonLd(PRESTASHOP_COPY, PAGE_URL)}
    />
  );
}
