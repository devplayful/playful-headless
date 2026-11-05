import type { WPPost } from '@/services/wordpress';
import { applyBlogPostContentAltH5ToHtml } from './blog-post-content-alt-h5.ts';

type JsonRecord = Record<string, unknown>;

/** Páginas WP sueltas en colección `paginas` (import WP), excl. servicios H3. */
export const PAGINAS_SUELTAS_PUBLIC_SLUGS = ['privacy-policy'] as const;

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function mediaUrl(value: unknown): { url: string; alt: string } | null {
  if (!value) return null;
  if (typeof value === 'string') return { url: value, alt: '' };
  if (!isRecord(value)) return null;
  const url =
    (typeof value.sourceUrl === 'string' && value.sourceUrl) ||
    (typeof value.url === 'string' && value.url) ||
    '';
  if (!url) return null;
  const alt = typeof value.alt === 'string' ? value.alt : '';
  return { url, alt };
}

function categoryTerm(value: unknown): { id: number; slug: string; name: string; taxonomy: string } | null {
  if (!isRecord(value)) return null;
  const slug = typeof value.slug === 'string' ? value.slug : '';
  const name = typeof value.nombre === 'string' ? value.nombre : slug;
  const id = typeof value.wpId === 'number' ? value.wpId : typeof value.id === 'number' ? value.id : 0;
  if (!slug) return null;
  return { id, slug, name, taxonomy: 'category' };
}

function authorFromDoc(value: unknown): { id: number; name: string; slug: string; url?: string } | null {
  if (!isRecord(value)) return null;
  const name = typeof value.nombre === 'string' ? value.nombre : '';
  const slug = typeof value.slug === 'string' ? value.slug : '';
  const id = typeof value.wpId === 'number' ? value.wpId : typeof value.id === 'number' ? value.id : 0;
  if (!name) return null;
  return {
    id,
    name,
    slug,
    url: typeof value.url === 'string' ? value.url : undefined,
  };
}

function isoFromPayloadDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string' && value) return value;
  return new Date(0).toISOString();
}

function yoastFromDoc(yoast: unknown): WPPost['yoast_head_json'] {
  if (!isRecord(yoast)) return undefined;
  const ogImageUrl = typeof yoast.ogImage === 'string' ? yoast.ogImage : '';
  return {
    title: typeof yoast.title === 'string' ? yoast.title : undefined,
    description: typeof yoast.description === 'string' ? yoast.description : undefined,
    canonical: typeof yoast.canonical === 'string' ? yoast.canonical : undefined,
    og_title: typeof yoast.ogTitle === 'string' ? yoast.ogTitle : undefined,
    og_description: typeof yoast.ogDescription === 'string' ? yoast.ogDescription : undefined,
    og_image: ogImageUrl ? [{ url: ogImageUrl }] : undefined,
  };
}

export function mapPayloadPostDocToWpPost(doc: JsonRecord): WPPost | null {
  const slug = typeof doc.slug === 'string' ? doc.slug : '';
  const wpId = typeof doc.wpId === 'number' ? doc.wpId : 0;
  if (!slug || !wpId) return null;

  const primaryCat = categoryTerm(doc.categoria);
  const extraCats = Array.isArray(doc.categorias)
    ? doc.categorias.map(categoryTerm).filter(Boolean)
    : [];
  const categories = (extraCats.length ? extraCats : primaryCat ? [primaryCat] : []) as Array<{
    id: number;
    slug: string;
    name: string;
    taxonomy: string;
  }>;

  const featured = mediaUrl(doc.imagenDestacada);
  const author = authorFromDoc(doc.autor);
  let html = typeof doc.contentHtml === 'string' ? doc.contentHtml : '';
  html = applyBlogPostContentAltH5ToHtml(html, wpId);

  const dateGmt = isoFromPayloadDate(doc.date);
  const wpDate = typeof doc.wpDate === 'string' ? doc.wpDate : dateGmt;
  const modifiedGmt = isoFromPayloadDate(doc.modifiedGmt);

  const post: WPPost = {
    id: wpId,
    slug,
    link: `https://playfulagency.com/blog/${categories[0]?.slug || 'sin-categoria'}/${slug}`,
    date: wpDate,
    date_gmt: dateGmt,
    modified: modifiedGmt,
    modified_gmt: modifiedGmt,
    status: typeof doc.estado === 'string' ? doc.estado : 'publish',
    title: { rendered: typeof doc.titulo === 'string' ? doc.titulo : slug },
    content: { rendered: html },
    excerpt: {
      rendered: typeof doc.extracto === 'string' ? doc.extracto : '',
    },
    categories,
    featured_media_url: featured?.url,
    featured_media_alt: featured?.alt,
    ...(author ? { author, author_name: author.name } : {}),
    yoast_head_json: yoastFromDoc(doc.yoast),
  };

  if (author || featured) {
    post._embedded = {};
    if (author) post._embedded.author = [author];
    if (featured) {
      post._embedded['wp:featuredmedia'] = [
        { id: 0, source_url: featured.url, alt_text: featured.alt },
      ];
    }
    if (categories.length) {
      post._embedded['wp:term'] = [categories, []];
    }
  }

  return post;
}
export function mapPayloadPaginaToWpPage(doc: JsonRecord): {
  title: { rendered: string };
  content: { rendered: string };
  slug: string;
  yoast_head_json?: WPPost['yoast_head_json'];
} {
  const slug = typeof doc.slug === 'string' ? doc.slug : '';
  const html = typeof doc.contentHtml === 'string' ? doc.contentHtml : '';
  return {
    slug,
    title: { rendered: typeof doc.titulo === 'string' ? doc.titulo : slug },
    content: { rendered: html },
    yoast_head_json: yoastFromDoc(doc.yoast),
  };
}
