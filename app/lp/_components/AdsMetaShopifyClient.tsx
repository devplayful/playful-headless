'use client';

import Image from 'next/image';
import CimaBreaker from '@/components/premios-cima/CimaBreaker';
import type { CaseStudy } from '@/components/CarouselResultados';
import { publicWebpIfPresent } from '@/lib/public-webp-src';
import { resolveImageAlt } from '@/lib/image-alt-overrides';
import { unsignedLabel, UnsignedBlock, UnsignedFaqAnswer } from '../_lib/unsigned-copy';
import {
  LP_META_CTA_PRIMARY,
  LP_META_CTA_SECONDARY,
  LP_META_FEATURED_CASE_NOTE,
  LP_META_FINAL_BODY,
  LP_META_FINAL_BUTTON,
  LP_META_FINAL_HEAD,
  LP_META_FAQ_HEAD,
  LP_META_HERO_SUBTITLES,
  LP_META_HERO_TITLES,
  LP_META_PAIN_ORDER,
  LP_META_PROBLEM_HEAD,
  LP_META_PROCESS_HEAD,
  LP_META_PROCESS_ITEMS,
  LP_META_PROOF_CASES,
  LP_META_PROOF_FOOT,
  LP_META_PROOF_HEAD,
  LP_META_SERVICES,
  LP_META_STORES_HEAD,
  LP_META_TEAM_BIO,
  LP_META_TEAM_HEAD,
  LP_META_VE_LOCAL_PAY,
  faqItemsForMarket,
  painsForMarket,
} from '../agencia-shopify/copy';
import { lpMetaHrefWithSearch } from '@/utils/lp-meta-booking';
import {
  caseOrderForMarket,
  featuredCaseSlugForMarket,
  type LpMetaAngle,
  type LpMetaMarket,
} from '../agencia-shopify/variants';
import AdsCaseCard from './AdsCaseCard';
import AdsFaq from './AdsFaq';
import AdsFinalCta from './AdsFinalCta';
import AdsHeroArt from './AdsHeroArt';
import AdsMetaBookingLink from './AdsMetaBookingLink';
import { AdsMetaParamsProvider, useAdsMetaParams } from './AdsMetaParams';
import AdsMetaQueryLink from './AdsMetaQueryLink';
import AdsStickyCta from './AdsStickyCta';

const STEP_CARD_COLORS = ['bg-[#E9D7FF]', 'bg-[#FFEFD1]', 'bg-[#E4FFF9]', 'bg-[#FFDBDB]'] as const;
const JOSE_PHOTO = '/images/firmas/foto-jose-reyes-176.png';
const SERVICE_ART = [
  '/images/agencia-shopify/servicio-diseno-ovqmfMO829@1x.png',
  '/images/agencia-shopify/servicio-desarrollo-ovqEk50829@1x.png',
  '/images/agencia-shopify/servicio-catalogo-yiYYfxIPW9@1x.png',
  '/images/agencia-shopify/servicio-checkout-SyZ2uJkUb8@1x.png',
] as const;

const PRIMARY_CTA_CLASS =
  'inline-flex min-h-12 items-center justify-center rounded-full bg-[#440099] px-8 py-3 text-center text-sm font-semibold text-white no-underline hover:bg-[#5B21B6] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#440099] md:text-base';
const SECONDARY_CTA_CLASS =
  'inline-flex min-h-12 items-center justify-center text-sm font-semibold text-[#440099] underline underline-offset-4 hover:text-[#5B21B6] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#440099] md:text-base';

export type AdsMetaShopifyViewProps = {
  mkt: LpMetaMarket;
  ang: LpMetaAngle;
  search?: string;
  caseCards: CaseStudy[];
};

