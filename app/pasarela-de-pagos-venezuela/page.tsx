import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { canonicalForPath } from '@/utils/canonical';
import { CaseStudyCard } from '@/components/CarouselResultados';
import TestimonialsSection from '@/components/TestimonialsSectionClient';
import BlogRelatedPostsSection from '@/components/sections/BlogRelatedPostsSection';
import TwoColumnCtaSection from '@/components/ui/TwoColumnCtaSection';
import { getAllCaseStudies, getLatestBlogPosts } from '@/services/wordpress';
import ServiceFaqAccordion from '@/app/agencia-shopify/ServiceFaqAccordion';
import { toShopifyCaseCards } from '@/app/agencia-shopify/shopify-cases';
import {
  BENEFITS,
  BOOKING_HREF,
  CONTACT_HREF,
  CTA,
  FAQ,
  HERO,
  INTRO_BAND,
  PAGE_META,
  PAIN_POINTS,
  PLAYFUL_URL_RE,
  SOCIAL_PROOF,
  buildFaqPageJsonLd,
} from './copy';

const PAGE_URL = canonicalForPath(PAGE_META.path);

const HERO_ART = '/images/pasarela-de-pagos-venezuela/hero-payful-agencia.svg';
const BENEFIT_ART: Record<string, string> = {
  'beneficio-integracion': '/images/pasarela-de-pagos-venezuela/beneficio-integracion.svg',
  'beneficio-seguridad': '/images/pasarela-de-pagos-venezuela/beneficio-seguridad.svg',
  'beneficio-experiencia': '/images/pasarela-de-pagos-venezuela/beneficio-experiencia.svg',
};

const BENEFIT_CARD_COLORS = ['bg-[#E9D7FF]', 'bg-[#FFEFD1]', 'bg-[#E4FFF9]'] as const;

export const metadata: Metadata = {
  title: PAGE_META.title,
  description: PAGE_META.description,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: PAGE_META.title,
    description: PAGE_META.description,
    url: PAGE_URL,
  },
};

function LinkedCopy({ text }: { text: string }) {
  const parts = text.split(PLAYFUL_URL_RE);
  return (
    <>
      {parts.map((part, index) => {
        if (!part.startsWith('https://playfulagency.com/')) {
          return <span key={`${part}-${index}`}>{part}</span>;
        }
        const href = part.replace('https://playfulagency.com', '') || '/';
        return (
          <Link
            key={part}
            href={href}
            className="text-[#440099] font-semibold underline underline-offset-2 break-all"
          >
            {part}
          </Link>
        );
      })}
    </>
  );
}

function TalkCta({ label = HERO.cta }: { label?: string }) {
  return (
    <a href={BOOKING_HREF} className="playful-boton !text-[14px] !leading-[18px] md:!text-base md:!leading-normal">
      {label}
    </a>
  );
}

function PurpleBand({ title, body }: { title: string; body: string }) {
  return (
    <div className="relative overflow-hidden rounded-[32px] bg-[#440099] p-8 md:p-[60px]">
      <div className="pointer-events-none absolute inset-0 bg-[url('/images/background.webp')] bg-cover bg-center bg-no-repeat opacity-40" />
      <div className="relative z-10 max-w-4xl mx-auto text-center md:text-left">
        <h2 className="mb-6 [font-family:var(--font-paytone-one),var(--font-montserrat),sans-serif] text-[36px] leading-[1.1] md:text-[45px] font-normal !text-white">
          {title}
        </h2>
        <p className="[font-family:var(--font-dm-sans),sans-serif] text-base leading-normal font-normal !text-[#E9D7FF]">
          {body}
        </p>
      </div>
    </div>
  );
}

function BenefitIllustration({ slot }: { slot: string }) {
  const src = BENEFIT_ART[slot];
  return (
    <div
      data-illustration-slot={slot}
      className="relative w-full max-w-[200px] h-[180px] mx-auto overflow-hidden rounded-2xl flex items-center justify-center"
    >
      <img src={src} alt="" width={200} height={180} decoding="async" className="max-h-full w-auto object-contain" />
    </div>
  );
}

