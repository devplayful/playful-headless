import type { Metadata } from 'next';
import { canonicalForPath } from '@/utils/canonical';
import {
  ESHOW_LANDING_THANKS,
} from '@/lib/eshow-landing-copy';
import { EshowLandingArticleLink } from '../EshowLandingForm';

const PAGE_URL = canonicalForPath('/eshow/gracias');

export const metadata: Metadata = {
  title: ESHOW_LANDING_THANKS.heading,
  robots: { index: false, follow: true },
  alternates: { canonical: PAGE_URL },
};

export default function EshowGraciasPage() {
  return (
    <div className="relative min-h-[60vh] overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[url('/images/background.webp')] bg-cover bg-center opacity-30"
      />
      <div className="relative z-10 mx-auto max-w-2xl px-4 py-16 md:py-24">
        <div
          className="rounded-2xl border border-[#D8C8F0] bg-[#F7F2FF] p-8 md:p-10"
          role="status"
        >
          <h1 className="mb-4 text-2xl font-bold text-[#2A0064] md:text-3xl">
            {ESHOW_LANDING_THANKS.heading}
          </h1>
          <p className="mb-6 leading-relaxed text-gray-800">
            {ESHOW_LANDING_THANKS.body}
          </p>
          <EshowLandingArticleLink />
        </div>
      </div>
    </div>
  );
}
