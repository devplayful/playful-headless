/**
 * SoyTechno page wrap from Contento add-ons (playful-copy PR #54).
 * Recommendation A. Do not invent copy. CIMA body stays in soytechno-case-study.ts.
 *
 * SEO pack v4 locked 20 sep 2026. Title/H1 unchanged from v3; meta and H2s replaced.
 * Do not use the rejected WhatsApp→formal pack or v3 H2s.
 */

export const SOYTECHNO_SEO = {
  title: 'SOYTECHNO: Transformación 100% Centrada en el Usuario',
  description:
    'SOYTECHNO necesitaba transformar su presencia digital en una plataforma de alto rendimiento. El desafío no era solo vender, sino crear una experiencia de E-commerce con la funcionalidad y la robustez de una aplicación.',
};

/** Visible H1 from Figma node 3798:11672. */
export const SOYTECHNO_H1 = 'SOYTECHNO: Transformación 100% Centrada en el Usuario';

export const SOYTECHNO_CTA = {
  headline:
    'Crear tienda online en Venezuela cuando tu marca aún vende fuera de plataforma',
  preamble:
    'Si tu marca vende online en Venezuela y necesita una plataforma que resuelva pagos multimoneda, logística rastreable y atención automatizada, podemos revisar juntos cómo construirla.',
  buttonLabel: 'Agenda una reunión con Playful',
  href: 'https://playfulagency.com/reunion-playful',
  illustration: '/images/casos/soytechno/cta-illustration.png',
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
  headline: SOYTECHNO_H1,
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
