/**
 * Datos de seed para /agencia-shopify (desde copy.ts del código, sin cambiar copy).
 */
import {
  CTA,
  FAQ,
  HERO,
  MIGRATION,
  SERVICES,
  SHOPIFY_META,
  SOCIAL_PROOF,
  WHY_US,
} from '../../app/(frontend)/agencia-shopify/copy.ts';
import { SERVICE_BOOKING_HREF, CONTACT_HREF } from '../../utils/booking.ts';
import type { ServicioBlock } from '../../lib/cms-servicios.ts';

const SHOPIFY_WP_ID = -72001;

const CARD_COLORS = ['purple', 'yellow', 'mint', 'pink'] as const;

export function agenciaShopifyPayloadBlocks(): ServicioBlock[] {
  const gridItems = SERVICES.items.filter((item) => item.slot !== null);
  const bandItems = SERVICES.items.filter((item) => item.slot === null);

  const blocks: ServicioBlock[] = [
    {
      blockType: 'hero',
      h1: HERO.h1,
      body: HERO.body,
      subline: HERO.subline,
      ctaLabel: HERO.cta,
      ctaHref: SERVICE_BOOKING_HREF,
      contactLinkLabel: 'O escríbenos por el formulario',
      contactLinkHref: CONTACT_HREF,
      illustrationSlot: 'hero',
      imageUrl1x: '/images/agencia-shopify/hero-gORwV7MSXO@1x.png',
      imageUrl2x: '/images/agencia-shopify/hero-gORwV7MSXO@2x.png',
    },
    {
      blockType: 'tarjetas',
      h2: SERVICES.h2,
      intro: SERVICES.intro,
      extraParagraph:
        'Si tu checkout también cobra en Venezuela, te contamos cómo integrar Zelle como método de pago en tu ecommerce.',
      items: gridItems.map((item, index) => ({
        title: item.title,
        body: item.body,
        illustrationSlot: item.slot,
        cardColor: CARD_COLORS[index % CARD_COLORS.length],
      })),
    },
    ...bandItems.map((item) => ({
      blockType: 'bandaMorada' as const,
      h2: item.title,
      body: item.body,
    })),
    {
      blockType: 'bandaMorada',
      h2: MIGRATION.h2,
      body: MIGRATION.body,
    },
    { blockType: 'cimaBreaker', variant: 'shopify' },
    {
      blockType: 'logosCasos',
      h2: SOCIAL_PROOF.h2,
      quote: SOCIAL_PROOF.quote,
      attribution: SOCIAL_PROOF.attribution,
      caseSlugs: [
        { slug: 'odwalla-shopify-dtc-ecommerce' },
        { slug: 'jumex-shopify-dtc-ecommerce' },
      ],
    },
    {
      blockType: 'ventajas',
      h2: WHY_US.h2,
      items: WHY_US.items.map((item) => ({
        lead: item.lead,
        body: item.body,
      })),
    },
    {
      blockType: 'faq',
      h2: FAQ.h2,
      items: FAQ.items.map((item) => ({
        question: item.question,
        answer: item.answer,
      })),
    },
    { blockType: 'moduloExtra', kind: 'testimonials' },
    { blockType: 'moduloExtra', kind: 'relatedBlog' },
    {
      blockType: 'cta',
      h2: CTA.h2,
      body: CTA.body,
      question: CTA.question,
      buttonLabel: CTA.cta,
      buttonHref: SERVICE_BOOKING_HREF,
      imageUrl: '/images/imagen-nueva-cta-home.png',
      contentBgColor: '#B3FFF3',
    },
  ];

  return blocks;
}

export function agenciaShopifyPayloadData() {
  return {
    titulo: 'Agencia Shopify',
    slug: 'agencia-shopify',
    wpId: SHOPIFY_WP_ID,
    h1: HERO.h1,
    estado: 'publish',
    bloques: agenciaShopifyPayloadBlocks(),
    yoast: {
      title: SHOPIFY_META.title,
      description: SHOPIFY_META.description,
      canonical: `https://playfulagency.com${SHOPIFY_META.path}`,
      ogTitle: SHOPIFY_META.title,
      ogDescription: SHOPIFY_META.description,
    },
  };
}

export const AGENCIA_SHOPIFY_SLUG = 'agencia-shopify';
