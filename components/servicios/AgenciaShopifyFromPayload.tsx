import Image from 'next/image';
import Link from 'next/link';
import { CaseStudyCard } from '@/components/CarouselResultados';
import { CASE_FEATURE_CARD_SIZES } from '@/lib/blog-image-sizes';
import TestimonialsSection from '@/components/TestimonialsSectionClient';
import BlogRelatedPostsSection from '@/components/sections/BlogRelatedPostsSection';
import TwoColumnCtaSection from '@/components/ui/TwoColumnCtaSection';
import CimaBreaker from '@/components/premios-cima/CimaBreaker';
import { resolveImageAlt } from '@/lib/image-alt-overrides';
import { publicWebpIfPresent } from '@/lib/public-webp-src';
import type { ServicioBlock, ServicioDoc } from '@/lib/cms-servicios';
import { getAllCaseStudies, getLatestBlogPosts } from '@/services/wordpress';
import ServiceFaqAccordion from '@/app/(frontend)/agencia-shopify/ServiceFaqAccordion';
import { toShopifyCaseCards } from '@/app/(frontend)/agencia-shopify/shopify-cases';
import { ZELLE_BLOG_POST_HREF } from '@/utils/blog-service-cta';
import { PLAYFUL_URL_RE } from '@/app/(frontend)/agencia-shopify/copy';

const PORTFOLIO_URL = 'https://playfulagency.com/agencia-e-commerce';

const CARD_COLOR_CLASS: Record<string, string> = {
  purple: 'bg-[#E9D7FF]',
  yellow: 'bg-[#FFEFD1]',
  mint: 'bg-[#E4FFF9]',
  pink: 'bg-[#FFDBDB]',
  none: 'bg-white',
};

const SLOT_IMAGES: Record<string, string> = {
  hero: '/images/agencia-shopify/hero-gORwV7MSXO@1x.png',
  'servicio-diseno': '/images/agencia-shopify/servicio-diseno-ovqmfMO829@1x.png',
  'servicio-desarrollo': '/images/agencia-shopify/servicio-desarrollo-ovqEk50829@1x.png',
  'servicio-catalogo': '/images/agencia-shopify/servicio-catalogo-yiYYfxIPW9@1x.png',
  'servicio-checkout': '/images/agencia-shopify/servicio-checkout-SyZ2uJkUb8@1x.png',
};

function str(block: ServicioBlock, key: string): string {
  const value = block[key];
  return typeof value === 'string' ? value : '';
}

