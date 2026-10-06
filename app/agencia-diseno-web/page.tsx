import type { Metadata } from 'next';
import Link from 'next/link';
import { canonicalForPath } from '@/utils/canonical';
import TestimonialsSection from '@/components/TestimonialsSectionClient';
import BlogRelatedPostsSection from '@/components/sections/BlogRelatedPostsSection';
import { getLatestBlogPosts } from '@/services/wordpress';
import ServiceFaqAccordion from '../agencia-shopify/ServiceFaqAccordion';
import {
  AUDIENCE,
  SERVICE_BOOKING_HREF,
  CASES,
  CRO,
  CTA,
  DISENO_META,
  FAQ,
  HERO,
  MARKDOWN_TOKEN_RE,
  PLATFORMS,
  PROCESS,
  SCREENS,
  buildFaqPageJsonLd,
} from './copy';

const PAGE_URL = canonicalForPath(DISENO_META.path);

export const metadata: Metadata = {
  title: DISENO_META.title,
  description: DISENO_META.description,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: DISENO_META.title,
    description: DISENO_META.description,
    url: PAGE_URL,
  },
};

function LinkedMarkdown({
  text,
  linkClassName = 'text-[#440099] font-semibold underline underline-offset-2',
}: {
  text: string;
  linkClassName?: string;
}) {
  const parts = text.split(MARKDOWN_TOKEN_RE);
  return (
    <>
      {parts.map((part, index) => {
        const bold = part.match(/^\*\*([^*]+)\*\*$/);
        if (bold) {
          return <strong key={`${part}-${index}`}>{bold[1]}</strong>;
        }

        const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (link) {
          const [, label, rawHref] = link;
          const isApex = rawHref.startsWith('https://playfulagency.com');
          const href = isApex ? rawHref.replace('https://playfulagency.com', '') || '/' : rawHref;
          if (isApex) {
            return (
              <Link key={`${rawHref}-${index}`} href={href} className={linkClassName}>
                {label}
              </Link>
            );
          }
          return (
            <a key={`${rawHref}-${index}`} href={rawHref} className={linkClassName}>
              {label}
            </a>
          );
        }

        return <span key={`${part}-${index}`}>{part}</span>;
      })}
    </>
  );
}

function TalkCta({ href = SERVICE_BOOKING_HREF }: { href?: string }) {
  return (
    <a href={href} className="playful-boton !text-[14px] !leading-[18px] md:!text-base md:!leading-normal">
      {HERO.cta}
    </a>
  );
}

export default async function AgenciaDisenoWebPage() {
  const faqJsonLd = buildFaqPageJsonLd();
  const blogPosts = await getLatestBlogPosts(6).catch(() => []);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <article className="w-full pb-20">
        <section className="relative overflow-hidden">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 pt-4 pb-16 md:pb-20">
            <div className="max-w-3xl space-y-8">
              <h1 className="playful-h1 text-[36px] leading-[42px] md:text-[45px] md:leading-[52px] lg:text-[56px] lg:leading-[1.1]">
                {HERO.h1}
              </h1>
              <p className="playful-contenido-p">{HERO.body}</p>
              <TalkCta />
            </div>
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="playful-contenedor playful-contenedor-FFEFD1 rounded-[32px] md:rounded-[48px]">
            <h2 className="playful-h2">{AUDIENCE.h2}</h2>
            <div className="space-y-6 max-w-4xl">
              {AUDIENCE.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)} className="playful-contenido-p">
                  <LinkedMarkdown text={paragraph} />
                </p>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
          <h2 className="playful-h2 mb-8">{SCREENS.h2}</h2>
          <p className="playful-contenido-p max-w-4xl mb-8">{SCREENS.intro}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {SCREENS.items.map((item) => (
              <article
                key={item.body.slice(0, 40)}
                className="bg-[#FEF7FF] rounded-[32px] shadow-lg p-8 md:p-10"
              >
                <p className="playful-contenido-p">
                  <LinkedMarkdown text={item.body} />
                </p>
              </article>
            ))}
          </div>
          <p className="playful-contenido-p max-w-4xl mt-8">{SCREENS.outro}</p>
        </section>

        <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="playful-contenedor playful-contenedor-B3FFF3 rounded-[32px] md:rounded-[48px] !mt-0">
            <h2 className="playful-h2">{PLATFORMS.h2}</h2>
            <p className="playful-contenido-p max-w-4xl">{PLATFORMS.intro}</p>
            <div className="space-y-6 max-w-4xl mt-6">
              {PLATFORMS.items.map((item) => (
                <p key={item.body.slice(0, 40)} className="playful-contenido-p">
                  <LinkedMarkdown text={item.body} />
                </p>
              ))}
            </div>
            <p className="playful-contenido-p max-w-4xl mt-6">{PLATFORMS.outro}</p>
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="relative overflow-hidden rounded-[32px] bg-[#440099] p-8 md:p-[60px]">
            <div className="pointer-events-none absolute inset-0 bg-[url('/images/background.webp')] bg-cover bg-center bg-no-repeat opacity-40" />
            <div className="relative z-10 max-w-4xl space-y-6">
              <h2 className="mb-6 [font-family:var(--font-paytone-one),var(--font-montserrat),sans-serif] text-[36px] leading-[1.1] md:text-[45px] font-normal !text-white">
                {CRO.h2}
              </h2>
              {CRO.paragraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 48)}
                  className="[font-family:var(--font-dm-sans),sans-serif] text-base leading-normal font-normal !text-[#E9D7FF]"
                >
                  <LinkedMarkdown
                    text={paragraph}
                    linkClassName="!text-[#E9D7FF] font-semibold underline underline-offset-2"
                  />
                </p>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
          <h2 className="playful-h2 mb-8">{PROCESS.h2}</h2>
          <p className="playful-contenido-p max-w-4xl mb-8">{PROCESS.intro}</p>
          <div className="space-y-6 max-w-4xl">
            {PROCESS.steps.map((step) => (
              <p key={step.body.slice(0, 40)} className="playful-contenido-p">
                <LinkedMarkdown text={step.body} />
              </p>
            ))}
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
          <h2 className="playful-h2 mb-8">{CASES.h2}</h2>
          <p className="playful-contenido-p max-w-4xl mb-8">{CASES.intro}</p>
          <div className="space-y-8 max-w-4xl">
            {CASES.items.map((item) => (
              <article key={item.href} className="bg-white rounded-3xl shadow-lg p-8 md:p-10">
                <h3 className="playful-h3 mb-4">
                  <Link
                    href={item.href.replace('https://playfulagency.com', '')}
                    className="text-[#440099] underline underline-offset-2"
                  >
                    {item.title}
                  </Link>
                </h3>
                <p className="playful-contenido-p">{item.body}</p>
                {item.quotes.map((quote) => (
                  <p key={quote.text} className="playful-contenido-p mt-4">
                    {quote.attribution} "{quote.text}"
                  </p>
                ))}
              </article>
            ))}
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
          <h2 className="playful-h2 text-center mb-10">{FAQ.h2}</h2>
          <div className="max-w-4xl mx-auto">
            <ServiceFaqAccordion
              items={FAQ.items.map((item) => ({
                question: item.question,
                answer: item.answer,
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

        <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="playful-contenedor playful-contenedor-B3FFF3 rounded-[32px] md:rounded-[48px] !mt-0">
            <h2 className="playful-h2">{CTA.h2}</h2>
            <div className="space-y-6 max-w-4xl">
              {CTA.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)} className="playful-contenido-p">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="mt-8">
              <TalkCta />
            </div>
          </div>
        </section>
      </article>
    </>
  );
}
