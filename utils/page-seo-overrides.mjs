/**
 * Per-slug <title> / og:title for WP Elementor pages whose Yoast SEO
 * title was cloned from another page. generateMetadata in app/[slug]
 * applies these after fetching Yoast so each public URL keeps a unique title.
 *
 * Title and description overrides are independent. Robots and on-page H1 stay untouched.
 */
export const PAGE_TITLE_OVERRIDES = {
  'agencia-e-commerce':
    'Agencia ecommerce para venta directa | Playful Agency',
  'pagos-online-ecommerce':
    'Pagos Online para E-commerce | Haz tu Integración con Playful Agency',
  'pasarela-de-pago-ecommerce':
    'Pasarela de Pago funcional para tu E-commerce | Playful Agency',
  'pasarela-de-pagos-venezuela':
    'Pasarela de Pago funcional para tu E-commerce | Playful Agency',
  'agencia-diseno-web':
    'Agencia de diseño web para tiendas online | Playful Agency',
};

export function applyPageTitleOverride(slug, yoastTitle, _yoastOgTitle) {
  const override = PAGE_TITLE_OVERRIDES[slug];
  const title = override || yoastTitle;
  return { title, ogTitle: title };
}

export const PAGE_DESCRIPTION_OVERRIDES = {
  'agencia-e-commerce':
    'Para marcas que ya venden directo al consumidor (D2C): ordenamos tu tienda online, el posicionamiento y el diseño para que venda más. Agenda tu llamada.',
  'agencia-diseno-web':
    'Diseño de tienda online orientado a conversión para marcas que ya venden, tiendas físicas que pasan a online o proyectos desde cero. Agenda tu llamada.',
};

export function applyPageDescriptionOverride(slug, yoastDescription, _yoastOgDescription) {
  const override = Object.hasOwn(PAGE_DESCRIPTION_OVERRIDES, slug)
    ? PAGE_DESCRIPTION_OVERRIDES[slug]
    : undefined;
  const description = override ?? yoastDescription;
  return { description, ogDescription: description };
}

/**
 * Next.js merges root-layout twitter:* into child pages. Non-blog routes
 * that set openGraph but omit twitter inherit the home generic card.
 * Title and description always come from the page <title> / meta description.
 */
export function twitterFromOpenGraph(ogTitle, ogDescription, ogImage) {
  return {
    card: 'summary_large_image',
    title: ogTitle,
    description: ogDescription,
    ...(ogImage ? { images: Array.isArray(ogImage) ? ogImage : [ogImage] } : {}),
  };
}

function socialImageUrls(images) {
  if (!images) return undefined;
  const list = Array.isArray(images) ? images : [images];
  const urls = list
    .map((img) => (typeof img === 'string' ? img : img?.url))
    .filter(Boolean);
  return urls.length ? urls : undefined;
}

/**
 * OG + Twitter inherit the page title and meta description. No own social copy.
 * `type` defaults to website (home, landings, casos).
 *
 * @param {{
 *   title?: string,
 *   description?: string,
 *   url?: string,
 *   images?: import('next').Metadata['openGraph'] extends infer Og
 *     ? Og extends { images?: infer Img } ? Img : never
 *     : never,
 *   type?: 'website' | 'article',
 * }} [opts]
 * @returns {{
 *   openGraph: NonNullable<import('next').Metadata['openGraph']>,
 *   twitter: NonNullable<import('next').Metadata['twitter']>,
 * }}
 */
export function pageSocialMetadata({
  title,
  description,
  url,
  images,
  type = 'website',
} = {}) {
  return {
    openGraph: {
      ...(title != null ? { title } : {}),
      ...(description != null ? { description } : {}),
      type,
      ...(url ? { url } : {}),
      ...(images ? { images } : {}),
    },
    twitter: twitterFromOpenGraph(title, description, socialImageUrls(images)),
  };
}
