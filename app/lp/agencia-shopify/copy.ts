import type { ContentPlaceholder } from '../_lib/placeholders';
import { LP_META_ANGLE_TITLES } from './angles.js';
import type { LpMetaMarket } from './variants';

export const LP_META_SHOPIFY_META = {
  title: 'Agencia Shopify — landing Meta Ads (staging) | Playful',
  description:
    'Landing Meta Ads /lp/agencia-shopify. Copy sin firmar. Tráfico pagado, noindex.',
  path: '/lp/agencia-shopify',
} as const;

export const LP_META_PROOF_CASES = [
  {
    slug: 'odwalla-shopify-dtc-ecommerce',
    href: '/casos-de-exito/odwalla-shopify-dtc-ecommerce',
    label: 'Odwalla',
    image: '/casos/Tapa-Caso-de-exito-Odwalla.png',
  },
  {
    slug: 'jumex-shopify-dtc-ecommerce',
    href: '/casos-de-exito/jumex-shopify-dtc-ecommerce',
    label: 'Jumex',
    image: '/casos/Tapa-Caso-de-exito-JUMEX-US.png',
  },
  {
    slug: 'soytechno-ecommerce-venezuela',
    href: '/casos-de-exito/soytechno-ecommerce-venezuela',
    label: 'SoyTechno',
    image: '/images/casos/soytechno/images/lifestyle-f.jpg',
  },
] as const;

/** H1 por ángulo. Sale de angles.js; no listar slugs aquí. */
export const LP_META_HERO_TITLES: Record<string, ContentPlaceholder> = LP_META_ANGLE_TITLES;

export const LP_META_HERO_SUBTITLES: Record<LpMetaMarket, ContentPlaceholder> = {
  es: {
    tag: 'subtítulo hero ES',
    note: 'Subtítulo con el filtro «marcas D2C». Vocabulario ES: «tienda online», «facturación», tú.',
  },
  latam: {
    tag: 'subtítulo hero LatAm',
    note: 'Subtítulo con el filtro «marcas D2C». Vocabulario LatAm: «tienda en línea» / «ecommerce», «ventas», tú (en CO, valorar «usted» [SIN VERIFICAR]).',
  },
  ve: {
    tag: 'subtítulo hero VE',
    note: 'Misma base LatAm. Venezuela: bloque de cobro local solo con el GO de José [PERMISO JOSÉ PENDIENTE]. Prueba: SoyTechno.',
  },
};

export const LP_META_CTA_PRIMARY: ContentPlaceholder = {
  tag: 'CTA principal (reunión)',
  note: 'Una sola llamada a la acción de conversión. Lleva a /reunion-playful conservando toda la query string (utm_*, fbclid, ang, mkt).',
};

export const LP_META_CTA_SECONDARY: ContentPlaceholder = {
  tag: 'CTA secundario de texto',
  note: 'Navegación interna de bajo compromiso: ver un caso o un diagnóstico sin formulario. No pide datos. Conserva la query string.',
};

export const LP_META_CTA_STICKY: ContentPlaceholder = {
  tag: 'CTA sticky (reunión)',
  note: 'En móvil, botón sticky inferior a partir del bloque 2. También en escritorio. Mismo destino /reunion-playful y misma query string.',
};

export const LP_META_PROBLEM_HEAD: ContentPlaceholder = {
  tag: 'H2 — problema',
  note: '3 dolores del buyer, con el del ángulo primero. Reconocerse.',
};

export const LP_META_PAINS_ES: [ContentPlaceholder, ContentPlaceholder, ContentPlaceholder] = [
  {
    tag: 'dolor 1 ES',
    note: 'Primer dolor del buyer (marcas D2C). En el ángulo activo este bloque se reordena para ir primero.',
  },
  {
    tag: 'dolor 2 ES',
    note: 'Segundo dolor del buyer. Vocabulario ES: tienda online, facturación.',
  },
  {
    tag: 'dolor 3 ES',
    note: 'Tercer dolor del buyer. Desalentar tráfico DIY, de plantillas y de dropshipping.',
  },
];

export const LP_META_PAINS_LATAM: [ContentPlaceholder, ContentPlaceholder, ContentPlaceholder] = [
  {
    tag: 'dolor 1 LatAm',
    note: 'Tres dolores (vocabulario LatAm: tienda en línea / ecommerce, ventas). El del ángulo va primero.',
  },
  {
    tag: 'dolor 2 LatAm',
    note: 'Segundo dolor LatAm. Tú (en CO, valorar usted [SIN VERIFICAR]).',
  },
  {
    tag: 'dolor 3 LatAm',
    note: 'Tercer dolor LatAm. Sin DIY, plantillas ni dropshipping.',
  },
];

const DEFAULT_PAIN_ORDER: [number, number, number] = [0, 1, 2];

export const LP_META_PAIN_ORDER: Record<string, [number, number, number]> = {
  generic: [0, 1, 2],
  c1: [0, 1, 2],
  c2: [1, 0, 2],
  c3: [2, 0, 1],
  c4: [0, 2, 1],
  c5: [1, 2, 0],
};

