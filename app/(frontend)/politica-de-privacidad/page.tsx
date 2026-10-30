import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { canonicalForPath } from '@/utils/canonical';
import { twitterFromOpenGraph } from '@/utils/page-seo-overrides.mjs';
import { ogJpegForPath, ogJpegMeta } from '@/lib/og-images';
import PoliticaPrivacidadView from '@/components/paginas-codigo/PoliticaPrivacidadView';
import {
  POLITICA_PRIVACIDAD_SEO,
  POLITICA_PRIVACIDAD_SLUG,
  paginasB1SeedBodyForSlug,
} from '@/cms/data/paginas-b1-payload';
import { isCmsPaginasB1FromPayload } from '@/lib/cms-paginas-b1-flag';
import {
  findPaginaCodigoBySlug,
  paginaCodigoContentMatchesSeed,
} from '@/lib/cms-paginas-b1';

const PRIVACY_TITLE = POLITICA_PRIVACIDAD_SEO.title;
const PRIVACY_DESCRIPTION = POLITICA_PRIVACIDAD_SEO.description;
const PRIVACY_URL = canonicalForPath('/politica-de-privacidad');
const PRIVACY_OG = ogJpegForPath('/politica-de-privacidad') || '/images/og/home.jpg';

export const metadata: Metadata = {
  title: PRIVACY_TITLE,
  description: PRIVACY_DESCRIPTION,
  alternates: { canonical: PRIVACY_URL },
  openGraph: {
    title: PRIVACY_TITLE,
    description: PRIVACY_DESCRIPTION,
    url: PRIVACY_URL,
    images: [ogJpegMeta(PRIVACY_OG, PRIVACY_TITLE)],
  },
  twitter: {
    ...twitterFromOpenGraph(PRIVACY_TITLE, PRIVACY_DESCRIPTION),
    images: [PRIVACY_OG],
  },
};

export default async function PoliticaDePrivacidadPage() {
  if (isCmsPaginasB1FromPayload()) {
    const expected = paginasB1SeedBodyForSlug(POLITICA_PRIVACIDAD_SLUG);
    const doc = await findPaginaCodigoBySlug(POLITICA_PRIVACIDAD_SLUG, {
      renderFromPayload: true,
    });
    if (!doc || !paginaCodigoContentMatchesSeed(doc, expected.content)) {
      notFound();
    }
  }

  return <PoliticaPrivacidadView />;
}
