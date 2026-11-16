import type { Metadata } from 'next';
import AgencyCopyLanding from '@/components/AgencyCopyLanding';
import { canonicalForPath } from '@/utils/canonical';
import { twitterFromOpenGraph } from '@/utils/page-seo-overrides.mjs';
import {
  SITE_OG_IMAGE,
  buildAgencyLandingJsonLd,
} from '@/lib/agency-copy-landing';
import { PASARELA_COPY, PASARELA_META } from './copy';

const PAGE_URL = canonicalForPath(PASARELA_META.path);

export const metadata: Metadata = {
  title: PASARELA_META.title,
  description: PASARELA_META.description,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: PASARELA_META.title,
    description: PASARELA_META.description,
    url: PAGE_URL,
    images: [
      {
        url: '/images/og/pasarela-de-pagos-venezuela.jpg',
        width: 1200,
        height: 630,
        alt: 'Pasarela de pagos Venezuela | Playful',
      },
    ],
  },
  twitter: twitterFromOpenGraph(
    PASARELA_META.title,
    PASARELA_META.description,
    '/images/og/pasarela-de-pagos-venezuela.jpg',
  ),
};

export default function PasarelaDePagosVenezuelaPage() {
  return (
    <AgencyCopyLanding
      copy={PASARELA_COPY}
      jsonLd={buildAgencyLandingJsonLd(PASARELA_COPY, PAGE_URL)}
    />
  );
}
