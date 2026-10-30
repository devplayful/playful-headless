export const NOSOTROS_SLUG = 'nosotros';
export const PAGINAS_B3_BLOQUE = 'b3';

export const NOSOTROS_SEO = {
  title: 'Agencia ecommerce Playful | Nosotros',
  description:
    'Somos Playful, agencia de ecommerce especializada en diseño, desarrollo, arquitectura e integraciones para tiendas que necesitan evolucionar.',
} as const;

/** Cuerpo TSX congelado en NosotrosView (equipo sigue en WordPress). */
export const NOSOTROS_BODY_VERSION = 'nosotros-body-v1';

export const NOSOTROS_CONTENT_CHECKSUM =
  '13352851a3bc1b50101408fd61c8683656f3707529433a1a6c6b7d2d0624276c';

export function nosotrosPayloadBody() {
  return {
    titulo: 'Nosotros',
    slug: NOSOTROS_SLUG,
    bloque: PAGINAS_B3_BLOQUE,
    content: {
      bodyVersion: NOSOTROS_BODY_VERSION,
      checksum: NOSOTROS_CONTENT_CHECKSUM,
    },
    yoast: {
      title: NOSOTROS_SEO.title,
      description: NOSOTROS_SEO.description,
      canonical: 'https://playfulagency.com/nosotros',
    },
  };
}

export const PAGINAS_B3_SLUGS = [NOSOTROS_SLUG] as const;
export type PaginasB3Slug = (typeof PAGINAS_B3_SLUGS)[number];

export function isPaginasB3Slug(slug: string): slug is PaginasB3Slug {
  return (PAGINAS_B3_SLUGS as readonly string[]).includes(slug);
}

export function paginasB3SeedBodyForSlug(slug: PaginasB3Slug) {
  if (slug === NOSOTROS_SLUG) return nosotrosPayloadBody();
  throw new Error(`Unknown B3 slug: ${slug}`);
}
