import type { Metadata } from 'next';
import { Suspense } from 'react';
import { canonicalForPath } from '@/utils/canonical';
import {
  AVISOS_ESHOW_PATH,
  AVISOS_ESHOW_PLACEHOLDER_INTRO,
  AVISOS_ESHOW_PLACEHOLDER_TITLE,
} from '@/lib/avisos-eshow';
import AvisosEshowGhlForm from '@/components/AvisosEshowGhlForm';

const PAGE_URL = canonicalForPath(AVISOS_ESHOW_PATH);

export const metadata: Metadata = {
  title: AVISOS_ESHOW_PLACEHOLDER_TITLE,
  description: AVISOS_ESHOW_PLACEHOLDER_INTRO,
  robots: { index: false, follow: false },
  alternates: { canonical: PAGE_URL },
};

export default function AvisosEshowPage() {
  return (
    <div className="min-h-screen relative overflow-hidden" data-landing="avisos-eshow">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-3 h-3 bg-pink-400 rounded-full opacity-60" />
        <div className="absolute top-20 right-20 w-4 h-4 bg-yellow-400 rounded-full opacity-60" />
        <div className="absolute bottom-40 left-20 w-4 h-4 bg-pink-300 rounded-full opacity-60" />
      </div>
      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-12 md:py-20 relative z-10">
        <header className="max-w-3xl mb-10 md:mb-14">
          <h1
            className="playful-h2 mb-6"
            style={{ color: '#440099' }}
          >
            {AVISOS_ESHOW_PLACEHOLDER_TITLE}
          </h1>
          <p className="playful-contenido-p text-[#453A53]">
            {AVISOS_ESHOW_PLACEHOLDER_INTRO}
          </p>
        </header>
        <section aria-label="Formulario" className="max-w-2xl">
          <Suspense fallback={<div className="min-h-[480px] rounded-[32px] bg-[#E9D7FF]" aria-hidden="true" />}>
            <AvisosEshowGhlForm />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
