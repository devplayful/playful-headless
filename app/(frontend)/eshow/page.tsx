import type { Metadata } from 'next';
import { canonicalForPath } from '@/utils/canonical';
import { pageSocialMetadata } from '@/utils/page-seo-overrides.mjs';
import {
  ESHOW_LANDING_H1,
  ESHOW_LANDING_META_DESCRIPTION,
  ESHOW_LANDING_TITLE,
} from '@/lib/eshow-landing-copy';
import EshowLandingForm, {
  EshowLandingArticleLink,
  EshowLandingHeroImage,
  EshowLandingIntro,
} from './EshowLandingForm';

const PAGE_URL = canonicalForPath('/eshow');

export const metadata: Metadata = {
  title: ESHOW_LANDING_TITLE,
  description: ESHOW_LANDING_META_DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  robots: { index: false, follow: true },
  ...pageSocialMetadata({
    title: ESHOW_LANDING_TITLE,
    description: ESHOW_LANDING_META_DESCRIPTION,
    url: PAGE_URL,
    type: 'website',
  }),
};

export default function EshowLandingPage() {
  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[url('/images/background.webp')] bg-cover bg-center opacity-30"
      />
      <div className="relative z-10 mx-auto max-w-[1200px] px-4 py-10 md:px-6 md:py-16">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="space-y-8">
            <h1
              className="text-[#440099]"
              style={{
                fontFamily: 'var(--font-paytone-one)',
                fontSize: 'clamp(2rem, 5vw, 3.25rem)',
                lineHeight: 1.08,
              }}
            >
              {ESHOW_LANDING_H1}
            </h1>
            <EshowLandingIntro />
            <EshowLandingArticleLink />
            <EshowLandingForm />
          </div>
          <div className="lg:sticky lg:top-24">
            <EshowLandingHeroImage />
          </div>
        </div>
      </div>
    </div>
  );
}
