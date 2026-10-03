import { cache } from 'react';
import { applyPublicCaseStudyOverrides } from '@/utils/public-case-study-overrides';
import { mergePublicCaseStudies } from '@/lib/public-case-studies';
import { rewriteElementorBodyHrefs } from '@/utils/booking';
import { filterOpenBlogPosts } from '@/utils/blog-closed-paths';
import { rewriteEcommerceShopifyLink } from '@/utils/ecommerce-shopify-link';
import {
  rewriteInSitePageHrefs,
  rewriteWpRenderedHtmlFields,
  rewriteWpYoastFields,
} from './rewrite-in-site-hrefs.mjs';
import {
  isAllowedCaseStudyMediaUrl,
  preserveFeaturedMediaUrl,
} from './case-study-media-policy.mjs';
import { wordpressFetch, wordpressFetchCollection } from './wordpress-request.mjs';
import { resolveBlogCoverUrl } from '@/lib/blog-cover-image';
import {
  BLOG_ARTICLE_POST_FIELDS,
  BLOG_AUTHOR_FIELDS,
  BLOG_LATEST_OVERSCAN,
  BLOG_LISTING_POST_FIELDS,
  BLOG_MEDIA_FIELDS,
  BLOG_STATIC_PARAMS_FIELDS,
  RELATED_BLOG_CARD_COUNT,
  RELATED_BLOG_CATEGORY_FETCH_PER_PAGE,
  RELATED_BLOG_CATEGORY_PER_PAGE,
  RELATED_BLOG_CATEGORY_REVALIDATE_SECONDS,
  RELATED_BLOG_FETCH_COUNT,
  RELATED_BLOG_FETCH_TIMEOUT_MS,
  RELATED_BLOG_INDEX_PER_PAGE,
  RELATED_BLOG_INDEX_REVALIDATE_SECONDS,
  RELATED_BLOG_POST_FIELDS,
  adoptLastKnownGood,
  fetchWithRelatedPostsTtl,
  isUsableRelatedIndex,
  parseRelatedPostIds,
  resolveRelatedBlogPosts,
  selectRelatedFromIndex,
  shouldCacheRelatedPostsResult,
  withRelatedFetchTimeout,
  type LastKnownGoodState,
  type RelatedBlogIndex,
  type RelatedIndexPost,
  type RelatedIndexTerm,
  type RelatedPostsCacheState,
} from '@/lib/blog-related-posts';
import { formatBlogListingDate } from '@/lib/blog-editorial-meta';

export {
  rewriteInSitePageHrefs,
  rewriteWpRenderedHtmlFields,
  rewriteWpYoastFields,
};

const WORDPRESS_API_URL = 'https://endpoint.playfulagency.com/wp-json';

/** WP REST fields that Next must never serialize into RSC / client props. */
const WP_LEAK_KEYS = new Set([
  'yoast_head',
  'yoast_head_json',
  '_links',
  'link',
  'guid',
]);

const WP_ENDPOINT_HOST = 'endpoint.playfulagency.com';
const WP_ENDPOINT_URL_RE = /https?:\/\/endpoint\.playfulagency\.com[^\s"'<>]*/gi;
const WP_ENDPOINT_HOST_RE = /endpoint\.playfulagency\.com/gi;

function stripEndpointHost(value: string): string {
  return value
    .replace(WP_ENDPOINT_URL_RE, '')
    .replace(/\/\/endpoint\.playfulagency\.com[^\s"'<>]*/gi, '')
    .replace(WP_ENDPOINT_HOST_RE, '');
}
/**
 * Drop Yoast / _links / guid and any endpoint.playfulagency.com strings
 * before a WP object is passed into a Client Component (RSC payload).
 * Featured-media URLs live only on that host; they are dropped rather than
 * rewritten to a CDN that does not exist.
 */
function sanitizeWpPayload<T>(value: T): T {
  return sanitizeWpValue(value) as T;
}

function sanitizeWpValue(value: unknown): unknown {
  if (value == null) return value;
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeWpValue(item));
  }
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (WP_LEAK_KEYS.has(key) || key.toLowerCase().includes('yoast')) {
        continue;
      }
      const cleaned = sanitizeWpValue(nested);
      if (cleaned !== undefined) {
        out[key] = cleaned;
      }
    }
    return out;
  }
  if (typeof value === 'string') {
    if (value.toLowerCase().includes('yoast')) {
      return undefined;
    }
    if (!value.includes(WP_ENDPOINT_HOST)) {
      return value;
    }
    const cleaned = stripEndpointHost(value);
    if (!cleaned.trim()) return undefined;
    return cleaned;
  }
  return value;
}

const CASE_STUDY_MEDIA_FIELDS = [
  'imagenbanner',
  'imagenminuta1',
  'imagenminuta2',
  'imagenminuta3',
  'challenge_logos',
  'desafioimagen1',
  'desafioimagen2',
  'desafioimagen3',
  'desafioimagen4',
  'imagendesarrollo',
  'grilla1',
  'grilla2',
  'grilla3',
  'grilla4',
  'grilla5',
  'grilla6',
  'grilla7',
  'grilla8',
  'telefono1',
  'telefono2',
  'telefono3',
  'telefono4',
  'telefonos',
  'testimonial_foto',
] as const;

function preserveCaseStudyMediaValue(value: unknown): unknown {
  if (isAllowedCaseStudyMediaUrl(value)) return value;
  if (Array.isArray(value)) {
    const media = value
      .map((item) => preserveCaseStudyMediaValue(item))
      .filter((item) => item !== undefined);
    return media.length > 0 ? media : undefined;
  }
  if (!value || typeof value !== 'object') return undefined;

  const source = value as Record<string, unknown>;
  if (!isAllowedCaseStudyMediaUrl(source.url)) return undefined;

  const media: Record<string, unknown> = { url: source.url };
  const alt = sanitizeWpValue(source.alt);
  if (typeof alt === 'string') media.alt = alt;
  if (typeof source.width === 'number' && Number.isFinite(source.width)) media.width = source.width;
  if (typeof source.height === 'number' && Number.isFinite(source.height)) media.height = source.height;
  return media;
}

function preserveCaseStudyMediaFields(acf: Record<string, unknown>): Record<string, unknown> {
  const media: Record<string, unknown> = {};
  for (const key of CASE_STUDY_MEDIA_FIELDS) {
    const preserved = preserveCaseStudyMediaValue(acf[key]);
    if (preserved !== undefined) media[key] = preserved;
  }
  return media;
}

export interface YoastMetaData {
  yoast_wpseo_title: string;
  yoast_wpseo_metadesc: string;
  yoast_wpseo_canonical?: string;
  yoast_wpseo_og_title?: string;
  yoast_wpseo_og_description?: string;
  yoast_wpseo_og_image?: string;
}

