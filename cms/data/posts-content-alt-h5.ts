/**
 * Alts SEO fase H5 (29 oct 2026): lista cerrada para cuerpo de posts en Payload.
 * Fuente: alts.csv + alts-aplicados.log (23 oct). Criterio B: overrides en import/seed.
 */
import type { ContentAltOverride } from '../lib/post-content-images.ts';

/** Criterio B: no estaban en WP (Elementor) o fuera del lote del 23 oct. */
export const POST_CONTENT_ALT_OVERRIDES_H5: ContentAltOverride[] = [
  {
    wpId: 68061,
    srcContains: 'BANNER-CTA_PLAYFUL_¿Quieres-destacar-tu-negocio-en-la-web',
    alt: 'Banner de Playful Agency: ¿quieres destacar tu negocio en la web?',
  },
  {
    wpId: 68030,
    srcContains: 'Posiciona-tu-pagina-con-contenido-optimizado-y-de-calidad',
    alt: 'Posiciona tu página con contenido optimizado y de calidad',
  },
  {
    wpId: 68030,
    srcContains: 'Herramienta-SEO-3.png',
    alt: 'Banner de Playful Agency: expertos en SEO para mejorar los enlaces de tu sitio web',
  },
  {
    wpId: 66717,
    srcContains: 'Herramienta-SEO-2.png',
    alt: 'Banner de Playful Agency sobre cómo hacer una auditoría SEO',
  },
];

/** Fila 33: solo si la URL pública del post responde 200 (no 301/404). */
export const POST_CONTENT_ALT_OVERRIDE_66684_H5: ContentAltOverride = {
  wpId: 66684,
  srcContains: 'Herramienta-SEO-3.png',
  alt: 'Banner de Playful Agency: expertos en SEO para posicionar tu página web',
};

export const POST_66684_PUBLIC_PATH = '/blog/seo/7-consejos-seo-para-posicionar-tu-pagina';

/**
 * Expectativas criterio A: filas OK en alts-aplicados.log (23 oct), excl. destacada (n=42)
 * y posts fuera de lista (1-2, 22, 37, 12-13, 42-46). valor_nuevo literal del CSV.
 */
export type ExpectedPostContentAlt = {
  wpId: number;
  slug: string;
  csvRow: number;
  srcContains: string;
  alt: string;
};

