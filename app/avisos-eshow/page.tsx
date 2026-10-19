import type { Metadata } from 'next';
import HighLevelFormEmbed from '@/components/HighLevelFormEmbed';
import {
  AVISOS_ESHOW_BENEFITS,
  AVISOS_ESHOW_FORM,
  AVISOS_ESHOW_GHL_FORM_ID,
  AVISOS_ESHOW_HERO,
  AVISOS_ESHOW_META,
  AVISOS_ESHOW_PATH,
} from '@/content/avisos-eshow';
import { canonicalForPath } from '@/utils/canonical';
import { pageSocialMetadata } from '@/utils/page-seo-overrides.mjs';

const PAGE_URL = canonicalForPath(AVISOS_ESHOW_PATH);
const BENEFIT_CARD_COLORS = [
  'bg-[#E9D7FF]',
  'bg-[#FFEFD1]',
  'bg-[#E4FFF9]',
] as const;

export const metadata: Metadata = {
  title: AVISOS_ESHOW_META.title,
  description: AVISOS_ESHOW_META.description,
  alternates: { canonical: PAGE_URL },
  ...pageSocialMetadata({
    title: AVISOS_ESHOW_META.title,
    description: AVISOS_ESHOW_META.description,
    url: PAGE_URL,
    type: 'website',
  }),
};

export default function AvisosEshowPage() {
  return (
    <article data-page="avisos-eshow" className="w-full pb-20">
      <section data-cta-section="hero" className="relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 pt-4 pb-16 md:pb-20">
          <div className="max-w-3xl space-y-8">
            <h1 className="playful-h1 text-[36px] leading-[42px] md:text-[45px] md:leading-[52px] lg:text-[56px] lg:leading-[1.1]">
              {AVISOS_ESHOW_HERO.h1}
            </h1>
            <p className="playful-contenido-p">{AVISOS_ESHOW_HERO.intro}</p>
          </div>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="playful-contenedor playful-contenedor-FFEFD1 rounded-[32px] md:rounded-[48px]">
          <h2 className="playful-h2 text-center">{AVISOS_ESHOW_BENEFITS.h2}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-4">
            {AVISOS_ESHOW_BENEFITS.items.map((item, index) => (
              <article
                key={item.title}
                className={`${BENEFIT_CARD_COLORS[index % BENEFIT_CARD_COLORS.length]} rounded-[32px] shadow-lg p-8 md:p-10 flex flex-col`}
              >
                <h3 className="playful-h3 mb-4">{item.title}</h3>
                <p className="playful-contenido-p flex-1">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="formulario"
        data-cta-section="form"
        className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12"
      >
        <h2 className="playful-h2 text-center mb-8">{AVISOS_ESHOW_FORM.h2}</h2>
        <HighLevelFormEmbed
          formId={AVISOS_ESHOW_GHL_FORM_ID}
          title={AVISOS_ESHOW_FORM.embedTitle}
        />
      </section>
    </article>
  );
}