export function painOrderForAngle(ang: string): [number, number, number] {
  return LP_META_PAIN_ORDER[ang] ?? DEFAULT_PAIN_ORDER;
}

export const LP_META_STORES_HEAD: ContentPlaceholder = {
  tag: 'H2 — hacemos tiendas',
  note: 'Qué hacemos y qué no. Shopify / D2C: diseño, desarrollo, migración e integraciones; sin CRO ni infoproducto.',
};

export const LP_META_SERVICES: ContentPlaceholder[] = [
  { tag: 'servicio diseño', note: 'Shopify / D2C: diseño. Una línea. Común a ES y LatAm; ajuste de vocabulario en LatAm.' },
  { tag: 'servicio desarrollo', note: 'Shopify / D2C: desarrollo. Una línea.' },
  { tag: 'servicio migración', note: 'Shopify / D2C: migración. Una línea.' },
  { tag: 'servicio integraciones', note: 'Shopify / D2C: integraciones. Una línea.' },
  { tag: 'qué no hacemos', note: 'Sin CRO ni infoproducto. Filtro de buyer visible.' },
];

export const LP_META_PROOF_HEAD: ContentPlaceholder = {
  tag: 'H2 — prueba',
  note: 'Casos Odwalla, Jumex y SoyTechno, sello CIMA 2026. En la landing se pueden usar porque ya están publicadas; se confirma con José [PERMISO JOSÉ PENDIENTE]. Sin cifras inventadas.',
};

export const LP_META_PROOF_FOOT: Record<(typeof LP_META_PROOF_CASES)[number]['slug'], ContentPlaceholder> = {
  'odwalla-shopify-dtc-ecommerce': {
    tag: 'pie caso Odwalla',
    note: 'Pie del caso Odwalla (Shopify D2C, cita de plazos). Fuente: /casos-de-exito/odwalla-shopify-dtc-ecommerce. [PERMISO JOSÉ PENDIENTE]',
  },
  'jumex-shopify-dtc-ecommerce': {
    tag: 'pie caso Jumex',
    note: 'Pie del caso Jumex. Fuente: /casos-de-exito/jumex-shopify-dtc-ecommerce. [PERMISO JOSÉ PENDIENTE]',
  },
  'soytechno-ecommerce-venezuela': {
    tag: 'pie caso SoyTechno',
    note: 'Pie del caso SoyTechno (Venezuela). Fuente: /casos-de-exito/soytechno-ecommerce-venezuela. [PERMISO JOSÉ PENDIENTE]',
  },
};

export const LP_META_FEATURED_CASE_NOTE: Record<string, ContentPlaceholder> = {
  generic: {
    tag: 'caso destacado genérico',
    note: 'ES: CIMA 2026, Odwalla. LatAm: Jumex (MX/US), Odwalla, SoyTechno (LatAm). VE: SoyTechno.',
  },
  c1: { tag: 'caso destacado C1', note: '[definir con el creativo final]' },
  c2: { tag: 'caso destacado C2', note: '[definir con el creativo final]' },
  c3: { tag: 'caso destacado C3', note: '[definir con el creativo final]' },
  c4: { tag: 'caso destacado C4', note: '[definir con el creativo final]' },
  c5: { tag: 'caso destacado C5', note: '[definir con el creativo final]' },
};

export function featuredCaseNoteForAngle(ang: string): ContentPlaceholder {
  return (
    LP_META_FEATURED_CASE_NOTE[ang] ||
    LP_META_FEATURED_CASE_NOTE.generic || {
      tag: `caso destacado ${ang}`,
      note: '[definir con el creativo final]',
    }
  );
}

export const LP_META_PROCESS_HEAD: ContentPlaceholder = {
  tag: 'H2 — proceso y plazos',
  note: 'Fases y plazo orientativo (solo plazos con fuente, como la cita de Odwalla). Quitar incertidumbre.',
};

export const LP_META_PROCESS_ITEMS: ContentPlaceholder[] = [
  { tag: 'fase 1', note: 'Fases y plazos con fuente. Sin cifras inventadas.' },
  { tag: 'fase 2', note: 'Fases y plazos con fuente. Sin cifras inventadas.' },
  { tag: 'fase 3', note: 'Fases y plazos con fuente. Cita de plazos de Odwalla solo si José lo aprueba.' },
];

export const LP_META_TEAM_HEAD: ContentPlaceholder = {
  tag: 'H2 — equipo',
  note: 'José y el equipo; fotos reales, sin stock. Bio corta.',
};

export const LP_META_TEAM_BIO: ContentPlaceholder = {
  tag: 'bio corta equipo',
  note: 'Personas reales. Foto de José local; resto sin stock. Bio corta común.',
};

export const LP_META_FAQ_HEAD: ContentPlaceholder = {
  tag: 'H2 — FAQ',
  note: '5 a 7 preguntas. Precio orientativo o rango (si José lo aprueba), plazos, Shopify o no, países, idioma y huso.',
};