export const CRITERION_A_EXPECTED_ALTS: ExpectedPostContentAlt[] = [
  { wpId: 66828, slug: 'publicidad-digital-en-tu-negocio', csvRow: 3, srcContains: 'BANNER-CTA-PLAYFUL-Te-gustaria-invertir-en-publicidad-digital', alt: 'Banner de Playful Agency: ¿te gustaría invertir en publicidad digital para tu negocio?' },
  { wpId: 77848, slug: 'por-que-debes-hacer-publicidad-digital-en-tu-negocio', csvRow: 4, srcContains: 'Conocer-los-tipos-de-publicidad-te-permitira-implementar-mejor-tus-estrategias', alt: 'Tipos de publicidad digital: conocerlos te permite implementar mejor tus estrategias' },
  { wpId: 77848, slug: 'por-que-debes-hacer-publicidad-digital-en-tu-negocio', csvRow: 5, srcContains: 'Debes-realizar-un-estudio-para-saber-que-plataforma-digital', alt: 'Estudio previo para elegir la plataforma digital con la que llegar a tus consumidores' },
  { wpId: 80288, slug: 'como-verificar-la-veracidad-del-contenido-creado-con-herramientas-de-inteligencia-artificial', csvRow: 6, srcContains: 'Detectores-de-textos-generados-por-IA', alt: 'Detectores de textos generados por inteligencia artificial para verificar contenido' },
  { wpId: 70750, slug: 'rich-snippet-ayuda-a-optimizar-tu-web', csvRow: 14, srcContains: 'BANNER-CTA_PLAYFUL_Te-gustaria-aplicar-Rich-Snippet', alt: 'Banner de Playful Agency: ¿te gustaría aplicar rich snippets en tu sitio web?' },
  { wpId: 69096, slug: 'conoce-todo-sobre-instagram-ads', csvRow: 15, srcContains: 'BANNER-CTA_PLAYFUL_Quieres-conocer-todo-sobre-Instagram-ADS', alt: 'Banner de Playful Agency: ¿quieres conocer todo sobre Instagram Ads?' },
  { wpId: 68261, slug: 'descubre-todo-lo-que-el-posicionamiento-sem-tiene-para-ti', csvRow: 16, srcContains: 'Herramienta-SEO-1.png', alt: 'Banner de Playful Agency sobre herramientas SEO y SEM para posicionar tu web' },
  { wpId: 68207, slug: 'aprende-todo-sobre-el-seo', csvRow: 17, srcContains: 'Herramienta-SEO-3.png', alt: 'Banner de Playful Agency: contrata expertos en SEO para destacar en la web' },
  { wpId: 68096, slug: 'whatsapp-business', csvRow: 18, srcContains: 'whatsapp-contenido.jpg', alt: 'WhatsApp Business App para mejorar la relación con tus clientes' },
  { wpId: 67970, slug: 'diseno-web-y-posicionamiento-seo', csvRow: 23, srcContains: 'El-Texto.png', alt: 'El texto con keywords de calidad como base del SEO en el diseño web' },
  { wpId: 67970, slug: 'diseno-web-y-posicionamiento-seo', csvRow: 24, srcContains: 'Herramienta-SEO-1.png', alt: 'Banner de Playful Agency sobre tecnología y estrategia SEO para tu diseño web' },
  { wpId: 67910, slug: 'como-aprovechar-el-email-marketing-y-las-redes-sociales', csvRow: 25, srcContains: '2-CTA.png', alt: 'Banner de Playful Agency: servicios de email marketing para tu negocio' },
  { wpId: 67890, slug: '5-plataformas-para-email-marketing-efectivo', csvRow: 26, srcContains: '2-CTA.png', alt: 'Banner de Playful Agency: servicios de email marketing para tu negocio' },
  { wpId: 67835, slug: 'aprende-como-hacer-un-estrategia-digital-de-email-marketing', csvRow: 28, srcContains: '3-CTA.png', alt: 'Banner de Playful Agency: aprende a hacer email marketing y medir su ROI' },
  { wpId: 66786, slug: 'tipos-de-publicidad-online', csvRow: 30, srcContains: '4-CTA.png', alt: 'Banner de Playful Agency sobre publicidad online para tu estrategia de marketing' },
  { wpId: 66696, slug: 'que-es-data-studio-de-google-y-como-funciona', csvRow: 32, srcContains: 'BANNER-CTA_PLAYFUL_DataStudio', alt: 'Banner de Playful Agency sobre Data Studio para auditorías SEO' },
  { wpId: 66674, slug: 'seo-y-sem-que-son-y-en-que-se-diferencian', csvRow: 34, srcContains: 'undraw_product_teardown_elol', alt: 'Ilustración de estrategias SEO para posicionar un sitio web' },
  { wpId: 66674, slug: 'seo-y-sem-que-son-y-en-que-se-diferencian', csvRow: 35, srcContains: 'Por-que-posicionar-en-la-web', alt: 'Por qué posicionar tu marca en la web con SEM' },
  { wpId: 66674, slug: 'seo-y-sem-que-son-y-en-que-se-diferencian', csvRow: 36, srcContains: 'Herramienta-SEO-3.png', alt: 'Banner de Playful Agency sobre posicionamiento SEO y SEM' },
  { wpId: 66606, slug: 'email-marketing-una-herramienta-que-no-puedes-dejar-de-usar-en-tu-empresa', csvRow: 38, srcContains: '4-CTA.png', alt: 'Banner de Playful Agency sobre email marketing para tu negocio' },
  { wpId: 66600, slug: 'estrategia-de-email-marketing', csvRow: 39, srcContains: '3-CTA.png', alt: 'Banner de Playful Agency: estrategia de email marketing y retorno de inversión' },
  { wpId: 66590, slug: 'seguir-los-reglamentos-te-hara-evitar-una-penalizacion', csvRow: 40, srcContains: '2-CTA.png', alt: 'Banner de Playful Agency: reglas de email marketing para evitar penalizaciones' },
  { wpId: 66573, slug: 'email-marketing-beneficio-que-te-generara-ingresos', csvRow: 41, srcContains: '1-CTA-.png', alt: 'Banner de Playful Agency: email marketing que genera ingresos' },
];

/** Posts únicos del criterio A (visible / 200, OK en log 23 oct). */
export const CRITERION_A_UNIQUE_POST_COUNT = new Set(CRITERION_A_EXPECTED_ALTS.map((e) => e.wpId)).size;

export function activeH5ContentAltOverrides(include66684: boolean): ContentAltOverride[] {
  const list = [...POST_CONTENT_ALT_OVERRIDES_H5];
  if (include66684) list.push(POST_CONTENT_ALT_OVERRIDE_66684_H5);
  return list;
}
