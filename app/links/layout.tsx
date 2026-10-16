import type { Metadata } from 'next';
import { canonicalForPath } from '@/utils/canonical';
import { pageSocialMetadata } from '@/utils/page-seo-overrides.mjs';

const LINKS_URL = canonicalForPath('/links');
const LINKS_TITLE = 'Enlaces | Playful Agency';
const LINKS_DESCRIPTION =
  'Enlaces de Playful Agency: Zelle en tu tienda, casos de éxito, agencia e-commerce, Shopify y contacto.';

const social = pageSocialMetadata({
  title: LINKS_TITLE,
  description: LINKS_DESCRIPTION,
  url: LINKS_URL,
  type: 'website',
});

export const metadata: Metadata = {
  title: LINKS_TITLE,
  description: LINKS_DESCRIPTION,
  alternates: { canonical: LINKS_URL },
  robots: { index: false, follow: false },
  openGraph: social.openGraph,
  twitter: social.twitter,
};

export default function LinksBioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