export const LP_META_FAQ_COMMON: { question: ContentPlaceholder; answer: ContentPlaceholder }[] = [
  {
    question: { tag: 'FAQ 1 — pregunta plazos', note: 'Objeción plazos.' },
    answer: { tag: 'FAQ 1 — respuesta plazos', note: 'Plazos. Cifras solo con fuente.' },
  },
  {
    question: { tag: 'FAQ 2 — pregunta Shopify o no', note: 'Objeción Shopify o no.' },
    answer: { tag: 'FAQ 2 — respuesta Shopify o no', note: 'Shopify / D2C. Sin CRO ni infoproducto.' },
  },
  {
    question: { tag: 'FAQ 3 — pregunta países', note: 'Objeción países.' },
    answer: { tag: 'FAQ 3 — respuesta países', note: 'Países e idioma.' },
  },
  {
    question: { tag: 'FAQ 4 — pregunta idioma', note: 'Objeción idioma.' },
    answer: { tag: 'FAQ 4 — respuesta idioma', note: 'Idioma de la reunión y del proyecto.' },
  },
  {
    question: { tag: 'FAQ 5 — pregunta precio', note: 'Precio orientativo o rango (si José lo aprueba). PROHIBIDO inventar cifras.' },
    answer: { tag: 'FAQ 5 — respuesta precio', note: 'Rango de precio aprobado: falta. Marcador hasta el GO de José.' },
  },
];

export const LP_META_FAQ_ES_EXTRA: { question: ContentPlaceholder; answer: ContentPlaceholder } = {
  question: { tag: 'FAQ ES — moneda y horario', note: 'Moneda EUR. Huso: «Hora de España». Huecos de mañana y tarde de Madrid.' },
  answer: { tag: 'FAQ ES — respuesta moneda y horario', note: 'EUR. No convertir a otras monedas. Horario Madrid.' },
};

export const LP_META_FAQ_LATAM_EXTRA: { question: ContentPlaceholder; answer: ContentPlaceholder } = {
  question: { tag: 'FAQ LatAm — moneda, huso e idioma', note: 'USD como referencia; no convertir a MXN, COP o CLP sin la cifra de José. Huecos de tarde de Madrid = mañana en LatAm (MX UTC−6, CO UTC−5, CL UTC−3 en verano austral [SIN VERIFICAR]). El calendario muestra la hora local del visitante [SIN VERIFICAR: comprobar que GHL detecta el huso].' },
  answer: { tag: 'FAQ LatAm — respuesta moneda, huso e idioma', note: 'USD de referencia. Huso local del visitante [SIN VERIFICAR].' },
};

export const LP_META_FAQ_VE: { question: ContentPlaceholder; answer: ContentPlaceholder } = {
  question: { tag: 'FAQ VE — cobro local', note: 'Bloque de cobro local (pago en divisas o local) solo con el GO de José [PERMISO JOSÉ PENDIENTE]. Se activa con mkt=ve.' },
  answer: { tag: 'FAQ VE — respuesta cobro local', note: '[PERMISO JOSÉ PENDIENTE]. Prueba: SoyTechno.' },
};

export const LP_META_FINAL_HEAD: ContentPlaceholder = {
  tag: 'H2 — CTA final',
  note: 'Reunión de 30 min [SIN VERIFICAR: duración real del calendario de GHL]. Microcopy de la reunión.',
};

export const LP_META_FINAL_BODY: Record<LpMetaMarket, ContentPlaceholder> = {
  es: {
    tag: 'cuerpo CTA final ES',
    note: 'Huso de España. Reunión de 30 min [SIN VERIFICAR].',
  },
  latam: {
    tag: 'cuerpo CTA final LatAm',
    note: 'Huso local. Huecos de tarde de Madrid = mañana en LatAm [SIN VERIFICAR].',
  },
  ve: {
    tag: 'cuerpo CTA final VE',
    note: 'Misma base LatAm. Sin bloque de cobro local en el CTA.',
  },
};

export const LP_META_FINAL_BUTTON: ContentPlaceholder = {
  tag: 'botón CTA final',
  note: 'Label del CTA principal. data-cta="lp-meta-final". Dispara cta_reunion_click.',
};

export const LP_META_VE_LOCAL_PAY: ContentPlaceholder = {
  tag: 'bloque cobro local VE',
  note: 'Pago en divisas o local. Solo con el GO de José [PERMISO JOSÉ PENDIENTE]. Visible si mkt=ve.',
};

export function painsForMarket(mkt: LpMetaMarket): [ContentPlaceholder, ContentPlaceholder, ContentPlaceholder] {
  return mkt === 'es' ? LP_META_PAINS_ES : LP_META_PAINS_LATAM;
}

export function faqItemsForMarket(mkt: LpMetaMarket) {
  const items = [...LP_META_FAQ_COMMON];
  if (mkt === 'es') items.push(LP_META_FAQ_ES_EXTRA);
  if (mkt === 'latam' || mkt === 've') items.push(LP_META_FAQ_LATAM_EXTRA);
  if (mkt === 've') items.push(LP_META_FAQ_VE);
  return items;
}
