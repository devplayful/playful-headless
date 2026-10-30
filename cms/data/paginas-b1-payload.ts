export const POLITICA_PRIVACIDAD_SLUG = 'politica-de-privacidad';
export const PAGINAS_B1_BLOQUE = 'b1';

export const POLITICA_PRIVACIDAD_SEO = {
  title: 'Política de Privacidad | Playful Agency',
  description:
    'Conoce cómo protegemos tu información personal en Playful Agency. Política de privacidad actualizada.',
} as const;

/** Campos congelados del hero (29 oct / main). */
export const POLITICA_PRIVACIDAD_HERO = {
  kicker: 'Playful Agency',
  title: 'Protegemos tu Identidad: Seguridad y Confianza para Tus Datos',
  lead:
    'Tu privacidad y la seguridad de tus datos son una prioridad para nosotros. En esta sección, te ofrecemos información clara y detallada sobre nuestras prácticas de manejo de datos, seguridad y tus derechos como usuario. Nuestro compromiso es generar confianza en cada interacción.',
  leadBoldPhrase: 'Nuestro compromiso es generar confianza',
  updatedLabel: 'Última actualización: 17 de octubre de 2024',
  imageSrc: '/images/politica-privacidad-imagen.png',
  imageAlt: 'Ilustración de persona leyendo política de privacidad',
} as const;

/** Identificador de versión del cuerpo legal (el JSX congelado en PoliticaPrivacidadView). */
export const POLITICA_PRIVACIDAD_BODY_VERSION = 'politica-privacidad-body-v1';

/** SHA-256 del snapshot congelado (hero + SEO + bodyVersion); no recalcular en runtime Edge. */
export const POLITICA_PRIVACIDAD_CONTENT_CHECKSUM =
  '0c87d182de00e7d214883fb6e1fa4072426af10b5a76d642d6b27c377939d32d';

export function politicaPrivacidadPayloadBody() {
  return {
    titulo: 'Política de Privacidad',
    slug: POLITICA_PRIVACIDAD_SLUG,
    bloque: PAGINAS_B1_BLOQUE,
    content: {
      bodyVersion: POLITICA_PRIVACIDAD_BODY_VERSION,
      hero: POLITICA_PRIVACIDAD_HERO,
      checksum: POLITICA_PRIVACIDAD_CONTENT_CHECKSUM,
    },
    yoast: {
      title: POLITICA_PRIVACIDAD_SEO.title,
      description: POLITICA_PRIVACIDAD_SEO.description,
      canonical: 'https://playfulagency.com/politica-de-privacidad',
    },
  };
}

export const PAGINAS_B1_SLUGS = [POLITICA_PRIVACIDAD_SLUG] as const;
export type PaginasB1Slug = (typeof PAGINAS_B1_SLUGS)[number];

export function isPaginasB1Slug(slug: string): slug is PaginasB1Slug {
  return (PAGINAS_B1_SLUGS as readonly string[]).includes(slug);
}

export function paginasB1SeedBodyForSlug(slug: PaginasB1Slug) {
  if (slug === POLITICA_PRIVACIDAD_SLUG) return politicaPrivacidadPayloadBody();
  throw new Error(`Unknown B1 slug: ${slug}`);
}
