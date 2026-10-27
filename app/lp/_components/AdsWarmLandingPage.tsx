import { CaseStudyCard } from '@/components/CarouselResultados';
import { CASE_FEATURE_CARD_SIZES } from '@/lib/blog-image-sizes';
import CimaBreaker from '@/components/premios-cima/CimaBreaker';
import TwoColumnCtaSection from '@/components/ui/TwoColumnCtaSection';
import ServiceFaqAccordion from '@/app/agencia-shopify/ServiceFaqAccordion';
import { SERVICE_BOOKING_HREF } from '@/utils/booking-attribution';
import { getAllCaseStudies } from '@/services/wordpress';
import { toAdsLandingCaseCards } from '../_lib/ads-landing-cases';
import { PlaceholderBlock, PlaceholderFaqAnswer, placeholderLabel, type ContentPlaceholder } from '../_lib/placeholders';

const STEP_CARD_COLORS = ['bg-[#E9D7FF]', 'bg-[#FFEFD1]', 'bg-[#E4FFF9]'] as const;

export type AdsWarmLandingCopy = {
  hero: {
    h1: ContentPlaceholder;
    subtitle: ContentPlaceholder;
    ctaSecondary: ContentPlaceholder;
  };
  problem: {
    h2: ContentPlaceholder;
    body: ContentPlaceholder;
  };
  steps: {
    h2: ContentPlaceholder;
    items: [ContentPlaceholder, ContentPlaceholder, ContentPlaceholder];
  };
  proof: {
    h2: ContentPlaceholder;
  };
  afterCall: {
    h2: ContentPlaceholder;
    items: ContentPlaceholder[];
  };
  faq: {
    h2: ContentPlaceholder;
    items: { question: ContentPlaceholder; answer: ContentPlaceholder }[];
  };
  finalCta: {
    h2: ContentPlaceholder;
    body: ContentPlaceholder;
    button: ContentPlaceholder;
  };
};

function ScrollCta({ block }: { block: ContentPlaceholder }) {
  return (
    <a
      href="#dolor"
      className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-[#440099] px-8 py-3 font-semibold text-[#440099] hover:bg-[#440099]/5 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#440099]"
    >
      {placeholderLabel(block.tag)}
    </a>
  );
}

export default async function AdsWarmLandingPage({ copy }: { copy: AdsWarmLandingCopy }) {
  const casosDeExito = await getAllCaseStudies().catch(() => []);
  const caseCards = toAdsLandingCaseCards(casosDeExito);

  return (
    <article className="w-full pb-20" data-ads-warm-landing>
      <section data-cta-section="hero" className="relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6 pt-4 pb-16 md:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <PlaceholderBlock block={copy.hero.h1} as="h1" className="playful-h1 text-[36px] leading-[42px] md:text-[45px] md:leading-[52px] lg:text-[56px] lg:leading-[1.1]" />
              <PlaceholderBlock block={copy.hero.subtitle} />
              <div className="space-y-4">
                <ScrollCta block={copy.hero.ctaSecondary} />
                <p className="text-sm text-[#6B6570] italic" data-content-note>
                  Nota para Contenido: {copy.hero.ctaSecondary.note}
                </p>
              </div>
            </div>
            <div
              aria-hidden="true"
              className="relative w-full min-h-[280px] md:min-h-[360px] overflow-hidden rounded-[32px] border border-dashed border-[#C4B5D4] bg-[#FEF7FF]/80 flex items-center justify-center text-center px-6 text-sm text-[#6B6570]"
            >
              Ilustración hero — pendiente de arte (reutilizar slot de agencia-shopify cuando Contenido lo defina).
            </div>
          </div>
        </div>
      </section>

      <section id="dolor" className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12 scroll-mt-8">
        <div className="playful-contenedor playful-contenedor-FFEFD1 rounded-[32px] md:rounded-[48px] space-y-6">
          <PlaceholderBlock block={copy.problem.h2} as="h2" className="playful-h2 text-center" />
          <PlaceholderBlock block={copy.problem.body} />
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
        <PlaceholderBlock block={copy.steps.h2} as="h2" className="playful-h2 text-center mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {copy.steps.items.map((item, index) => (
            <article
              key={item.tag}
              className={`${STEP_CARD_COLORS[index % STEP_CARD_COLORS.length]} rounded-[32px] shadow-lg p-8 md:p-10 flex flex-col gap-4`}
            >
              <span className="text-[#440099] font-bold text-lg">Paso {index + 1}</span>
              <PlaceholderBlock block={item} as="h3" className="playful-h3 mb-0" />
            </article>
          ))}
        </div>
      </section>

      <CimaBreaker variant="shopify" />

      <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
        <PlaceholderBlock block={copy.proof.h2} as="h2" className="playful-h2 text-center mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {caseCards.map((caseStudy) => (
            <CaseStudyCard key={caseStudy.slug} caseStudy={caseStudy} sizes={CASE_FEATURE_CARD_SIZES} />
          ))}
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="playful-contenedor playful-contenedor-B3FFF3 rounded-[32px] md:rounded-[48px] !mt-0 space-y-8">
          <PlaceholderBlock block={copy.afterCall.h2} as="h2" className="playful-h2 text-center" />
          <ul className="space-y-6 max-w-3xl mx-auto list-none">
            {copy.afterCall.items.map((item) => (
              <li key={item.tag}>
                <PlaceholderBlock block={item} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
        <PlaceholderBlock block={copy.faq.h2} as="h2" className="playful-h2 text-center mb-10" />
        <div className="max-w-4xl mx-auto">
          <ServiceFaqAccordion
            items={copy.faq.items.map((item) => ({
              question: placeholderLabel(item.question.tag),
              answer: <PlaceholderFaqAnswer block={item.answer} />,
            }))}
          />
        </div>
      </section>

      <section className="py-12" data-cta-section="final">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <TwoColumnCtaSection
            contentBgColor="#B3FFF3"
            imageUrl="/images/imagen-nueva-cta-home.png"
            title={placeholderLabel(copy.finalCta.h2.tag)}
            subtitle={placeholderLabel(copy.finalCta.body.tag)}
            ctaTitle={placeholderLabel(copy.finalCta.h2.tag)}
            buttonText={placeholderLabel(copy.finalCta.button.tag)}
            buttonLink={SERVICE_BOOKING_HREF}
          />
          <div className="mt-4 space-y-2 max-w-2xl mx-auto text-center">
            <p className="text-sm text-[#6B6570] italic" data-content-note>
              Nota para Contenido (titular CTA): {copy.finalCta.h2.note}
            </p>
            <p className="text-sm text-[#6B6570] italic" data-content-note>
              Nota para Contenido (cuerpo CTA): {copy.finalCta.body.note}
            </p>
            <p className="text-sm text-[#6B6570] italic" data-content-note>
              Nota para Contenido (botón): {copy.finalCta.button.note}
            </p>
          </div>
        </div>
      </section>
    </article>
  );
}
