import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { canonicalForPath } from '@/utils/canonical';
import { CaseStudyCard } from '@/components/CarouselResultados';
import TestimonialsSection from '@/components/TestimonialsSectionClient';
import BlogRelatedPostsSection from '@/components/sections/BlogRelatedPostsSection';
import TwoColumnCtaSection from '@/components/ui/TwoColumnCtaSection';
import { getAllCaseStudies, getLatestBlogPosts } from '@/services/wordpress';
import ServiceFaqAccordion from './ServiceFaqAccordion';
import { toShopifyCaseCards } from './shopify-cases';
import {
  CONTACT_HREF,
  CTA,
  FAQ,
  HERO,
  MIGRATION,
  SERVICE_BAND_ITEMS,
  SERVICE_GRID_ITEMS,
  SERVICES,
  SHOPIFY_META,
  SOCIAL_PROOF,
  WHY_US,
  PLAYFUL_URL_RE,
  buildFaqPageJsonLd,
} from './copy';

const PAGE_URL = canonicalForPath(SHOPIFY_META.path);
const PORTFOLIO_URL = 'https://playfulagency.com/agencia-e-commerce';
const SERVICE_CARD_COLORS = [
  'bg-[#E9D7FF]',
  'bg-[#FFEFD1]',
  'bg-[#E4FFF9]',
  'bg-[#FFDBDB]',
] as const;

export const metadata: Metadata = {
  title: SHOPIFY_META.title,
  description: SHOPIFY_META.description,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: SHOPIFY_META.title,
    description: SHOPIFY_META.description,
    url: PAGE_URL,
  },
};

function IllustrationSlot({ id, size = 'card' }: { id: string; size?: 'hero' | 'card' }) {
  return (
    <div
      data-illustration-slot={id}
      aria-hidden="true"
      className={
        size === 'hero'
          ? 'w-full min-h-[280px] md:min-h-[360px] rounded-[32px] border border-dashed border-[#C4B5D4] bg-[#FEF7FF]'
          : 'w-full max-w-[200px] h-[180px] mx-auto rounded-2xl border border-dashed border-[#C4B5D4] bg-white/50'
      }
    />
  );
}

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

function TalkCta({ href = CONTACT_HREF }: { href?: string }) {
  return (
    <Link href={href} className="playful-boton !text-[14px] !leading-[18px] md:!text-base md:!leading-normal">
      {HERO.cta}
    </Link>
  );
}

function PurpleBand({ title, body }: { title: string; body: string }) {
  return (
    <div className="relative overflow-hidden rounded-[32px] bg-[#440099] p-8 md:p-[60px]">
      <div className="pointer-events-none absolute inset-0 bg-[url('/images/background.webp')] bg-cover bg-center bg-no-repeat opacity-40" />
      <div className="relative z-10 max-w-4xl">
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

export default async function AgenciaShopifyPage() {
  const faqJsonLd = buildFaqPageJsonLd();
  const [casosDeExito, blogPosts] = await Promise.all([
    getAllCaseStudies().catch(() => []),
    getLatestBlogPosts(6).catch(() => []),
  ]);
  const shopifyCases = toShopifyCaseCards(casosDeExito);

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
                <h1 className="playful-h1 text-[36px] leading-[42px] md:text-[45px] md:leading-[52px] lg:text-[56px] lg:leading-[1.1]">
                  {HERO.h1}
                </h1>
                <p className="playful-contenido-p">{HERO.body}</p>
                <div className="space-y-3">
                  <TalkCta />
                  <p className="playful-contenido-p">{HERO.subline}</p>
                </div>
              </div>
              <IllustrationSlot id="hero" size="hero" />
            </div>
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="playful-contenedor playful-contenedor-FFEFD1 rounded-[32px] md:rounded-[48px]">
            <h2 className="playful-h2 text-center">{SERVICES.h2}</h2>
            <p className="playful-contenido-p max-w-3xl mx-auto text-center">{SERVICES.intro}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-4">
              {SERVICE_GRID_ITEMS.map((item, index) => (
                <article
                  key={item.title}
                  className={`${SERVICE_CARD_COLORS[index]} rounded-[32px] shadow-lg p-8 md:p-10 flex flex-col`}
                >
                  <div className="mb-6">
                    <IllustrationSlot id={item.slot} />
                  </div>
                  <h3 className="playful-h3 mb-4">{item.title}</h3>
                  <p className="playful-contenido-p flex-1">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="space-y-6 md:space-y-8">
            {SERVICE_BAND_ITEMS.map((item) => (
              <PurpleBand key={item.title} title={item.title} body={item.body} />
            ))}
            <PurpleBand title={MIGRATION.h2} body={MIGRATION.body} />
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
          <h2 className="playful-h2 text-center mb-10">{SOCIAL_PROOF.h2}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8">
            {shopifyCases.map((caseStudy) => (
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
          <div className="playful-contenedor playful-contenedor-B3FFF3 rounded-[32px] md:rounded-[48px] !mt-0">
            <h2 className="playful-h2 text-center">{WHY_US.h2}</h2>
            <div className="space-y-6 max-w-4xl mx-auto">
              {WHY_US.items.map((item) => (
                <p key={item.lead} className="playful-contenido-p">
                  <strong className="font-bold">{item.lead}</strong>{' '}
                  {item.body.includes(PORTFOLIO_URL) ? (
                    <LinkedCopy text={item.body} />
                  ) : (
                    item.body
                  )}
                </p>
              ))}
            </div>
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
              imageUrl="/images/imagen-nueva-cta-home.png"
              title={CTA.h2}
              subtitle={CTA.body}
              ctaTitle={CTA.question}
              buttonText={CTA.cta}
              buttonLink={CONTACT_HREF}
            />
          </div>
        </section>
      </article>
    </>
  );
}