export async function getHomePageMetadata(): Promise<YoastMetaData> {
  try {
    /* console.log('Iniciando petición a WordPress...'); */
    const apiUrl = `${WORDPRESS_API_URL}/wp/v2/pages?slug=home-2&_fields=yoast_head`;
    /* console.log('URL de la API:', apiUrl); */
    
    const response = await wordpressFetch(apiUrl, {
      next: { revalidate: 3600 },
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    /* console.log('Respuesta recibida. Status:', response.status); */
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en la respuesta:', errorText);
      throw new Error(`Error al obtener los metadatos: ${response.status} ${response.statusText}`);
    }

    const [homePage] = await response.json();
    
    if (!homePage || !homePage.yoast_head) {
      return {
        yoast_wpseo_title: 'Playful Agency',
        yoast_wpseo_metadesc: 'Agencia de marketing digital y desarrollo web',
        yoast_wpseo_canonical: '',
        yoast_wpseo_og_title: '',
        yoast_wpseo_og_description: '',
        yoast_wpseo_og_image: ''
      };
    }

    // Extraer el título
    const titleMatch = homePage.yoast_head.match(/<title>(.*?)<\/title>/);
    const title = titleMatch ? titleMatch[1] : 'Playful Agency';
    
    // Función para extraer contenido de meta tags
    const getMetaContent = (html: string, name: string): string => {
      // Primero buscamos con comillas dobles
      let regex = new RegExp(`<meta[^>]*(?:name|property)="${name}"[^>]*content="([^"]*)"`);
      let match = html.match(regex);
      
      // Si no encontramos, buscamos con comillas simples
      if (!match) {
        regex = new RegExp(`<meta[^>]*(?:name|property)='${name}'[^>]*content='([^']*)'`);
        match = html.match(regex);
      }
      
      return match ? match[1] : '';
    };

    const metadata = {
      yoast_wpseo_title: title,
      yoast_wpseo_metadesc: getMetaContent(homePage.yoast_head, 'description'),
      yoast_wpseo_canonical: getMetaContent(homePage.yoast_head, 'canonical'),
      yoast_wpseo_og_title: getMetaContent(homePage.yoast_head, 'og:title'),
      yoast_wpseo_og_description: getMetaContent(homePage.yoast_head, 'og:description'),
      yoast_wpseo_og_image: getMetaContent(homePage.yoast_head, 'og:image'),
    };

    /* console.log('Metadatos extraídos:', JSON.stringify(metadata, null, 2)); */
    return metadata;
    
  } catch (error) {
    console.error('Error en getHomePageMetadata:', error);
    return {
      yoast_wpseo_title: 'Playful Agency',
      yoast_wpseo_metadesc: 'Agencia de marketing digital y desarrollo web',
      yoast_wpseo_canonical: '',
      yoast_wpseo_og_title: '',
      yoast_wpseo_og_description: '',
      yoast_wpseo_og_image: ''
    };
  }
}

export async function getPageMetadataBySlug(slug: string): Promise<YoastMetaData> {
  try {
    /* console.log(`Iniciando petición para obtener metadatos de la página: ${slug}`); */
    const apiUrl = `${WORDPRESS_API_URL}/wp/v2/pages?slug=${encodeURIComponent(slug)}&_fields=yoast_head`;
    /* console.log('URL de la API:', apiUrl); */
    
    const response = await wordpressFetch(apiUrl, {
      next: { revalidate: 3600 },
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    /* console.log('Respuesta recibida. Status:', response.status); */
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en la respuesta:', errorText);
      throw new Error(`Error al obtener los metadatos: ${response.status} ${response.statusText}`);
    }

    const [pageData] = await response.json();
    
    if (!pageData || !pageData.yoast_head) {
      return {
        yoast_wpseo_title: `Playful Agency - ${slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
        yoast_wpseo_metadesc: 'Agencia de marketing digital y desarrollo web',
        yoast_wpseo_canonical: '',
        yoast_wpseo_og_title: '',
        yoast_wpseo_og_description: '',
        yoast_wpseo_og_image: ''
      };
    }

    // Extraer el título
    const titleMatch = pageData.yoast_head.match(/<title>(.*?)<\/title>/);
    const title = titleMatch ? titleMatch[1] : 'Playful Agency';
    
    // Función para extraer contenido de meta tags (reutilizada de getHomePageMetadata)
    const getMetaContent = (html: string, name: string): string => {
      // Primero buscamos con comillas dobles
      let regex = new RegExp(`<meta[^>]*(?:name|property)="${name}"[^>]*content="([^"]*)"`);
      let match = html.match(regex);
      
      // Si no encontramos, buscamos con comillas simples
      if (!match) {
        regex = new RegExp(`<meta[^>]*(?:name|property)='${name}'[^>]*content='([^']*)'`);
        match = html.match(regex);
      }
      
      return match ? match[1] : '';
    };

    const metadata = {
      yoast_wpseo_title: title,
      yoast_wpseo_metadesc: getMetaContent(pageData.yoast_head, 'description'),
      yoast_wpseo_canonical: getMetaContent(pageData.yoast_head, 'canonical'),
      yoast_wpseo_og_title: getMetaContent(pageData.yoast_head, 'og:title'),
      yoast_wpseo_og_description: getMetaContent(pageData.yoast_head, 'og:description'),
      yoast_wpseo_og_image: getMetaContent(pageData.yoast_head, 'og:image'),
    };

    /* console.log(`Metadatos extraídos para ${slug}:`, JSON.stringify(metadata, null, 2)); */
    return metadata;
    
  } catch (error) {
    console.error(`Error en getPageMetadataBySlug para ${slug}:`, error);
    return {
      yoast_wpseo_title: `Playful Agency - ${slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
      yoast_wpseo_metadesc: 'Agencia de marketing digital y desarrollo web',
      yoast_wpseo_canonical: '',
      yoast_wpseo_og_title: '',
      yoast_wpseo_og_description: '',
      yoast_wpseo_og_image: ''
    };
  }
}

export interface WPPage {
  id: number;
  slug: string;
  title: string;
  html: string;
  stylesheetIds: number[];
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripScripts(html: string): string {
  return html.replace(/<script\b[\s\S]*?<\/script>/gi, '');
}

function collectStylesheetIds(html: string, pageId: number): number[] {
  const ids = new Set<number>([pageId]);
  const re = /data-elementor-id=["'](\d+)["']/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const id = Number(match[1]);
    if (!Number.isNaN(id)) ids.add(id);
  }
  return Array.from(ids);
}

/** Página WP (servicios, etc.) con HTML de Elementor para renderizarla en el Next. */
export async function getPageBySlug(slug: string): Promise<WPPage | null> {
  const { items: pages } = await wordpressFetchCollection<any>(
    `${WORDPRESS_API_URL}/wp/v2/pages?slug=${encodeURIComponent(slug)}&_fields=id,slug,title,content`,
    {
      next: { revalidate: 300 },
      headers: { 'Content-Type': 'application/json' },
    }
  );
  if (!pages?.[0]) return null;
  const page = pages[0];
  const rawHtml: string = page.content?.rendered || '';
  const html = rewriteElementorBodyHrefs(
    rewriteEcommerceShopifyLink(rewriteInSitePageHrefs(stripScripts(rawHtml)), slug),
    slug,
  );
  const title = stripHtml(page.title?.rendered || slug);
  const stylesheetIds = collectStylesheetIds(html, page.id);
  return { id: page.id, slug: page.slug, title, html, stylesheetIds };
}

// Interfaz para los ítems del menú
export interface MenuItem {
  title: string;
  slug: string;
  children?: MenuItem[];
}

export const menuItems: MenuItem[] = [
  { title: 'Inicio', slug: 'home-2' },
  {
    title: 'Servicios',
    slug: 'services',
    children: [
      { title: 'Agencia E-commerce', slug: 'agencia-e-commerce' },
      { title: 'Agencia de Diseño Web', slug: 'agencia-diseno-web' },
      { title: 'Marketing Internacional', slug: 'marketing-internacional' },
      { title: 'Agencia SEO', slug: 'agencia-seo' },
      { title: 'Agencia UX/UI', slug: 'agencia-ux-ui' },
      { title: 'Agencia SEM', slug: 'agencia-sem' },
      { title: 'SEO Expertos', slug: 'seo-expertos' },
      { title: 'SEO Vigo', slug: 'seo-vigo' }
    ]
  },
  {
    title: 'Casos de Éxito',
    slug: 'casos-de-exito',
    children: [
      { title: 'Policlínica Metropolitana', slug: 'policlinica-metropolitana' },
      { title: 'Mercantil Servicios Financieros', slug: 'mercantil-servicios-financieros-internacional' },
      { title: 'Grupo Automotriz Multimarca', slug: 'grupo-automotriz-multimarca' }
    ]
  },
  { title: 'Nosotros', slug: 'nosotros' },
  { title: 'Blog', slug: 'blog' },
  { title: 'Contacto', slug: 'contactar-agencia-de-marketing-digital' }
];

export interface WPTerm {
  id: number;
  name: string;
  slug: string;
  taxonomy: string;
}

export interface WPFeaturedMedia {
  id: number;
  source_url: string;
  alt_text?: string;
  media_details?: {
    sizes: {
      [key: string]: {
        source_url: string;
        width: number;
        height: number;
      };
    };
  };
  width?: number;
  height?: number;
}

export interface WPPost {
  id: number;
  date: string;
  date_gmt?: string;
  slug: string;
  link: string;
  title: { rendered: string };
  content?: { rendered: string; protected?: boolean };
  excerpt?: { rendered: string; protected?: boolean };
  _embedded?: {
    'wp:featuredmedia'?: WPFeaturedMedia[];
    'wp:term'?: any[][];
    'author'?: Array<{ id: number; name: string; slug: string; avatar_urls?: { [key: string]: string } }>;
  };
  featured_media?: number;
  featured_media_url?: string;
  featured_media_alt?: string;
  categories?: any[];
  tags?: any[];
  author?: number | { id: number; name: string; slug: string; avatar_urls?: { [key: string]: string } };
  author_name?: string;
  author_avatar_urls?: { [key: string]: string };
  modified?: string;
  modified_gmt?: string;
  status?: string;
  type?: string;
  format?: string;
  sticky?: boolean;
  comment_status?: string;
  ping_status?: string;
  template?: string;
  meta?: { [key: string]: any };
  /** ACF REST object when a field group is assigned; WP currently returns `[]` on posts. */
  acf?: Record<string, unknown> | unknown[];
}

export type RelatedBlogCard = {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  imageUrl: string;
  slug: string;
  href: string;
};

export type LatestBlogPostsQuery = {
  categoryId?: number;
  excludeId?: number | string;
  perPage?: number;
  signal?: AbortSignal;
  timeoutMs?: number;
  maxAttempts?: number;
};

type RelatedCategoryTerm = { id: number; name: string; slug: string };

type RelatedCardCategoryLookup = {
  byId?: Map<number, RelatedCategoryTerm>;
  fallback?: { name?: string; slug?: string };
};

function toRelatedBlogCard(post: WPPost, lookup?: RelatedCardCategoryLookup): RelatedBlogCard {
  let category = 'Sin categoría';
  let categorySlug = 'sin-categoria';
  const embedded = post._embedded?.['wp:term']?.[0]?.filter((term) => term.taxonomy === 'category');
  const objectCategories = Array.isArray(post.categories)
    ? post.categories.filter((term) => term && typeof term === 'object' && term.slug)
    : [];
  const categories = (embedded && embedded.length > 0) ? embedded : objectCategories;
  if (categories && categories.length > 0) {
    category = categories[0].name || category;
    categorySlug = categories[0].slug || categorySlug;
  } else {
    const ids = Array.isArray(post.categories)
      ? post.categories.filter((id): id is number => typeof id === 'number' && id > 0)
      : [];
    const fromLookup = ids.map((id) => lookup?.byId?.get(id)).find(Boolean);
    if (fromLookup) {
      category = fromLookup.name || category;
      categorySlug = fromLookup.slug || categorySlug;
    } else if (lookup?.fallback) {
      category = lookup.fallback.name || category;
      categorySlug = lookup.fallback.slug || categorySlug;
    }
  }
  let imageUrl = post.featured_media_url || '/images/blog/placeholder.jpg';
  const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0];
  if (!post.featured_media_url && featuredMedia) {
    imageUrl = featuredMedia.source_url
      || featuredMedia.media_details?.sizes?.full?.source_url
      || featuredMedia.media_details?.sizes?.large?.source_url
      || featuredMedia.media_details?.sizes?.medium_large?.source_url
      || featuredMedia.media_details?.sizes?.medium?.source_url
      || imageUrl;
  }
  imageUrl = resolveBlogCoverUrl(post.slug, imageUrl);
  const formattedDate = formatBlogListingDate(
    post.slug,
    {
      published: post.date,
      publishedGmt: post.date_gmt,
      modified: post.modified,
      modifiedGmt: post.modified_gmt,
    },
    'slash',
  );
  const excerpt = (post.excerpt?.rendered ?? '').replace(/<[^>]*>?/gm, '').replace(/&[a-z]+;/g, '').trim();
  return {
    id: post.id,
    title: post.title.rendered.replace(/&[a-z]+;/g, ''),
    excerpt: excerpt.length > 100 ? excerpt.substring(0, 100) + '...' : excerpt,
    category,
    date: formattedDate,
    imageUrl,
    slug: post.slug,
    href: `/blog/${categorySlug}/${post.slug}`,
  };
}

export async function getBlogPosts(page: number = 1, perPage: number = 6, categorySlug: string = ''): Promise<{ posts: WPPost[], totalPages: number }> {
  page = Math.max(1, page);
  perPage = Math.min(100, Math.max(1, perPage));
  const url = new URL(`${WORDPRESS_API_URL}/wp/v2/posts`);
  url.searchParams.set('page', String(page));
  url.searchParams.set('per_page', String(perPage));
  url.searchParams.set('_fields', BLOG_LISTING_POST_FIELDS);
  if (categorySlug) {
    const { items: categories } = await wordpressFetchCollection<any>(
      `${WORDPRESS_API_URL}/wp/v2/categories?slug=${encodeURIComponent(categorySlug)}&_fields=id,slug,name`,
      { next: { revalidate: 3600 }, headers: { 'Content-Type': 'application/json' } }
    );
    if (categories.length === 0) return { posts: [], totalPages: 0 };
    url.searchParams.set('categories', String(categories[0].id));
  }
  const { items: posts, response } = await wordpressFetchCollection<WPPost>(
    url.toString(),
    { next: { revalidate: 300 }, headers: { 'Content-Type': 'application/json' } },
  );
  const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');
  const processedPosts = await hydrateListingPosts(posts);
  return { posts: filterOpenBlogPosts(processedPosts), totalPages };
}

export async function getLatestBlogPosts(
  perPage: number = 3,
  query: LatestBlogPostsQuery = {},
): Promise<RelatedBlogCard[]> {
  const url = new URL(`${WORDPRESS_API_URL}/wp/v2/posts`);
  url.searchParams.append('per_page', String(Math.min(100, Math.max(perPage + BLOG_LATEST_OVERSCAN, perPage))));
  url.searchParams.append('orderby', 'date');
  url.searchParams.append('order', 'desc');
  url.searchParams.append('status', 'publish');
  url.searchParams.append('_fields', BLOG_LISTING_POST_FIELDS);
  if (query.categoryId) {
    url.searchParams.append('categories', String(query.categoryId));
  }
  if (query.excludeId != null && query.excludeId !== '') {
    url.searchParams.append('exclude', String(query.excludeId));
  }
  const { items: posts } = await wordpressFetchCollection<WPPost>(
    url.toString(),
    {
      next: { revalidate: 3600 },
      headers: { 'Content-Type': 'application/json' },
      signal: query.signal,
    },
    {
      timeoutMs: query.timeoutMs,
      maxAttempts: query.maxAttempts,
    },
  );
  const hydrated = await hydrateListingPosts(posts, query);
  return filterOpenBlogPosts(hydrated.map((post) => toRelatedBlogCard(post))).slice(0, perPage);
}

type ListingMedia = { id: number; source_url: string; alt_text?: string };
type ListingAuthor = { id: number; name: string; slug?: string };

function uniquePositiveIds(values: unknown[]): number[] {
  return Array.from(new Set(
    values.filter((id): id is number => typeof id === 'number' && Number.isInteger(id) && id > 0),
  ));
}

async function loadBlogMediaByIds(
  ids: number[],
  query: Pick<LatestBlogPostsQuery, 'signal' | 'timeoutMs' | 'maxAttempts'> = {},
): Promise<Map<number, ListingMedia>> {
  const unique = uniquePositiveIds(ids);
  if (unique.length === 0) return new Map();
  const url = new URL(`${WORDPRESS_API_URL}/wp/v2/media`);
  url.searchParams.append('include', unique.join(','));
  url.searchParams.append('per_page', String(Math.min(100, unique.length)));
  url.searchParams.append('_fields', BLOG_MEDIA_FIELDS);
  const { items } = await wordpressFetchCollection<ListingMedia>(
    url.toString(),
    {
      next: { revalidate: 3600 },
      headers: { 'Content-Type': 'application/json' },
      signal: query.signal,
    },
    {
      timeoutMs: query.timeoutMs,
      maxAttempts: query.maxAttempts,
    },
  );
  const byId = new Map<number, ListingMedia>();
  for (const item of items) {
    if (typeof item?.id === 'number' && item.id > 0 && item.source_url) {
      byId.set(item.id, {
        id: item.id,
        source_url: item.source_url,
        alt_text: item.alt_text || '',
      });
    }
  }
  return byId;
}

async function loadBlogAuthorsByIds(
  ids: number[],
  query: Pick<LatestBlogPostsQuery, 'signal' | 'timeoutMs' | 'maxAttempts'> = {},
): Promise<Map<number, ListingAuthor>> {
  const unique = uniquePositiveIds(ids);
  if (unique.length === 0) return new Map();
  const url = new URL(`${WORDPRESS_API_URL}/wp/v2/users`);
  url.searchParams.append('include', unique.join(','));
  url.searchParams.append('per_page', String(Math.min(100, unique.length)));
  url.searchParams.append('_fields', BLOG_AUTHOR_FIELDS);
  const { items } = await wordpressFetchCollection<ListingAuthor>(
    url.toString(),
    {
      next: { revalidate: 3600 },
      headers: { 'Content-Type': 'application/json' },
      signal: query.signal,
    },
    {
      timeoutMs: query.timeoutMs,
      maxAttempts: query.maxAttempts,
    },
  );
  const byId = new Map<number, ListingAuthor>();
  for (const item of items) {
    if (typeof item?.id === 'number' && item.id > 0 && item.name) {
      byId.set(item.id, { id: item.id, name: item.name, slug: item.slug });
    }
  }
  return byId;
}

async function hydrateListingPosts(
  posts: WPPost[],
  query: Pick<LatestBlogPostsQuery, 'signal' | 'timeoutMs' | 'maxAttempts'> = {},
): Promise<WPPost[]> {
  if (posts.length === 0) return [];
  const mediaIds = uniquePositiveIds(posts.map((post) => post.featured_media));
  const authorIds = uniquePositiveIds(posts.map((post) => (
    typeof post.author === 'number' ? post.author : post.author?.id
  )));
  const [terms, media, authors] = await Promise.all([
    getBlogCategoryTerms(query).catch(() => new Map<number, RelatedCategoryTerm>()),
    loadBlogMediaByIds(mediaIds, query).catch(() => new Map<number, ListingMedia>()),
    loadBlogAuthorsByIds(authorIds, query).catch(() => new Map<number, ListingAuthor>()),
  ]);
  return posts.map((post) => {
    const rewritten = rewriteWpYoastFields(rewriteWpRenderedHtmlFields(post));
    const categoryIds = categoryIdsFromPost(rewritten);
    const categories = categoryIds
      .map((id) => terms.get(id))
      .filter((term): term is RelatedCategoryTerm => Boolean(term))
      .map((term) => ({ ...term, taxonomy: 'category' }));
    const mediaItem = typeof rewritten.featured_media === 'number'
      ? media.get(rewritten.featured_media)
      : undefined;
    const authorId = typeof rewritten.author === 'number' ? rewritten.author : rewritten.author?.id;
    const author = typeof authorId === 'number' ? authors.get(authorId) : undefined;
    return {
      ...rewritten,
      categories,
      featured_media_url: resolveBlogCoverUrl(rewritten.slug, mediaItem?.source_url || ''),
      featured_media_alt: mediaItem?.alt_text || '',
      author_name: author?.name || 'Playful Agency',
      author: author
        ? { id: author.id, name: author.name, slug: author.slug || '' }
        : rewritten.author,
    };
  });
}

const categoryTermsCache: RelatedPostsCacheState<Map<number, RelatedCategoryTerm>> = { current: null };

async function loadBlogCategoryTerms(
  query: Pick<LatestBlogPostsQuery, 'signal' | 'timeoutMs' | 'maxAttempts'> = {},
): Promise<Map<number, RelatedCategoryTerm>> {
  const url = new URL(`${WORDPRESS_API_URL}/wp/v2/categories`);
  url.searchParams.append('per_page', '100');
  url.searchParams.append('_fields', 'id,slug,name');
  const { items } = await wordpressFetchCollection<RelatedCategoryTerm>(
    url.toString(),
    {
      next: { revalidate: 3600 },
      headers: { 'Content-Type': 'application/json' },
      signal: query.signal,
    },
    {
      timeoutMs: query.timeoutMs,
      maxAttempts: query.maxAttempts,
    },
  );
  const byId = new Map<number, RelatedCategoryTerm>();
  for (const term of items) {
    if (typeof term?.id === 'number' && term.id > 0 && term.slug) {
      byId.set(term.id, {
        id: term.id,
        name: term.name || term.slug,
        slug: term.slug,
      });
    }
  }
  return byId;
}

function getBlogCategoryTerms(
  query: Pick<LatestBlogPostsQuery, 'signal' | 'timeoutMs' | 'maxAttempts'> = {},
): Promise<Map<number, RelatedCategoryTerm>> {
  return fetchWithRelatedPostsTtl(categoryTermsCache, () => loadBlogCategoryTerms(query));
}

/**
 * Lite same-category related fetch: exact small per_page, `_fields` only,
 * no `_embed`. Timeout fallback stays empty so the article never 500s.
 */
export async function getRelatedBlogPostsByCategory(
  categoryId: number,
  query: LatestBlogPostsQuery = {},
): Promise<RelatedBlogCard[]> {
  const perPage = Math.min(
    20,
    Math.max(1, query.perPage ?? RELATED_BLOG_CATEGORY_FETCH_PER_PAGE),
  );
  const url = new URL(`${WORDPRESS_API_URL}/wp/v2/posts`);
  url.searchParams.append('per_page', String(perPage));
  url.searchParams.append('orderby', 'date');
  url.searchParams.append('order', 'desc');
  url.searchParams.append('status', 'publish');
  url.searchParams.append('categories', String(categoryId));
  url.searchParams.append('_fields', RELATED_BLOG_POST_FIELDS);
  if (query.excludeId != null && query.excludeId !== '') {
    url.searchParams.append('exclude', String(query.excludeId));
  }
  const [collection, terms] = await Promise.all([
    wordpressFetchCollection<WPPost>(
      url.toString(),
      {
        next: { revalidate: RELATED_BLOG_CATEGORY_REVALIDATE_SECONDS },
        headers: { 'Content-Type': 'application/json' },
        signal: query.signal,
      },
      {
        timeoutMs: query.timeoutMs,
        maxAttempts: query.maxAttempts,
      },
    ),
    getBlogCategoryTerms(query).catch(() => new Map<number, RelatedCategoryTerm>()),
  ]);
  const lookup: RelatedCardCategoryLookup = {
    byId: terms,
    fallback: terms.get(categoryId),
  };
  const cards = filterOpenBlogPosts(collection.items.map((post) => {
    const rewritten = rewriteWpRenderedHtmlFields(post);
    return toRelatedBlogCard(rewritten, lookup);
  }));
  const requestedSlug = lookup.fallback?.slug;
  if (!requestedSlug) return cards.slice(0, RELATED_BLOG_CATEGORY_PER_PAGE);
  const primary: RelatedBlogCard[] = [];
  const extra: RelatedBlogCard[] = [];
  const prefix = `/blog/${requestedSlug}/`;
  for (const card of cards) {
    if (card.href.startsWith(prefix)) primary.push(card);
    else extra.push(card);
  }
  return [...primary, ...extra].slice(0, RELATED_BLOG_CATEGORY_PER_PAGE);
}

export async function getBlogPostsByIds(
  ids: number[],
  query: Pick<LatestBlogPostsQuery, 'signal' | 'timeoutMs' | 'maxAttempts'> = {},
): Promise<RelatedBlogCard[]> {
  const unique = Array.from(new Set(ids.filter((id) => Number.isInteger(id) && id > 0)));
  if (unique.length === 0) return [];
  const url = new URL(`${WORDPRESS_API_URL}/wp/v2/posts`);
  url.searchParams.append('include', unique.join(','));
  url.searchParams.append('per_page', String(unique.length));
  url.searchParams.append('orderby', 'include');
  url.searchParams.append('status', 'publish');
  url.searchParams.append('_fields', BLOG_LISTING_POST_FIELDS);
  const { items: posts } = await wordpressFetchCollection<WPPost>(
    url.toString(),
    {
      next: { revalidate: 3600 },
      headers: { 'Content-Type': 'application/json' },
      signal: query.signal,
    },
    {
      timeoutMs: query.timeoutMs,
      maxAttempts: query.maxAttempts,
    },
  );
  const hydrated = await hydrateListingPosts(posts, query);
  const cards = filterOpenBlogPosts(hydrated.map((post) => toRelatedBlogCard(post)));
  const byId = new Map(cards.map((card) => [card.id, card]));
  return unique.map((id) => byId.get(id)).filter((card): card is RelatedBlogCard => Boolean(card));
}

const relatedIndexCache: RelatedPostsCacheState<RelatedBlogIndex | null> = { current: null };
const relatedIndexLastKnownGood: LastKnownGoodState<RelatedBlogIndex> = { value: null };

const relatedIndexFetchGuard = {
  timeoutMs: RELATED_BLOG_FETCH_TIMEOUT_MS,
  maxAttempts: 1,
} as const;

function categoryIdsFromPost(post: Pick<WPPost, 'categories'>): number[] {
  if (!Array.isArray(post.categories)) return [];
  const ids: number[] = [];
  for (const item of post.categories) {
    if (typeof item === 'number' && Number.isInteger(item) && item > 0) {
      ids.push(item);
      continue;
    }
    if (
      item
      && typeof item === 'object'
      && typeof item.id === 'number'
      && Number.isInteger(item.id)
      && item.id > 0
    ) {
      ids.push(item.id);
    }
  }
  return Array.from(new Set(ids));
}

function toRelatedIndexPost(
  post: WPPost,
  terms: Map<number, RelatedIndexTerm>,
): RelatedIndexPost {
  const categoryIds = categoryIdsFromPost(post);
  const primary = categoryIds.map((id) => terms.get(id)).find(Boolean);
  const categorySlug = primary?.slug || 'sin-categoria';
  const categoryName = primary?.name || 'Sin categoría';
  const excerpt = (post.excerpt?.rendered ?? '').replace(/<[^>]*>?/gm, '').replace(/&[a-z]+;/g, '').trim();
  const title = (post.title?.rendered ?? '').replace(/&[a-z]+;/g, '');
  const featuredMediaId = typeof post.featured_media === 'number' && post.featured_media > 0
    ? post.featured_media
    : undefined;
  return {
    id: post.id,
    slug: post.slug,
    title,
    excerpt: excerpt.length > 100 ? excerpt.substring(0, 100) + '...' : excerpt,
    date: post.date,
    dateGmt: post.date_gmt,
    modified: post.modified,
    modifiedGmt: post.modified_gmt,
    featuredMediaId,
    featuredMediaUrl: resolveBlogCoverUrl(post.slug, '/images/blog/placeholder.jpg'),
    categoryIds,
    categorySlug,
    categoryName,
    status: post.status || 'publish',
    href: `/blog/${categorySlug}/${post.slug}`,
  };
}

function relatedCardFromIndexPost(post: RelatedIndexPost): RelatedBlogCard {
  return {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    category: post.categoryName,
    date: formatBlogListingDate(
      post.slug,
      {
        published: post.date,
        publishedGmt: post.dateGmt,
        modified: post.modified,
        modifiedGmt: post.modifiedGmt,
      },
      'slash',
    ),
    imageUrl: resolveBlogCoverUrl(post.slug, post.featuredMediaUrl || '/images/blog/placeholder.jpg'),
    slug: post.slug,
    href: post.href,
  };
}

async function loadBlogRelatedIndexPage(
  page: number,
  query: Pick<LatestBlogPostsQuery, 'signal' | 'timeoutMs' | 'maxAttempts'> = {},
): Promise<{ items: WPPost[]; totalPages: number }> {
  const url = new URL(`${WORDPRESS_API_URL}/wp/v2/posts`);
  url.searchParams.append('page', String(page));
  url.searchParams.append('per_page', String(RELATED_BLOG_INDEX_PER_PAGE));
  url.searchParams.append('orderby', 'date');
  url.searchParams.append('order', 'desc');
  url.searchParams.append('status', 'publish');
  url.searchParams.append('_fields', RELATED_BLOG_POST_FIELDS);
  const { items, response } = await wordpressFetchCollection<WPPost>(
    url.toString(),
    {
      next: { revalidate: RELATED_BLOG_INDEX_REVALIDATE_SECONDS },
      headers: { 'Content-Type': 'application/json' },
      signal: query.signal,
    },
    {
      timeoutMs: query.timeoutMs,
      maxAttempts: query.maxAttempts,
    },
  );
  return {
    items,
    totalPages: Math.max(1, parseInt(response.headers.get('X-WP-TotalPages') || '1', 10)),
  };
}

async function loadBlogRelatedIndex(
  query: Pick<LatestBlogPostsQuery, 'signal' | 'timeoutMs' | 'maxAttempts'> = {},
): Promise<RelatedBlogIndex | null> {
  const terms = await getBlogCategoryTerms(query).catch(() => new Map<number, RelatedIndexTerm>());
  const first = await loadBlogRelatedIndexPage(1, query);
  const posts = [...first.items];
  for (let page = 2; page <= first.totalPages; page += 1) {
    const next = await loadBlogRelatedIndexPage(page, query);
    posts.push(...next.items);
  }
  if (posts.length === 0) return null;

  const termList: RelatedIndexTerm[] = Array.from(terms.values());
  const entries = posts.map((post) => {
    const rewritten = rewriteWpRenderedHtmlFields(post);
    return toRelatedIndexPost(rewritten, terms);
  });
  const open = filterOpenBlogPosts(entries);
  if (open.length === 0) return null;
  return {
    posts: open,
    terms: termList,
    fetchedAt: Date.now(),
  };
}

function cacheRelatedIndexResult(result: RelatedBlogIndex | null): boolean {
  return shouldCacheRelatedPostsResult(result) && isUsableRelatedIndex(result);
}

export async function getBlogRelatedIndex(): Promise<RelatedBlogIndex | null> {
  try {
    const loaded = await fetchWithRelatedPostsTtl(
      relatedIndexCache,
      () => withRelatedFetchTimeout(
        (signal) => loadBlogRelatedIndex({
          signal,
          ...relatedIndexFetchGuard,
        }),
        null,
      ),
      Date.now,
      RELATED_BLOG_INDEX_REVALIDATE_SECONDS * 1000,
    );
    if (loaded && !cacheRelatedIndexResult(loaded) && relatedIndexCache.current) {
      relatedIndexCache.current = null;
    }
    return adoptLastKnownGood(relatedIndexLastKnownGood, loaded, isUsableRelatedIndex);
  } catch {
    return relatedIndexLastKnownGood.value;
  }
}

export async function getRelatedBlogPostsForPost(
  post: Pick<WPPost, 'id' | 'slug' | 'acf' | 'meta' | 'categories'>,
  options: { latest?: RelatedBlogCard[]; categorySlug?: string } = {},
): Promise<RelatedBlogCard[]> {
  const fieldIds = parseRelatedPostIds(post);
  const index = await getBlogRelatedIndex();
  if (!isUsableRelatedIndex(index)) {
    return options.latest?.length ? options.latest.slice(0, RELATED_BLOG_CARD_COUNT) : [];
  }

  const selected = selectRelatedFromIndex(index, {
    current: { id: post.id, slug: post.slug },
    fieldIds,
    categorySlug: options.categorySlug,
  });
  const cards = selected.map(relatedCardFromIndexPost);
  if (cards.length > 0) return cards;
  if (options.latest?.length) {
    return resolveRelatedBlogPosts({
      current: { id: post.id, slug: post.slug },
      fieldIds,
      postsById: new Map(options.latest.map((card) => [card.id, card])),
      latest: options.latest,
      limit: RELATED_BLOG_CARD_COUNT,
    });
  }
  return [];
}

export async function getBlogStaticParams(): Promise<Array<{ slug: string[] }>> {
  const terms = await getBlogCategoryTerms().catch(() => new Map<number, RelatedCategoryTerm>());
  const first = await loadBlogStaticParamsPage(1);
  const posts = [...first.items];
  for (let page = 2; page <= first.totalPages; page += 1) {
    const next = await loadBlogStaticParamsPage(page);
    posts.push(...next.items);
  }
  const hydrated = posts.map((post) => {
    const categoryIds = categoryIdsFromPost(post);
    const categories = categoryIds
      .map((id) => terms.get(id))
      .filter((term): term is RelatedCategoryTerm => Boolean(term))
      .map((term) => ({ ...term, taxonomy: 'category' }));
    return { ...post, categories };
  });
  return filterOpenBlogPosts(hydrated).map((post) => ({
    slug: [post.categories?.[0]?.slug || 'sin-categoria', post.slug],
  }));
}

async function loadBlogStaticParamsPage(
  page: number,
): Promise<{ items: WPPost[]; totalPages: number }> {
  const url = new URL(`${WORDPRESS_API_URL}/wp/v2/posts`);
  url.searchParams.set('page', String(page));
  url.searchParams.set('per_page', String(RELATED_BLOG_INDEX_PER_PAGE));
  url.searchParams.set('status', 'publish');
  url.searchParams.set('_fields', BLOG_STATIC_PARAMS_FIELDS);
  const { items, response } = await wordpressFetchCollection<WPPost>(
    url.toString(),
    { next: { revalidate: 3600 }, headers: { 'Content-Type': 'application/json' } },
  );
  return {
    items,
    totalPages: Math.max(1, parseInt(response.headers.get('X-WP-TotalPages') || '1', 10)),
  };
}

const blogPostBySlugBuildCache = new Map<string, Promise<WPPost | null>>();

const loadBlogPostBySlug = cache(async (slug: string): Promise<WPPost | null> => {
  const { items: posts } = await wordpressFetchCollection<WPPost>(
    `${WORDPRESS_API_URL}/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed=wp:featuredmedia,wp:term,author&acf_format=standard&_fields=${BLOG_ARTICLE_POST_FIELDS}`,
    { next: { revalidate: 60 }, headers: { 'Content-Type': 'application/json' } }
  );
  if (!posts || posts.length === 0) return null;
  const post = posts[0];
  if (post._embedded) {
    if (post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]) {
      const media = post._embedded['wp:featuredmedia'][0];
      post.featured_media_url = media.source_url;
      post.featured_media_alt = media.alt_text || '';
    }
    if (post._embedded['wp:term']) {
      const terms = post._embedded['wp:term'];
      post.categories = terms[0] || [];
      post.tags = terms[1] || [];
    }
    if (post._embedded['author'] && post._embedded['author'][0]) post.author = post._embedded['author'][0];
  }
  post.featured_media_url = resolveBlogCoverUrl(post.slug, post.featured_media_url || '');
  return rewriteWpRenderedHtmlFields(post);
});

/**
 * generateMetadata and the page both need the same slug. React `cache()`
 * covers one render; the build map covers the SSG worker so a post is
 * fetched once, not twice per route.
 */
export async function getBlogPostBySlug(slug: string): Promise<WPPost | null> {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    const hit = blogPostBySlugBuildCache.get(slug);
    if (hit) return hit;
    const pending = loadBlogPostBySlug(slug);
    blogPostBySlugBuildCache.set(slug, pending);
    return pending;
  }
  return loadBlogPostBySlug(slug);
}

export interface TeamMember {
  id: number;
  title: { rendered: string };
  excerpt: { rendered: string };
  cargo?: number[];
  rol?: number[];
  acf: {
    informacion?: { linkedin_imagen?: string; linkedin_url?: string; email?: string };
    nombre?: string;
    cargo?: string;
    cargoIds?: number[];
    habilidades: string[];
    descripcion: string;
    linkedin_url: string;
    imagen: { url: string; alt: string };
  };
  _embedded?: {
    'wp:term'?: Array<Array<{ id: number; name: string; slug: string; taxonomy: string }>>;
    'wp:featuredmedia'?: WPFeaturedMedia[];
  };
}

export interface PodcastEpisode {
  id: number;
  date: string;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  featured_media?: number;
  featured_media_url?: string | null;
  featured_media_alt?: string;
  categoria?: number[];
  etiqueta?: number[];
  yoast_head?: string;
  yoast_head_json?: { title: string; description: string; canonical?: string; og_title?: string; og_description?: string; og_image?: Array<{ url: string; width: number; height: number }> };
  _embedded?: { 'wp:featuredmedia'?: WPFeaturedMedia[]; 'wp:term'?: WPTerm[][] };
}

export async function getPodcastPageMetadata(): Promise<YoastMetaData> {
  try {
    const apiUrl = `${WORDPRESS_API_URL}/wp/v2/pages?slug=podcast&_fields=yoast_head`;
    const response = await wordpressFetch(apiUrl, { next: { revalidate: 3600 }, headers: { 'Content-Type': 'application/json' } });
    const fallback: YoastMetaData = {
      yoast_wpseo_title: 'Podcast - Bendita Web | Playful Agency',
      yoast_wpseo_metadesc: 'Escucha nuestro podcast Bendita Web donde hablamos de marketing digital, SEO, desarrollo web y más.',
      yoast_wpseo_canonical: 'https://endpoint.playfulagency.com/podcast/',
      yoast_wpseo_og_title: 'Podcast - Bendita Web | Playful Agency',
      yoast_wpseo_og_description: 'Escucha nuestro podcast Bendita Web donde hablamos de marketing digital, SEO, desarrollo web y más.',
      yoast_wpseo_og_image: ''
    };
    if (!response.ok) return fallback;
    const [podcastPage] = await response.json();
    if (!podcastPage || !podcastPage.yoast_head) return fallback;
    const titleMatch = podcastPage.yoast_head.match(/<title>(.*?)<\/title>/);
    const title = titleMatch ? titleMatch[1] : fallback.yoast_wpseo_title;
    const getMetaContent = (html: string, name: string): string => {
      let regex = new RegExp(`<meta[^>]*(?:name|property)="${name}"[^>]*content="([^"]*)"`);
      let match = html.match(regex);
      if (!match) {
        regex = new RegExp(`<meta[^>]*(?:name|property)='${name}'[^>]*content='([^']*)'`);
        match = html.match(regex);
      }
      return match ? match[1] : '';
    };
    return {
      yoast_wpseo_title: title,
      yoast_wpseo_metadesc: getMetaContent(podcastPage.yoast_head, 'description'),
      yoast_wpseo_canonical: getMetaContent(podcastPage.yoast_head, 'canonical'),
      yoast_wpseo_og_title: getMetaContent(podcastPage.yoast_head, 'og:title'),
      yoast_wpseo_og_description: getMetaContent(podcastPage.yoast_head, 'og:description'),
      yoast_wpseo_og_image: getMetaContent(podcastPage.yoast_head, 'og:image'),
    };
  } catch (error) {
    console.error('Error en getPodcastPageMetadata:', error);
    return {
      yoast_wpseo_title: 'Podcast - Bendita Web | Playful Agency',
      yoast_wpseo_metadesc: 'Escucha nuestro podcast Bendita Web donde hablamos de marketing digital, SEO, desarrollo web y más.',
      yoast_wpseo_canonical: 'https://endpoint.playfulagency.com/podcast/',
      yoast_wpseo_og_title: 'Podcast - Bendita Web | Playful Agency',
      yoast_wpseo_og_description: 'Escucha nuestro podcast Bendita Web donde hablamos de marketing digital, SEO, desarrollo web y más.',
      yoast_wpseo_og_image: ''
    };
  }
}

