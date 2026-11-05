export const CONTACT_SLUG = 'contactar-agencia-de-marketing-digital';
export const REUNION_PLAYFUL_SLUG = 'reunion-playful';
export const PAGINAS_B4_BLOQUE = 'b4';

export const CONTACT_SEO = {
  title: 'Contactar agencia ecommerce | Playful Agency',
  description:
    'Formulario para contactar a Playful, agencia de ecommerce. Cuéntanos tu tienda y el caso. Hablamos de tu próximo proyecto, no de una primera venta.',
} as const;

export const REUNION_PLAYFUL_SEO = {
  title: 'Reservar reunión | Playful Agency',
  description: 'Agenda una reunión de diagnóstico con Playful Agency.',
} as const;

export const CONTACT_BODY_VERSION = 'contact-body-v1';
export const REUNION_BODY_VERSION = 'reunion-body-v1';

export const CONTACT_CONTENT_CHECKSUM =
  '5c6d386afcbb18784ed109fe5606497b97b32966b0407a507e9564cb12dd3016';

export const REUNION_CONTENT_CHECKSUM =
  'f1d94b4de8de68e6973bfe5ec84d21b5f67b1c50b904b3e6c674b57fcd6e800d';

function contactPayloadBody() {
  return {
    titulo: 'Contacto',
    slug: CONTACT_SLUG,
    bloque: PAGINAS_B4_BLOQUE,
    content: {
      bodyVersion: CONTACT_BODY_VERSION,
      checksum: CONTACT_CONTENT_CHECKSUM,
    },
    yoast: {
      title: CONTACT_SEO.title,
      description: CONTACT_SEO.description,
      canonical: `https://playfulagency.com/${CONTACT_SLUG}`,
    },
  };
}

function reunionPayloadBody() {
  return {
    titulo: 'Reunión Playful',
    slug: REUNION_PLAYFUL_SLUG,
    bloque: PAGINAS_B4_BLOQUE,
    content: {
      bodyVersion: REUNION_BODY_VERSION,
      checksum: REUNION_CONTENT_CHECKSUM,
    },
    yoast: {
      title: REUNION_PLAYFUL_SEO.title,
      description: REUNION_PLAYFUL_SEO.description,
      canonical: 'https://playfulagency.com/reunion-playful',
    },
  };
}

export const PAGINAS_B4_SLUGS = [CONTACT_SLUG, REUNION_PLAYFUL_SLUG] as const;
export type PaginasB4Slug = (typeof PAGINAS_B4_SLUGS)[number];

export function isPaginasB4Slug(slug: string): slug is PaginasB4Slug {
  return (PAGINAS_B4_SLUGS as readonly string[]).includes(slug);
}

export function paginasB4SeedBodyForSlug(slug: PaginasB4Slug) {
  if (slug === CONTACT_SLUG) return contactPayloadBody();
  if (slug === REUNION_PLAYFUL_SLUG) return reunionPayloadBody();
  throw new Error(`Unknown B4 slug: ${slug}`);
}

export function paginasB4PublicPathForSlug(slug: PaginasB4Slug): string {
  return `/${slug}`;
}