export default async function PasarelaDePagosVenezuelaPage() {
  const faqJsonLd = buildFaqPageJsonLd();
  const [casosDeExito, blogPosts] = await Promise.all([
    getAllCaseStudies().catch(() => []),
    getLatestBlogPosts(6).catch(() => []),
  ]);
  const caseCards = toShopifyCaseCards(casosDeExito);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <article className="w-full pb-20">
        <section className="relative overflow-hidden">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 pt-4 pb-16 md:pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <p className="playful-contenido-p font-semibold uppercase tracking-wide text-[#440099]">
                  {HERO.eyebrow}
                </p>
                <h1 className="playful-h1 text-[36px] leading-[42px] md:text-[45px] md:leading-[52px] lg:text-[56px] lg:leading-[1.1]">
                  {HERO.h1}
                </h1>
                <p className="playful-contenido-p">{HERO.body}</p>
                <div className="space-y-3">
                  <TalkCta label={HERO.button} />
                  <p className="playful-contenido-p">{HERO.subline}</p>
                  <p className="playful-contenido-p">
                    <Link
                      href={CONTACT_HREF}
                      className="text-[#440099] font-semibold underline underline-offset-2"
                    >
                      O escríbenos por el formulario
                    </Link>
                  </p>
                </div>
              </div>
              <div
                data-illustration-slot="hero"
                className="relative w-full min-h-[280px] md:min-h-[360px] overflow-hidden rounded-[32px] flex items-center justify-center bg-[#FFEFD1]"
              >
                <img
                  src={HERO_ART}
                  alt=""
                  width={437}
                  height={417}
                  decoding="async"
                  fetchPriority="high"
                  className="max-h-[360px] w-auto object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
          <PurpleBand title={INTRO_BAND.h2} body={INTRO_BAND.body} />
        </section>

        <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="playful-contenedor playful-contenedor-FFEFD1 rounded-[32px] md:rounded-[48px]">
            <h2 className="playful-h2 text-center">{BENEFITS.h2}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-4">
              {BENEFITS.items.map((item, index) => (
                <article
                  key={item.title}
                  className={`${BENEFIT_CARD_COLORS[index]} rounded-[32px] shadow-lg p-8 md:p-10 flex flex-col text-center`}
                >
                  <div className="mb-6">
                    <BenefitIllustration slot={item.slot} />
                  </div>
                  <h3 className="playful-h3 mb-4">{item.title}</h3>
                  <p className="playful-contenido-p flex-1">{item.body}</p>
                  <a
                    href={BOOKING_HREF}
                    className="mt-6 inline-block text-[#440099] font-semibold underline underline-offset-2"
                  >
                    {item.cta}
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="playful-contenedor playful-contenedor-B3FFF3 rounded-[32px] md:rounded-[48px] !mt-0">
            <h2 className="playful-h2 text-center">{PAIN_POINTS.h2}</h2>
            <p className="playful-contenido-p max-w-3xl mx-auto text-center mb-10">{PAIN_POINTS.intro}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {PAIN_POINTS.items.map((item) => (
                <article key={item.quote} className="rounded-[32px] bg-white shadow-lg p-8 md:p-10">
                  <p className="playful-contenido-p mb-4">
                    <strong>{item.quote}</strong>
                  </p>
                  <p className="playful-contenido-p">{item.answer}</p>
                </article>
              ))}
            </div>
            <h3 className="playful-h2 text-center mt-12 mb-0">{PAIN_POINTS.band}</h3>
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
          <h2 className="playful-h2 text-center mb-10">{SOCIAL_PROOF.h2}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8">
            {caseCards.map((caseStudy) => (
              <CaseStudyCard key={caseStudy.slug} caseStudy={caseStudy} />
            ))}
          </div>
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden w-full flex flex-col justify-center items-center text-center p-6 md:p-10">
            <div className="w-20 h-20 relative mb-4">
              <Image
                src="/images/avatar-playful.svg"
                alt="Avatar Playful"
                fill
                className="object-contain"
              />
            </div>
            <h4 className="font-semibold text-lg mb-2 text-[#4A4453]">{SOCIAL_PROOF.attribution}</h4>
            <div className="flex justify-center mb-4">
              <div className="text-yellow-400 text-xl">
                {Array.from({ length: 5 }).map((_, star) => (
                  <span key={star}>★</span>
                ))}
              </div>
            </div>
            <p className="text-sm md:text-base px-2 text-[#4A4453]">«{SOCIAL_PROOF.quote}»</p>
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
          <h2 className="playful-h2 text-center mb-10">{FAQ.h2}</h2>
          <div className="max-w-4xl mx-auto">
            <ServiceFaqAccordion
              items={FAQ.items.map((item) => ({
                question: item.question,
                answer: <LinkedCopy text={item.answer} />,
              }))}
            />
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6">
            <TestimonialsSection />
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6">
            <BlogRelatedPostsSection posts={blogPosts} />
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6">
            <TwoColumnCtaSection
              contentBgColor="#B3FFF3"
              imageUrl="/images/pasarela-de-pagos-venezuela/cta-conectemos.png"
              title={CTA.h2}
              subtitle={CTA.body}
              ctaTitle={CTA.question}
              buttonText={CTA.cta}
              buttonLink={BOOKING_HREF}
            />
          </div>
        </section>
      </article>
    </>
  );
}