export async function getPodcastEpisodes(page: number = 1, perPage: number = 10): Promise<{ episodes: PodcastEpisode[], totalPages: number }> {
  const { items: episodes, response } = await wordpressFetchCollection<PodcastEpisode>(
    `${WORDPRESS_API_URL}/wp/v2/podcast?_embed=wp:featuredmedia,wp:term&per_page=${perPage}&page=${page}&_fields=id,date,slug,title,excerpt,content,featured_media,categoria,etiqueta,yoast_head,yoast_head_json,_links,_embedded`,
    { next: { revalidate: 60 }, headers: { 'Content-Type': 'application/json' } }
  );
  const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1', 10);
  const processedEpisodes = episodes.map(episode => {
    const featuredMedia = episode._embedded?.['wp:featuredmedia']?.[0];
    return { ...episode, featured_media_url: featuredMedia?.source_url || null, featured_media_alt: featuredMedia?.alt_text || '' };
  });
  return { episodes: processedEpisodes, totalPages };
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const { items: teamMembers } = await wordpressFetchCollection<any>(
    `${WORDPRESS_API_URL}/wp/v2/equipo?_embed=wp:term,wp:featuredmedia&per_page=100`,
    { next: { revalidate: 3600 }, headers: { 'Content-Type': 'application/json' } }
  );
  const membersWithTerms = await Promise.all(teamMembers.map(async (member: any) => {
    try {
      const cargos = member._embedded?.['wp:term']?.find((t: any) => t[0]?.taxonomy === 'cargo') || [];
      const roles = member._embedded?.['wp:term']?.find((t: any) => t[0]?.taxonomy === 'rol') || [];
      const featuredMedia = member._embedded?.['wp:featuredmedia']?.[0];
      const linkedinUrl = member.acf?.informacion?.linkedin_url || member.acf?.linkedin_url || '#';
      const cargo = cargos.length > 0 ? cargos[0].name : (member.acf?.cargo || '');
      return {
        ...member,
        acf: {
          ...member.acf,
          nombre: member.title?.rendered || member.acf?.nombre || '',
          cargo: cargo,
          cargoIds: cargos.map((c: any) => c.id),
          habilidades: roles.map((r: any) => r.name) || member.acf?.habilidades || [],
          descripcion: (() => {
            const excerpt = member.excerpt?.rendered?.replace(/<[^>]*>?/gm, '').trim();
            const acfDesc = member.acf?.descripcion?.trim();
            return excerpt && excerpt !== '00' ? excerpt : (acfDesc || '');
          })(),
          linkedin_url: linkedinUrl,
          imagen: {
            url: featuredMedia?.source_url || member.acf?.imagen?.url || '/images/nosotros/placeholder-avatar.png',
            alt: featuredMedia?.alt_text || member.acf?.imagen?.alt || `Imagen de ${member.title?.rendered || 'miembro del equipo'}`
          }
        }
      };
    } catch (error) {
      console.error('Error procesando miembro del equipo:', error);
      return null;
    }
  }));
  return membersWithTerms.filter((member: TeamMember | null): member is TeamMember => member !== null);
}

