export const NOT_FOUND_APP_SLUG = 'not-found';
export const NOT_FOUND_GLOBAL_SLUG = 'global-not-found';
export const PAGINAS_B5_BLOQUE = 'b5';

export const NOT_FOUND_BODY_VERSION = 'not-found-body-v1';

export const NOT_FOUND_CONTENT_CHECKSUM =
  '253a684b2d0c204d53ada5fee3857d776dfa43468a83128ad4b70f11e2b17475';

function notFoundPayloadBody(slug: typeof NOT_FOUND_APP_SLUG | typeof NOT_FOUND_GLOBAL_SLUG) {
  return {
    titulo: slug === NOT_FOUND_APP_SLUG ? '404 App Router' : '404 global',
    slug,
    bloque: PAGINAS_B5_BLOQUE,
    content: {
      bodyVersion: NOT_FOUND_BODY_VERSION,
      checksum: NOT_FOUND_CONTENT_CHECKSUM,
    },
    yoast: {
      title: 'Playful Agency - Agencia de E-commerce | Marketing Digital',
      description:
        '¿Tu e-commerce está perdiendo dinero sin que lo sepas? En Playful Agency transformamos plataformas mediocres en máquinas de conversión de alto rendimiento.',
    },
  };
}

export const PAGINAS_B5_SLUGS = [NOT_FOUND_APP_SLUG, NOT_FOUND_GLOBAL_SLUG] as const;
export type PaginasB5Slug = (typeof PAGINAS_B5_SLUGS)[number];

export function isPaginasB5Slug(slug: string): slug is PaginasB5Slug {
  return (PAGINAS_B5_SLUGS as readonly string[]).includes(slug);
}

export function paginasB5SeedBodyForSlug(slug: PaginasB5Slug) {
  if (slug === NOT_FOUND_APP_SLUG || slug === NOT_FOUND_GLOBAL_SLUG) {
    return notFoundPayloadBody(slug);
  }
  throw new Error(`Unknown B5 slug: ${slug}`);
}