function IllustrationSlot({
  slot,
  imageUrl,
  size = 'card',
}: {
  slot?: string;
  imageUrl?: string;
  size?: 'hero' | 'card';
}) {
  const src = imageUrl || (slot ? SLOT_IMAGES[slot] : undefined);
  if (!src) {
    return (
      <div
        data-illustration-slot={slot || 'empty'}
        aria-hidden="true"
        className="w-full max-w-[200px] h-[180px] mx-auto rounded-2xl border border-dashed border-[#C4B5D4] bg-white/50"
      />
    );
  }
  if (size === 'hero') {
    return (
      <div
        data-illustration-slot={slot || 'hero'}
        className="relative w-full min-h-[280px] md:min-h-[360px] overflow-hidden rounded-[32px]"
      >
        <Image
          src={publicWebpIfPresent(src)}
          alt={resolveImageAlt(src)}
          width={552}
          height={360}
          priority
          fetchPriority="high"
          sizes="(min-width: 1024px) 552px, calc(100vw - 2rem)"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    );
  }
  return (
    <div
      data-illustration-slot={slot || 'card'}
      className="relative w-full max-w-[200px] h-[180px] mx-auto overflow-hidden rounded-2xl"
    >
      <Image
        src={publicWebpIfPresent(src)}
        alt={resolveImageAlt(src)}
        width={200}
        height={180}
        sizes="200px"
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
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

function ZelleParagraph() {
  return (
    <p className="playful-contenido-p max-w-3xl mx-auto text-center">
      Si tu checkout también cobra en Venezuela, te contamos cómo integrar{' '}
      <Link
        href={ZELLE_BLOG_POST_HREF}
        className="text-[#440099] font-semibold underline underline-offset-2"
      >
        Zelle como método de pago en tu ecommerce
      </Link>
      .
    </p>
  );
}

function renderBlock(
  block: ServicioBlock,
  index: number,
  shopifyCases: ReturnType<typeof toShopifyCaseCards>,
  blogPosts: Awaited<ReturnType<typeof getLatestBlogPosts>>,
) {
  switch (block.blockType) {
    case 'hero':
      return (
        <section key={index} data-cta-section="hero" className="relative overflow-hidden">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 pt-4 pb-16 md:pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <h1 className="playful-h1 text-[36px] leading-[42px] md:text-[45px] md:leading-[52px] lg:text-[56px] lg:leading-[1.1]">
                  {str(block, 'h1')}
                </h1>
                <p className="playful-contenido-p">{str(block, 'body')}</p>
                <div className="space-y-3">
                  <a
                    href={str(block, 'ctaHref')}
                    className="playful-boton !text-[14px] !leading-[18px] md:!text-base md:!leading-normal"
                  >
                    {str(block, 'ctaLabel')}
                  </a>
                  {str(block, 'subline') ? (
                    <p className="playful-contenido-p">{str(block, 'subline')}</p>
                  ) : null}
                  {str(block, 'contactLinkHref') ? (
                    <p className="playful-contenido-p">
                      <Link
                        href={str(block, 'contactLinkHref')}
                        className="text-[#440099] font-semibold underline underline-offset-2"
                      >
                        {str(block, 'contactLinkLabel') || 'Contacto'}
                      </Link>
                    </p>
                  ) : null}
                </div>
              </div>
              <IllustrationSlot
                slot={str(block, 'illustrationSlot') || 'hero'}
                imageUrl={str(block, 'imageUrl1x')}
                size="hero"
              />
            </div>
          </div>
        </section>
      );
    case 'tarjetas': {
      const items = Array.isArray(block.items) ? block.items : [];
      return (
        <section key={index} className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="playful-contenedor playful-contenedor-FFEFD1 rounded-[32px] md:rounded-[48px]">
            {str(block, 'h2') ? <h2 className="playful-h2 text-center">{str(block, 'h2')}</h2> : null}
            {str(block, 'intro') ? (
              <p className="playful-contenido-p max-w-3xl mx-auto text-center">{str(block, 'intro')}</p>
            ) : null}
            {str(block, 'extraParagraph') ? <ZelleParagraph /> : null}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-4">
              {items.map((raw, itemIndex) => {
                if (!raw || typeof raw !== 'object') return null;
                const item = raw as Record<string, unknown>;
                const colorKey = typeof item.cardColor === 'string' ? item.cardColor : 'none';
                return (
                  <article
                    key={itemIndex}
                    className={`${CARD_COLOR_CLASS[colorKey] || CARD_COLOR_CLASS.none} rounded-[32px] shadow-lg p-8 md:p-10 flex flex-col`}
                  >
                    <div className="mb-6">
                      <IllustrationSlot
                        slot={typeof item.illustrationSlot === 'string' ? item.illustrationSlot : undefined}
                        imageUrl={typeof item.imageUrl === 'string' ? item.imageUrl : undefined}
                      />
                    </div>
                    <h3 className="playful-h3 mb-4">{String(item.title || '')}</h3>
                    <p className="playful-contenido-p flex-1">{String(item.body || '')}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      );
    }
    case 'bandaMorada':
      return null;
    case 'cimaBreaker':
      return <CimaBreaker key={index} variant="shopify" />;
    case 'logosCasos':
      return (
        <section key={index} className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
          {str(block, 'h2') ? <h2 className="playful-h2 text-center mb-10">{str(block, 'h2')}</h2> : null}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8">
            {shopifyCases.map((caseStudy) => (
              <CaseStudyCard
                key={caseStudy.slug}
                caseStudy={caseStudy}
                sizes={CASE_FEATURE_CARD_SIZES}
              />
            ))}
          </div>
          <div className="bg-white rounded-3xl shadow-lg overflow-hidden w-full flex flex-col justify-center items-center text-center p-6 md:p-10">
            <div className="w-20 h-20 relative mb-4">
              <Image
                src="/images/avatar-playful.svg"
                alt={resolveImageAlt('/images/avatar-playful.svg', 'Avatar Playful')}
                fill
                className="object-contain"
              />
            </div>
            <h4 className="font-semibold text-lg mb-2 text-[#4A4453]">{str(block, 'attribution')}</h4>
            <div className="flex justify-center mb-4">
              <div className="text-yellow-400 text-xl">
                {Array.from({ length: 5 }).map((_, star) => (
                  <span key={star}>★</span>
                ))}
              </div>
            </div>
            <p className="text-sm md:text-base px-2 text-[#4A4453]">«{str(block, 'quote')}»</p>
          </div>
        </section>
      );
    case 'ventajas': {
      const items = Array.isArray(block.items) ? block.items : [];
      return (
        <section key={index} className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="playful-contenedor playful-contenedor-B3FFF3 rounded-[32px] md:rounded-[48px] !mt-0">
            {str(block, 'h2') ? <h2 className="playful-h2 text-center">{str(block, 'h2')}</h2> : null}
            <div className="space-y-6 max-w-4xl mx-auto">
              {items.map((raw, itemIndex) => {
                if (!raw || typeof raw !== 'object') return null;
                const item = raw as Record<string, unknown>;
                const lead = typeof item.lead === 'string' ? item.lead : '';
                const body = typeof item.body === 'string' ? item.body : '';
                return (
                  <p key={itemIndex} className="playful-contenido-p">
                    {lead ? <strong className="font-bold">{lead}</strong> : null}{' '}
                    {body.includes(PORTFOLIO_URL) ? <LinkedCopy text={body} /> : body}
                  </p>
                );
              })}
            </div>
          </div>
        </section>
      );
    }
    case 'faq': {
      const items = Array.isArray(block.items) ? block.items : [];
      return (
        <section key={index} className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
          {str(block, 'h2') ? <h2 className="playful-h2 text-center mb-10">{str(block, 'h2')}</h2> : null}
          <div className="max-w-4xl mx-auto">
            <ServiceFaqAccordion
              items={items.map((raw) => {
                const item = raw as Record<string, unknown>;
                const question = typeof item.question === 'string' ? item.question : '';
                const answer = typeof item.answer === 'string' ? item.answer : '';
                return {
                  question,
                  answer: <LinkedCopy text={answer} />,
                };
              })}
            />
          </div>
        </section>
      );
    }
    case 'moduloExtra':
      if (block.kind === 'testimonials') {
        return (
          <section key={index} className="py-12">
            <div className="max-w-[1200px] mx-auto px-4 md:px-6">
              <TestimonialsSection />
            </div>
          </section>
        );
      }
      if (block.kind === 'relatedBlog') {
        return (
          <section key={index} className="py-12">
            <div className="max-w-[1200px] mx-auto px-4 md:px-6">
              <BlogRelatedPostsSection posts={blogPosts} />
            </div>
          </section>
        );
      }
      return null;
    case 'cta':
      return (
        <section key={index} className="py-12">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6">
            <TwoColumnCtaSection
              contentBgColor={str(block, 'contentBgColor') || '#B3FFF3'}
              imageUrl={str(block, 'imageUrl') || '/images/imagen-nueva-cta-home.png'}
              title={str(block, 'h2')}
              subtitle={str(block, 'body')}
              ctaTitle={str(block, 'question')}
              buttonText={str(block, 'buttonLabel')}
              buttonLink={str(block, 'buttonHref')}
            />
          </div>
        </section>
      );
    default:
      return null;
  }
}

export default async function AgenciaShopifyFromPayload({ doc }: { doc: ServicioDoc }) {
  const blocks = doc.bloques || [];
  const hero = blocks.find((b) => b.blockType === 'hero');
  const heroSrc =
    hero && typeof hero.imageUrl1x === 'string'
      ? hero.imageUrl1x
      : '/images/agencia-shopify/hero-gORwV7MSXO@1x.png';
  const heroSrc2x =
    hero && typeof hero.imageUrl2x === 'string'
      ? hero.imageUrl2x
      : '/images/agencia-shopify/hero-gORwV7MSXO@2x.png';

  const [casosDeExito, blogPosts] = await Promise.all([
    getAllCaseStudies().catch(() => []),
    getLatestBlogPosts(6).catch(() => []),
  ]);
  const shopifyCases = toShopifyCaseCards(casosDeExito);

  type BandaGroup = { blockType: 'bandaMoradaGroup'; items: ServicioBlock[] };
  type RenderUnit = ServicioBlock | BandaGroup;

  function isBandaGroup(unit: RenderUnit): unit is BandaGroup {
    return unit.blockType === 'bandaMoradaGroup';
  }

  const units: RenderUnit[] = [];
  let bandBuffer: ServicioBlock[] = [];
  for (const block of blocks) {
    if (block.blockType === 'bandaMorada') {
      bandBuffer.push(block);
      continue;
    }
    if (bandBuffer.length) {
      units.push({ blockType: 'bandaMoradaGroup', items: bandBuffer });
      bandBuffer = [];
    }
    units.push(block);
  }
  if (bandBuffer.length) {
    units.push({ blockType: 'bandaMoradaGroup', items: bandBuffer });
  }

  return (
    <>
      <link
        rel="preload"
        as="image"
        href={publicWebpIfPresent(heroSrc)}
        imageSrcSet={`${publicWebpIfPresent(heroSrc)} 552w, ${publicWebpIfPresent(heroSrc2x)} 1104w`}
        imageSizes="(min-width: 1024px) 552px, calc(100vw - 2rem)"
      />
      <article className="w-full pb-20">
        {units.map((unit, index) => {
          if (isBandaGroup(unit)) {
            return (
              <section key={index} className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
                <div className="space-y-6 md:space-y-8">
                  {unit.items.map((band, bandIndex) => (
                    <PurpleBand
                      key={bandIndex}
                      title={str(band, 'h2')}
                      body={str(band, 'body')}
                    />
                  ))}
                </div>
              </section>
            );
          }
          return renderBlock(unit, index, shopifyCases, blogPosts);
        })}
      </article>
    </>
  );
}