export interface ACFSuccessStory {
  categoria1: string; categoria2: string; categoria3: string; categoria4: string; categoria5: string;
  h1: string; primerap: string; imagenbanner: { url: string; alt: string } | false;
  primerh2: string; segundap: string;
  imagenminuta1: { url: string; alt: string } | false;
  imagenminuta2: { url: string; alt: string } | false;
  imagenminuta3: { url: string; alt: string } | false;
  segundoh2: string; tercerap: string; cuartap: string; quintap: string; sextap: string;
  septimap: string; octavap: string; novenap: string;
  desafioimagen1: { url: string; alt: string } | false;
  desafioimagen2: { url: string; alt: string } | false;
  desafioimagen3: { url: string; alt: string } | false;
  desafioimagen4: { url: string; alt: string } | false;
  tercerh2: string; decima: string;
  subtitle?: string; description?: string;
  hero_image?: { url: string; alt: string };
  challenge_title?: string; challenge_description?: string;
  challenge_logos?: Array<{ url: string; alt: string }>;
  work_process?: Array<{ title: string; description: string; step_items: string[]; step_image?: { url: string; alt: string } }>;
  results?: Array<{ result_value: string; result_description: string }>;
}

export interface SuccessStory extends WPPost {
  acf: ACFSuccessStory;
}

