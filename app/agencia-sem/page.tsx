import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { canonicalForPath } from '@/utils/canonical';
import { CaseStudyCard } from '@/components/CarouselResultados';
import TestimonialsSection from '@/components/TestimonialsSectionClient';
import BlogRelatedPostsSection from '@/components/sections/BlogRelatedPostsSection';
import TwoColumnCtaSection from '@/components/ui/TwoColumnCtaSection';
import { getAllCaseStudies, getLatestBlogPosts } from '@/services/wordpress';
import ServiceFaqAccordion from '../agencia-shopify/ServiceFaqAccordion';
import { toShopifyCaseCards } from '../agencia-shopify/shopify-cases';
import {
  CASES,
  CTA,
  FAQ,
  HERO,
  PROCESS,
  SECTIONS,
  SEM_META,
  SERVICE_BOOKING_HREF,
  buildFaqPageJsonLd,
} from './copy';

const PAGE_URL = canonicalForPath(SEM_META.path);
const SERVICE_CARD_COLORS = [
  'bg-[#E9D7FF]',
  'bg-[#FFEFD1]',
  'bg-[#E4FFF9]',
  'bg-[#FFDBDB]',
] as const;

const HERO_ART =
  'https://endpoint.playfulagency.com/wp-content/uploads/2024/09/Potencia-tu-presencia-con-publicidad.png';
const CARD_ART: Record<string, string> = {
  'servicio-cac':
    'https://endpoint.playfulagency.com/wp-content/uploads/2024/09/Visibilidad-Inmediata.png',
  'servicio-shopping':
    'https://endpoint.playfulagency.com/wp-content/uploads/2024/09/Control-de-Presupuesto.png',
  'servicio-pmax':
    'https://endpoint.playfulagency.com/wp-content/uploads/2024/09/Analisis-Detallado-de-Resultados.png',
  'servicio-cruce':
    'https://endpoint.playfulagency.com/wp-content/uploads/2024/09/Haz-Pruebas-y-%E2%80%A8Optimiza-tus-Campanas.png',
};

export const metadata: Metadata = {
  title: SEM_META.title,
  description: SEM_META.description,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: SEM_META.title,
    description: SEM_META.description,
    url: PAGE_URL,
  },
};

const MD_LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;

function hrefFromMarkdown(href: string): string {
  if (href.startsWith('http:///')) {
    return `/${href.slice('http:///'.length)}`;
  }
  if (href.startsWith('https://playfulagency.com')) {
    return href.slice('https://playfulagency.com'.length) || '/';
  }
  return href;
}

function InlineMarkdown({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  const matcher = new RegExp(MD_LINK_RE.source, 'g');
  let match = matcher.exec(text);
  while (match) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    nodes.push(
      <Link
        key={`${match[1]}-${match.index}`}
        href={hrefFromMarkdown(match[2])}
        className="text-[#440099] font-semibold underline underline-offset-2"
      >
        {match[1]}
      </Link>,
    );
    lastIndex = match.index + match[0].length;
    match = matcher.exec(text);
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return <>{nodes}</>;
}

function TalkCta({ href = SERVICE_BOOKING_HREF, label = HERO.cta }: { href?: string; label?: string }) {
  return (
    <a href={href} className="playful-boton !text-[14px] !leading-[18px] md:!text-base md:!leading-normal">
      {label}
    </a>
  );
}

export default async function AgenciaSemPage() {
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
                <TalkCta />
              </div>
              <div className="relative w-full min-h-[280px] md:min-h-[360px] overflow-hidden rounded-[32px]">
                <img
                  src={HERO_ART}
                  alt=""
                  width={552}
                  height={360}
                  decoding="async"
                  fetchPriority="high"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="playful-contenedor playful-contenedor-FFEFD1 rounded-[32px] md:rounded-[48px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {SECTIONS.items.map((item, index) => (
                <article
                  key={item.title}
                  className={`${SERVICE_CARD_COLORS[index]} rounded-[32px] shadow-lg p-8 md:p-10 flex flex-col`}
                >
                  <div className="mb-6">
                    <div className="relative w-full max-w-[200px] h-[180px] mx-auto overflow-hidden rounded-2xl">
                      <img
                        src={CARD_ART[item.slot]}
                        alt=""
                        width={200}
                        height={180}
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </div>
                  </div>
                  <h2 className="playful-h3 mb-4">{item.title}</h2>
                  <p className="playful-contenido-p flex-1">
                    <InlineMarkdown text={item.body} />
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="relative overflow-hidden rounded-[32px] bg-[#440099] p-8 md:p-[60px]">
            <div className="pointer-events-none absolute inset-0 bg-[url('/images/background.webp')] bg-cover bg-center bg-no-repeat opacity-40" />
            <div className="relative z-10 max-w-4xl space-y-6">
              <h2 className="mb-6 [font-family:var(--font-paytone-one),var(--font-montserrat),sans-serif] text-[36px] leading-[1.1] md:text-[45px] font-normal !text-white">
                {PROCESS.h2}
              </h2>
              <p className="[font-family:var(--font-dm-sans),sans-serif] text-base leading-normal font-normal !text-[#E9D7FF]">
                {PROCESS.body}
              </p>
              <TalkCta label={PROCESS.cta} />
            </div>
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
          <h2 className="playful-h2 text-center mb-10">{CASES.h2}</h2>
          <div className="space-y-8 max-w-4xl mx-auto mb-10">
            {CASES.items.map((item) => (
              <article key={item.name}>
                <h3 className="playful-h3 mb-3">{item.name}</h3>
                <p className="playful-contenido-p">
                  <InlineMarkdown text={item.body} />
                </p>
                {item.follow ? <p className="playful-contenido-p mt-4">{item.follow}</p> : null}
              </article>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {shopifyCases.map((caseStudy) => (
              <CaseStudyCard key={caseStudy.slug} caseStudy={caseStudy} />
            ))}
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
          <h2 className="playful-h2 text-center mb-10">{FAQ.h2}</h2>
          <div className="max-w-4xl mx-auto">
            <ServiceFaqAccordion
              items={FAQ.items.map((item) => ({
                question: item.question,
                answer: <InlineMarkdown text={item.answer} />,
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
              ctaTitle=""
              buttonText={CTA.cta}
              buttonLink={SERVICE_BOOKING_HREF}
            />
          </div>
        </section>
      </article>
    </>
  );
}
