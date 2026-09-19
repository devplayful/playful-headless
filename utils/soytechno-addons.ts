/**
 * SoyTechno page wrap from Contento add-ons (playful-copy PR #54).
 * Recommendation A. Do not invent copy. CIMA body stays in soytechno-case-study.ts.
 */

export const SOYTECHNO_SEO = {
  title: 'SoyTechno: el eCommerce que entendió cómo paga y confía Venezuela',
  description:
    'Caso de éxito: SoyTechno consolidó un eCommerce D2C en Venezuela con Smart Checkout multimoneda, integración Cashea y 2,8 millones de usuarios activos en 2025.',
};

export const SOYTECHNO_CTA = {
  preamble:
    'Si tu marca vende online en Venezuela y necesita una plataforma que resuelva pagos multimoneda, logística rastreable y atención automatizada, podemos revisar juntos cómo construirla.',
  buttonLabel: 'Agenda una reunión con Playful',
  href: 'https://playfulagency.com/reunion-playful',
};

export const SOYTECHNO_SIBLING_LINKS = [
  {
    href: '/casos-de-exito/jumex-shopify-dtc-ecommerce',
    label: 'Caso Jumex: canal DTC propio para un catálogo grande en Shopify',
  },
  {
    href: '/casos-de-exito/odwalla-shopify-dtc-ecommerce',
    label: 'Caso Odwalla: de sitio informativo a tienda DTC en Shopify',
  },
] as const;

export const SOYTECHNO_TESTIMONIAL = {
  quote:
    'Se ve que la página está hecha en base a los requerimientos que nosotros teníamos y más. No sólo se quedaron con la idea de vender el producto, sino que también buscaron más soluciones, como agregar un comparador de productos para que la gente pueda verlo.',
  name: 'Eva Cristina Luciani',
  role: 'e-Commerce Manager de Soytechno.com',
};

export const SOYTECHNO_ARTICLE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'SoyTechno: El eCommerce que entendió cómo paga y confía Venezuela',
  description: SOYTECHNO_SEO.description,
  author: {
    '@type': 'Organization',
    name: 'Playful Agency',
    url: 'https://playfulagency.com',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Playful Agency',
    url: 'https://playfulagency.com',
  },
  about: {
    '@type': 'Organization',
    name: 'SoyTechno',
    url: 'https://www.soytechno.com/',
  },
  datePublished: '2026-09-19',
  url: 'https://playfulagency.com/casos-de-exito/soytechno-ecommerce-venezuela',
  mainEntityOfPage: 'https://playfulagency.com/casos-de-exito/soytechno-ecommerce-venezuela',
};
