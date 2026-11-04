import type { Metadata } from 'next';
import { canonicalForPath } from '@/utils/canonical';
import { pageSocialMetadata } from '@/utils/page-seo-overrides.mjs';

const JOSE_URL = canonicalForPath('/jose');
const JOSE_TITLE = 'Contacto · José · Playful Agency';
const JOSE_DESCRIPTION =
  'Datos de contacto de José en Playful Agency: teléfono, email y web.';

const social = pageSocialMetadata({
  title: JOSE_TITLE,
  description: JOSE_DESCRIPTION,
  url: JOSE_URL,
  type: 'website',
});

export const metadata: Metadata = {
  title: JOSE_TITLE,
  description: JOSE_DESCRIPTION,
  alternates: { canonical: JOSE_URL },
  robots: { index: false, follow: false },
  openGraph: social.openGraph,
  twitter: social.twitter,
};

export default function JoseContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
