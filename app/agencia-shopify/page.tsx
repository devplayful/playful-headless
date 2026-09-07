import type { Metadata } from 'next';
import Link from 'next/link';
import { canonicalForPath } from '@/utils/canonical';
import ContactLeadForm from '@/components/ContactLeadForm';
import {
  CTA,
  FAQ,
  HERO,
  MIGRATION,
  SERVICES,
  SHOPIFY_META,
  SOCIAL_PROOF,
  WHY_US,
  buildFaqPageJsonLd,
} from './copy';

const PAGE_URL = canonicalForPath(SHOPIFY_META.path);
const PORTFOLIO_URL = 'https://playfulagency.com/agencia-e-commerce';
const SERVICE_CARD_COLORS = [
  'bg-[#E9D7FF]',
  'bg-[#FFEFD1]',
  'bg-[#E4FFF9]',
  'bg-[#FFDBDB]',
  'bg-[#B3FFF3]',
  'bg-[#FEF7FF]',
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
  const parts = text.split(/(https:\/\/playfulagency\.com\/[^\s)]+)/g);
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

function TalkCta({ href = '#agenda' }: { href?: string }) {
  return (
    <a href={href} className="playful-boton !text-[14px] !leading-[18px] md:!text-base md:!leading-normal">
      {HERO.cta}
    </a>
  );
}

export default function AgenciaShopifyPage() {
  const faqJsonLd = buildFaqPageJsonLd();
  const previewSimulation =
    process.env.VERCEL_ENV === 'preview'
    && process.env.PREVIEW_CONTACT_SIMULATOR_ENABLED === 'true';

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
              {SERVICES.items.map((item, index) => (
                <article
                  key={item.title}
                  className={`${SERVICE_CARD_COLORS[index]} rounded-[32px] shadow-lg p-8 md:p-10 flex flex-col`}
                >
                  {item.slot ? (
                    <div className="mb-6">
                      <IllustrationSlot id={item.slot} />
                    </div>
                  ) : null}
                  <h3 className="playful-h3 mb-4">{item.title}</h3>
                  <p className="playful-contenido-p flex-1">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="relative overflow-hidden rounded-[32px] bg-[#440099] p-8 md:p-[60px]">
            <div className="pointer-events-none absolute inset-0 bg-[url('/images/background.webp')] bg-cover bg-center bg-no-repeat opacity-40" />
            <div className="relative z-10 max-w-4xl">
              <h2 className="playful-h2 text-white mb-6">{MIGRATION.h2}</h2>
              <p className="playful-contenido-p text-[#E9D7FF]">{MIGRATION.body}</p>
            </div>
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
          <h2 className="playful-h2 text-center mb-10">{SOCIAL_PROOF.h2}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8">
            {SOCIAL_PROOF.cases.map((item) => (
              <article
                key={item.name}
                className="rounded-[32px] bg-[#FEF7FF] shadow-lg p-8 md:p-10"
              >
                <p className="playful-contenido-p">
                  {item.line}{' '}
                  <Link
                    href={item.href.replace('https://playfulagency.com', '')}
                    className="text-[#440099] font-semibold underline underline-offset-2 break-all"
                  >
                    {item.href}
                  </Link>
                </p>
              </article>
            ))}
          </div>
          <blockquote className="rounded-[32px] bg-[#E9D7FF] shadow-lg p-8 md:p-12">
            <p className="playful-contenido-p text-[18px] leading-[28px] mb-4">
              «{SOCIAL_PROOF.quote}»
            </p>
            <footer className="playful-contenido-p font-semibold">
              {SOCIAL_PROOF.attribution}
            </footer>
          </blockquote>
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
          <div className="space-y-8 max-w-4xl mx-auto">
            {FAQ.items.map((item) => (
              <div key={item.question}>
                <h3 className="playful-h3 mb-3">{item.question}</h3>
                <p className="playful-contenido-p">
                  <LinkedCopy text={item.answer} />
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="agenda" className="max-w-[1200px] mx-auto px-4 md:px-6 pt-8 pb-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              <h2 className="playful-h2">{CTA.h2}</h2>
              <p className="playful-contenido-p">{CTA.body}</p>
              <p className="playful-contenido-p">{CTA.question}</p>
              <TalkCta href="#agencia-shopify-form" />
            </div>
            <ContactLeadForm
              previewSimulation={previewSimulation}
              submitLabel={CTA.formButton}
              heading={null}
              formId="agencia-shopify-form"
            />
          </div>
        </section>
      </article>
    </>
  );
}
