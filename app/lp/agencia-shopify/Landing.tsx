import { Suspense } from 'react';
import CimaBreaker from '@/components/premios-cima/CimaBreaker';
import { getAllCaseStudies } from '@/services/wordpress';
import { publicWebpIfPresent } from '@/lib/public-webp-src';
import { resolveImageAlt } from '@/lib/image-alt-overrides';
import { toAdsLandingCaseCards } from '../_lib/ads-landing-cases';
import { unsignedLabel, UnsignedBlock, UnsignedFaqAnswer } from '../_lib/unsigned-copy';
import AdsCaseCard from '../_components/AdsCaseCard';
import AdsFaq from '../_components/AdsFaq';
import {
  faqItemsForMarket,
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
  painsForMarket,
} from './copy';
import BookingCta from './BookingCta';
import HeroLcp, { HERO_LCP_1X } from './HeroLcp';
import QueryLink from './QueryLink';
import StickyCta from './StickyCta';
import { QUERY_BOOT_SCRIPT } from './query-boot';
import { LP_META_ANGLES, LP_META_MARKETS, type LpMetaMarket } from './variants';

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

const HERO_H1_STYLE = { fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif' } as const;

function MarketSlot({
  mkt,
  children,
}: {
  mkt: LpMetaMarket;
  children: React.ReactNode;
}) {
  return (
    <div data-lp-when-mkt={mkt} className={mkt === 'es' ? undefined : 'hidden'}>
      {children}
    </div>
  );
}

export default function Landing() {
  const defaultPainOrder = LP_META_PAIN_ORDER.generic;

  return (
    <>
      <link rel="preload" as="image" href={HERO_LCP_1X} fetchPriority="high" />
      <article
        className="w-full pb-28"
        data-ads-warm-landing
        data-lp-meta-shopify
        data-lp-mkt="es"
        data-lp-ang="generic"
      >
        <section data-cta-section="hero" data-lp-block="1" className="relative overflow-hidden">
          <div className="mx-auto max-w-[1200px] px-4 pb-16 pt-4 md:px-6 md:pb-20">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              <div className="order-1 lg:order-2">
                <HeroLcp />
              </div>
              <div className="order-2 space-y-8 lg:order-1">
                <UnsignedBlock
                  block={LP_META_HERO_TITLES.generic}
                  as="h1"
                  className="text-[36px] leading-[42px] font-semibold text-[#440099] md:text-[45px] md:leading-[52px] lg:text-[56px] lg:leading-[1.1]"
                  style={HERO_H1_STYLE}
                />
                {LP_META_MARKETS.map((mkt) => (
                  <MarketSlot key={mkt} mkt={mkt}>
                    <UnsignedBlock block={LP_META_HERO_SUBTITLES[mkt]} />
                  </MarketSlot>
                ))}
                <div className="flex flex-col items-start gap-4">
                  <BookingCta dataCta="lp-meta-hero" className={PRIMARY_CTA_CLASS}>
                    {unsignedLabel(LP_META_CTA_PRIMARY.tag)}
                  </BookingCta>
                  <QueryLink href="#prueba" dataCta="lp-meta-hero-sec" className={SECONDARY_CTA_CLASS}>
                    {unsignedLabel(LP_META_CTA_SECONDARY.tag)}
                  </QueryLink>
                  <p className="text-sm italic text-[#453A53]" data-content-note>
                    Nota para Contenido: {LP_META_CTA_PRIMARY.note}
                  </p>
                </div>
                <ul className="flex flex-wrap items-center gap-4" data-lp-proof-logos>
                  {LP_META_PROOF_CASES.map((item) => (
                    <li key={item.slug} className="w-24">
                      <QueryLink
                        href={item.href}
                        dataCta="lp-meta-hero-sec"
                        className="block overflow-hidden rounded-xl bg-white shadow-md focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#440099]"
                      >
                        <img
                          src={item.image}
                          alt={item.label}
                          width={96}
                          height={96}
                          loading="lazy"
                          decoding="async"
                          className="h-16 w-full object-contain"
                        />
                      </QueryLink>
                    </li>
                  ))}
                </ul>
              </div>
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
            {(['es', 'latam', 've'] as const).map((mkt) => {
              const pains = painsForMarket(mkt === 've' ? 'latam' : mkt);
              return (
                <ol
                  key={mkt}
                  data-lp-when-mkt={mkt}
                  className={`flex flex-col gap-6 md:flex-row${mkt === 'es' ? '' : ' hidden'}`}
                >
                  {defaultPainOrder.map((index, position) => (
                    <li
                      key={`${mkt}-${index}`}
                      data-lp-pain-index={index}
                      data-lp-pain-position={position}
                      className="flex-1 rounded-[32px] bg-white p-6 shadow-md"
                      style={{ order: position }}
                    >
                      <UnsignedBlock block={pains[index]} as="h3" className="playful-h3 mb-0" />
                    </li>
                  ))}
                </ol>
              );
            })}
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
                    <img
                      src={publicWebpIfPresent(SERVICE_ART[index])}
                      alt={resolveImageAlt(SERVICE_ART[index])}
                      width={200}
                      height={180}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                ) : null}
                <UnsignedBlock block={item} as="h3" className="playful-h3 mb-0" />
              </article>
            ))}
          </div>
          <div className="mt-8 text-center">
            <QueryLink href="#prueba" dataCta="lp-meta-stores-sec" className={SECONDARY_CTA_CLASS}>
              {unsignedLabel(LP_META_CTA_SECONDARY.tag)}
            </QueryLink>
          </div>
        </section>

        <CimaBreaker variant="shopify" />

        <section
          id="prueba"
          data-lp-block="4"
          className="mx-auto max-w-[1200px] scroll-mt-8 px-4 py-8 md:px-6 md:py-12"
        >
          <UnsignedBlock block={LP_META_PROOF_HEAD} as="h2" className="playful-h2 mb-4 text-center" />
          <MarketSlot mkt="es">
            <UnsignedBlock block={LP_META_FEATURED_CASE_NOTE.generic} />
          </MarketSlot>
          {LP_META_ANGLES.map((ang) => (
            <div key={ang} data-lp-when-ang={ang} className="hidden" data-copy-angle={ang}>
              <UnsignedBlock block={LP_META_HERO_TITLES[ang]} />
              <UnsignedBlock block={LP_META_FEATURED_CASE_NOTE[ang]} />
            </div>
          ))}
          <Suspense fallback={<div className="mt-10 min-h-[16rem]" />}>
            <CaseCards />
          </Suspense>
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
              <img
                src={JOSE_PHOTO}
                alt="José Reyes"
                width={176}
                height={176}
                loading="lazy"
                decoding="async"
                className="h-28 w-28 rounded-full object-cover"
              />
              <UnsignedBlock block={LP_META_TEAM_BIO} />
            </div>
          </div>
        </section>

        <section
          id="cobro-local-ve"
          data-lp-block="ve"
          data-lp-ve-local-pay
          data-lp-when-mkt="ve"
          className="mx-auto hidden max-w-[1200px] px-4 py-8 md:px-6 md:py-12"
        >
          <div className="playful-contenedor playful-contenedor-FFEFD1 space-y-4 rounded-[32px] md:rounded-[48px]">
            <UnsignedBlock block={LP_META_VE_LOCAL_PAY} as="h2" className="playful-h2 text-center" />
          </div>
        </section>

        <section
          id="faq"
          data-lp-block="7"
          className="mx-auto max-w-[1200px] px-4 py-8 md:px-6 md:py-12"
        >
          <UnsignedBlock block={LP_META_FAQ_HEAD} as="h2" className="playful-h2 mb-10 text-center" />
          <div className="mx-auto max-w-4xl space-y-3">
            {LP_META_MARKETS.map((mkt) => (
              <MarketSlot key={mkt} mkt={mkt}>
                <AdsFaq
                  items={faqItemsForMarket(mkt).map((item) => ({
                    question: unsignedLabel(item.question.tag),
                    answer: <UnsignedFaqAnswer block={item.answer} />,
                  }))}
                />
              </MarketSlot>
            ))}
          </div>
        </section>

        <section className="py-12" data-cta-section="final" data-lp-block="8">
          <div className="mx-auto max-w-[1200px] px-4 md:px-6">
            <div className="rounded-2xl bg-[#B3FFF3] px-5 py-10 text-center lg:p-12">
              <h2 className="mb-6 text-3xl font-normal leading-tight text-[#453A53] md:text-4xl">
                {unsignedLabel(LP_META_FINAL_HEAD.tag)}
              </h2>
              {LP_META_MARKETS.map((mkt) => (
                <MarketSlot key={mkt} mkt={mkt}>
                  <p className="mb-8 text-lg text-[#453A53]">{unsignedLabel(LP_META_FINAL_BODY[mkt].tag)}</p>
                </MarketSlot>
              ))}
              <BookingCta dataCta="lp-meta-final" className={PRIMARY_CTA_CLASS}>
                {unsignedLabel(LP_META_FINAL_BUTTON.tag)}
              </BookingCta>
            </div>
            <div className="mx-auto mt-4 max-w-2xl space-y-2 text-center">
              <p className="text-sm italic text-[#453A53]" data-content-note>
                Nota para Contenido (titular CTA): {LP_META_FINAL_HEAD.note}
              </p>
            </div>
          </div>
        </section>
      </article>
      <script dangerouslySetInnerHTML={{ __html: QUERY_BOOT_SCRIPT }} />
      <StickyCta />
    </>
  );
}

async function CaseCards() {
  const casosDeExito = await getAllCaseStudies().catch(() => []);
  const caseCards = toAdsLandingCaseCards(casosDeExito);
  const orderedCards = [...caseCards].sort((left, right) => {
    const order = [
      'odwalla-shopify-dtc-ecommerce',
      'jumex-shopify-dtc-ecommerce',
      'soytechno-ecommerce-venezuela',
    ];
    return order.indexOf(left.slug) - order.indexOf(right.slug);
  });

  return (
    <>
      <div className="mt-10 flex flex-col gap-6 md:flex-row">
        {orderedCards.map((caseStudy, index) => (
          <div
            key={caseStudy.slug}
            data-lp-case={caseStudy.slug}
            className="flex-1"
            style={{ order: index }}
          >
            <AdsCaseCard caseStudy={caseStudy} />
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
        <QueryLink
          href="/casos-de-exito/odwalla-shopify-dtc-ecommerce"
          dataCta="lp-meta-proof-sec"
          className={SECONDARY_CTA_CLASS}
          featured
        >
          {unsignedLabel(LP_META_CTA_SECONDARY.tag)}
        </QueryLink>
      </div>
    </>
  );
}