export function AdsMetaShopifyView({ mkt, ang, search = '', caseCards }: AdsMetaShopifyViewProps) {
  const pains = painsForMarket(mkt);
  const painOrder = LP_META_PAIN_ORDER[ang];
  const faqItems = faqItemsForMarket(mkt);
  const featuredSlug = featuredCaseSlugForMarket(mkt);
  const orderedCards = caseOrderForMarket(mkt)
    .map((slug) => caseCards.find((item) => item.slug === slug))
    .filter((item): item is CaseStudy => Boolean(item));
  const featuredHref =
    LP_META_PROOF_CASES.find((item) => item.slug === featuredSlug)?.href ||
    '/casos-de-exito/odwalla-shopify-dtc-ecommerce';

  return (
    <article
      className="w-full pb-28"
      data-ads-warm-landing
      data-lp-meta-shopify
      data-lp-mkt={mkt}
      data-lp-ang={ang}
    >
      <section data-cta-section="hero" data-lp-block="1" className="relative overflow-hidden">
        <div className="mx-auto max-w-[1200px] px-4 pb-16 pt-4 md:px-6 md:pb-20">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8">
              <UnsignedBlock
                block={LP_META_HERO_TITLES[ang]}
                as="h1"
                className="playful-h1 text-[36px] leading-[42px] md:text-[45px] md:leading-[52px] lg:text-[56px] lg:leading-[1.1]"
              />
              <UnsignedBlock block={LP_META_HERO_SUBTITLES[mkt]} />
              <div className="flex flex-col items-start gap-4">
                <AdsMetaBookingLink dataCta="lp-meta-hero" className={PRIMARY_CTA_CLASS}>
                  {unsignedLabel(LP_META_CTA_PRIMARY.tag)}
                </AdsMetaBookingLink>
                <AdsMetaQueryLink href="#prueba" dataCta="lp-meta-hero-sec" className={SECONDARY_CTA_CLASS}>
                  {unsignedLabel(LP_META_CTA_SECONDARY.tag)}
                </AdsMetaQueryLink>
                <p className="text-sm italic text-[#453A53]" data-content-note>
                  Nota para Contenido: {LP_META_CTA_PRIMARY.note}
                </p>
              </div>
              <ul className="flex flex-wrap items-center gap-4" data-lp-proof-logos>
                {LP_META_PROOF_CASES.map((item) => (
                  <li key={item.slug} className="w-24">
                    <AdsMetaQueryLink
                      href={item.href}
                      dataCta="lp-meta-hero-sec"
                      className="block overflow-hidden rounded-xl bg-white shadow-md focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#440099]"
                    >
                      <Image
                        src={item.image}
                        alt={item.label}
                        width={96}
                        height={96}
                        className="h-16 w-full object-contain"
                      />
                    </AdsMetaQueryLink>
                  </li>
                ))}
              </ul>
            </div>
            <AdsHeroArt />
          </div>
        </div>
      </section>

      <section
        id="problema"
        data-lp-block="2"
        className="mx-auto max-w-[1200px] scroll-mt-8 px-4 py-8 md:px-6 md:py-12"
      >
        <div className="playful-contenedor playful-contenedor-FFEFD1 space-y-6 rounded-[32px] md:rounded-[48px]">
          <UnsignedBlock block={LP_META_PROBLEM_HEAD} as="h2" className="playful-h2 text-center" />
          <ol className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {painOrder.map((index, position) => (
              <li
                key={pains[index].tag}
                data-lp-pain-index={index}
                data-lp-pain-position={position}
                className="rounded-[32px] bg-white p-6 shadow-md"
              >
                <UnsignedBlock block={pains[index]} as="h3" className="playful-h3 mb-0" />
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        id="hacemos-tiendas"
        data-lp-block="3"
        className="mx-auto max-w-[1200px] px-4 py-8 md:px-6 md:py-12"
      >
        <UnsignedBlock block={LP_META_STORES_HEAD} as="h2" className="playful-h2 mb-10 text-center" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {LP_META_SERVICES.map((item, index) => (
            <article
              key={item.tag}
              className={`${STEP_CARD_COLORS[index % STEP_CARD_COLORS.length]} flex flex-col gap-4 rounded-[32px] p-8 shadow-lg md:p-10`}
            >
              {SERVICE_ART[index] ? (
                <div className="relative mx-auto h-[180px] w-full max-w-[200px] overflow-hidden rounded-2xl">
                  <Image
                    src={publicWebpIfPresent(SERVICE_ART[index])}
                    alt={resolveImageAlt(SERVICE_ART[index])}
                    width={200}
                    height={180}
                    sizes="200px"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              ) : null}
              <UnsignedBlock block={item} as="h3" className="playful-h3 mb-0" />
            </article>
          ))}
        </div>
        <div className="mt-8 text-center">
          <AdsMetaQueryLink href="#prueba" dataCta="lp-meta-stores-sec" className={SECONDARY_CTA_CLASS}>
            {unsignedLabel(LP_META_CTA_SECONDARY.tag)}
          </AdsMetaQueryLink>
        </div>
      </section>

      <CimaBreaker variant="shopify" />

      <section
        id="prueba"
        data-lp-block="4"
        className="mx-auto max-w-[1200px] scroll-mt-8 px-4 py-8 md:px-6 md:py-12"
      >
        <UnsignedBlock block={LP_META_PROOF_HEAD} as="h2" className="playful-h2 mb-4 text-center" />
        <UnsignedBlock block={LP_META_FEATURED_CASE_NOTE[ang]} />
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {orderedCards.map((caseStudy) => (
            <div
              key={caseStudy.slug}
              data-lp-case={caseStudy.slug}
              data-lp-case-featured={caseStudy.slug === featuredSlug ? 'true' : 'false'}
            >
              <AdsCaseCard
                caseStudy={caseStudy}
                href={lpMetaHrefWithSearch(`/casos-de-exito/${caseStudy.slug}`, search ? `?${search}` : '')}
                dataCta="lp-meta-proof-sec"
              />
              <div className="mt-3">
                <UnsignedBlock
                  block={
                    LP_META_PROOF_FOOT[caseStudy.slug as keyof typeof LP_META_PROOF_FOOT] || {
                      tag: `pie caso ${caseStudy.slug}`,
                      note: 'Marcador: falta pie de caso.',
                    }
                  }
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <AdsMetaQueryLink href={featuredHref} dataCta="lp-meta-proof-sec" className={SECONDARY_CTA_CLASS}>
            {unsignedLabel(LP_META_CTA_SECONDARY.tag)}
          </AdsMetaQueryLink>
        </div>
      </section>

      <section
        id="proceso"
        data-lp-block="5"
        className="mx-auto max-w-[1200px] px-4 py-8 md:px-6 md:py-12"
      >
        <UnsignedBlock block={LP_META_PROCESS_HEAD} as="h2" className="playful-h2 mb-10 text-center" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {LP_META_PROCESS_ITEMS.map((item, index) => (
            <article
              key={item.tag}
              className={`${STEP_CARD_COLORS[index % STEP_CARD_COLORS.length]} flex flex-col gap-4 rounded-[32px] p-8 shadow-lg md:p-10`}
            >
              <span className="text-lg font-bold text-[#440099]">Fase {index + 1}</span>
              <UnsignedBlock block={item} as="h3" className="playful-h3 mb-0" />
            </article>
          ))}
        </div>
      </section>

      <section
        id="equipo"
        data-lp-block="6"
        className="mx-auto max-w-[1200px] px-4 py-8 md:px-6 md:py-12"
      >
        <div className="playful-contenedor playful-contenedor-B3FFF3 space-y-8 rounded-[32px] !mt-0 md:rounded-[48px]">
          <UnsignedBlock block={LP_META_TEAM_HEAD} as="h2" className="playful-h2 text-center" />
          <div className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
            <Image
              src={JOSE_PHOTO}
              alt="José Reyes"
              width={176}
              height={176}
              className="h-28 w-28 rounded-full object-cover"
            />
            <UnsignedBlock block={LP_META_TEAM_BIO} />
          </div>
        </div>
      </section>

      {mkt === 've' ? (
        <section
          id="cobro-local-ve"
          data-lp-block="ve"
          data-lp-ve-local-pay
          className="mx-auto max-w-[1200px] px-4 py-8 md:px-6 md:py-12"
        >
          <div className="playful-contenedor playful-contenedor-FFEFD1 space-y-4 rounded-[32px] md:rounded-[48px]">
            <UnsignedBlock block={LP_META_VE_LOCAL_PAY} as="h2" className="playful-h2 text-center" />
          </div>
        </section>
      ) : null}

      <section
        id="faq"
        data-lp-block="7"
        className="mx-auto max-w-[1200px] px-4 py-8 md:px-6 md:py-12"
      >
        <UnsignedBlock block={LP_META_FAQ_HEAD} as="h2" className="playful-h2 mb-10 text-center" />
        <div className="mx-auto max-w-4xl">
          <AdsFaq
            items={faqItems.map((item) => ({
              question: unsignedLabel(item.question.tag),
              answer: <UnsignedFaqAnswer block={item.answer} />,
            }))}
          />
        </div>
      </section>

      <section className="py-12" data-cta-section="final" data-lp-block="8">
        <div className="mx-auto max-w-[1200px] px-4 md:px-6">
          <AdsFinalCta
            title={unsignedLabel(LP_META_FINAL_HEAD.tag)}
            body={unsignedLabel(LP_META_FINAL_BODY[mkt].tag)}
            button={unsignedLabel(LP_META_FINAL_BUTTON.tag)}
          />
          <div className="mx-auto mt-4 max-w-2xl space-y-2 text-center">
            <p className="text-sm italic text-[#453A53]" data-content-note>
              Nota para Contenido (titular CTA): {LP_META_FINAL_HEAD.note}
            </p>
            <p className="text-sm italic text-[#453A53]" data-content-note>
              Nota para Contenido (cuerpo CTA): {LP_META_FINAL_BODY[mkt].note}
            </p>
            <p className="text-sm italic text-[#453A53]" data-content-note>
              Nota para Contenido (botón): {LP_META_FINAL_BUTTON.note}
            </p>
          </div>
        </div>
      </section>
    </article>
  );
}

function AdsMetaShopifyConnected({ caseCards }: { caseCards: CaseStudy[] }) {
  const { mkt, ang, search } = useAdsMetaParams();
  return (
    <>
      <AdsMetaShopifyView mkt={mkt} ang={ang} search={search} caseCards={caseCards} />
      <AdsStickyCta />
    </>
  );
}

export default function AdsMetaShopifyClient({ caseCards }: { caseCards: CaseStudy[] }) {
  return (
    <AdsMetaParamsProvider>
      <AdsMetaShopifyConnected caseCards={caseCards} />
    </AdsMetaParamsProvider>
  );
}