export async function getSuccessStoryBySlug(slug: string): Promise<SuccessStory | null> {
  const { items: stories } = await wordpressFetchCollection<any>(
    `${WORDPRESS_API_URL}/wp/v2/casos-de-exito?slug=${encodeURIComponent(slug)}&_embed&acf_format=standard`,
    { next: { revalidate: 3600 }, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' } }
  );
  if (!stories || stories.length === 0) return null;
  const story = stories[0];
  if (!story.acf) return null;
  if (story._embedded?.['wp:featuredmedia']?.[0]) {
    story.featured_media_url = story._embedded['wp:featuredmedia'][0].source_url;
    story.featured_media_alt = story._embedded['wp:featuredmedia'][0].alt_text;
  }
  const sanitizedStory = sanitizeWpPayload(story as SuccessStory);
  sanitizedStory.acf = {
    ...sanitizedStory.acf,
    ...preserveCaseStudyMediaFields(story.acf as Record<string, unknown>),
  };
  return applyPublicCaseStudyOverrides(sanitizedStory);
}

export async function getPodcastEpisodeBySlug(slug: string): Promise<PodcastEpisode | null> {
  const { items: episodes } = await wordpressFetchCollection<PodcastEpisode>(
    `${WORDPRESS_API_URL}/wp/v2/podcast?slug=${encodeURIComponent(slug)}&_embed=wp:featuredmedia,wp:term&_fields=id,date,slug,title,excerpt,content,featured_media,categoria,etiqueta,yoast_head,yoast_head_json,_links,_embedded`,
    { next: { revalidate: 60 }, headers: { 'Content-Type': 'application/json' } }
  );
  const episode = episodes[0];
  if (!episode) return null;
  const featuredMedia = episode._embedded?.['wp:featuredmedia']?.[0];
  if (!episode.excerpt) episode.excerpt = { rendered: '' };
  return { ...episode, featured_media_url: featuredMedia?.source_url || null, featured_media_alt: featuredMedia?.alt_text || '' };
}

const caseStudiesCache: RelatedPostsCacheState<any[]> = { current: null };

async function loadAllCaseStudies(): Promise<any[]> {
  const { items: casos } = await wordpressFetchCollection<any>(
    `${WORDPRESS_API_URL}/wp/v2/casos-de-exito?status=publish&_embed&per_page=100`,
    { next: { revalidate: 3600 }, headers: { 'Content-Type': 'application/json' } }
  );
  const published = casos.map((caso: Record<string, unknown>) => {
    const sanitized = sanitizeWpPayload(caso) as Record<string, unknown>;
    return applyPublicCaseStudyOverrides(preserveFeaturedMediaUrl(caso, sanitized));
  });
  return mergePublicCaseStudies(published);
}

/** Header, home and service pages share one in-flight listing (3600s). */
export async function getAllCaseStudies(): Promise<any[]> {
  return fetchWithRelatedPostsTtl(caseStudiesCache, loadAllCaseStudies, Date.now, 3600 * 1000);
}
