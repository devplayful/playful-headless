import type { WPPost } from '../services/wordpress';
import {
  ESHOW_MADRID_2026_ABOUT_NAME,
  ESHOW_MADRID_2026_BODY_HTML,
  ESHOW_MADRID_2026_CABECERA_ALT,
  ESHOW_MADRID_2026_CABECERA_SRC,
  ESHOW_MADRID_2026_CANONICAL,
  ESHOW_MADRID_2026_CATEGORY_ID,
  ESHOW_MADRID_2026_CATEGORY_SLUG,
  ESHOW_MADRID_2026_DATE_PUBLISHED_PROVISIONAL,
  ESHOW_MADRID_2026_EXCERPT,
  ESHOW_MADRID_2026_H1,
  ESHOW_MADRID_2026_META,
  ESHOW_MADRID_2026_PATH,
  ESHOW_MADRID_2026_SLUG,
  ESHOW_MADRID_2026_TITLE,
  eshowMadrid2026DateModified,
} from './eshow-madrid-2026.ts';

export {
  ESHOW_LISTA_FORM_ID,
  ESHOW_LISTA_FORM_MARKER,
  ESHOW_LISTA_FORM_SLOT,
  ESHOW_MADRID_2026_ABOUT_NAME,
  ESHOW_MADRID_2026_BODY_HTML,
  ESHOW_MADRID_2026_CABECERA_ALT,
  ESHOW_MADRID_2026_CABECERA_SRC,
  ESHOW_MADRID_2026_CANONICAL,
  ESHOW_MADRID_2026_CATEGORY_ID,
  ESHOW_MADRID_2026_CATEGORY_SLUG,
  ESHOW_MADRID_2026_DATE_PUBLISHED_PROVISIONAL,
  ESHOW_MADRID_2026_EXCERPT,
  ESHOW_MADRID_2026_H1,
  ESHOW_MADRID_2026_IMAGE_HEIGHT,
  ESHOW_MADRID_2026_IMAGE_WIDTH,
  ESHOW_MADRID_2026_META,
  ESHOW_MADRID_2026_PATH,
  ESHOW_MADRID_2026_PROGRAMA_ALT,
  ESHOW_MADRID_2026_PROGRAMA_SRC,
  ESHOW_MADRID_2026_SLUG,
  ESHOW_MADRID_2026_TITLE,
  eshowMadrid2026DateModified,
  formatEshowActualizadoLine,
} from './eshow-madrid-2026.ts';

/**
 * Staging-only blog posts that must not exist in WordPress.
 * Staging and production read the same WP (`endpoint.playfulagency.com`),
 * so publishing there would leak to playfulagency.com.
 *
 * Gate: never on Vercel production or the `main` git ref.
 * Staging branch / preview / local tests serve these slugs.
 *
 * ## Al pasar a producción (GO de Jose o Ale)
 * 1. Sustituir `ESHOW_MADRID_2026_DATE_PUBLISHED_PROVISIONAL` por la hora
 *    real del deploy (ISO con offset Europe/Madrid). No volver a tocarla.
 * 2. Añadir `/blog/otros/eshow-madrid-2026` a `SITEMAP_BLOG_PATHS` en
 *    `utils/apex-sitemap.ts`. El lastmod ya sigue a `eshowMadrid2026DateModified()`.
 * 3. Definir `GHL_TAG_ESHOW_LISTA` (Ops/Email). Mientras falte, el formulario
 *    valida y confirma, pero no escribe en GHL.
 * 4. Quitar el gate o mover el post a un registro de producción solo cuando
 *    el GO lo pida. No publicar en WP antes.
 */
export type StagingLocalBlogEnv = Record<string, string | undefined>;

export function isStagingLocalBlogEnabled(
  env: StagingLocalBlogEnv = process.env,
): boolean {
  if (env.VERCEL_ENV === 'production') return false;
  if (env.VERCEL_GIT_COMMIT_REF === 'main') return false;
  return true;
}

const STEFANNI_AVATAR =
  'https://secure.gravatar.com/avatar/0f4c6477fcdde767d8b99e553bf16a6c658373005f85299e5eb6e1a576571645?s=48&d=mm&r=g';

function buildEshowMadrid2026Post(): WPPost {
  const published = ESHOW_MADRID_2026_DATE_PUBLISHED_PROVISIONAL;
  const modified = eshowMadrid2026DateModified();
  return {
    id: 90002610,
    date: published,
    date_gmt: published,
    modified,
    modified_gmt: modified,
    slug: ESHOW_MADRID_2026_SLUG,
    link: ESHOW_MADRID_2026_CANONICAL,
    title: { rendered: ESHOW_MADRID_2026_H1 },
    content: { rendered: ESHOW_MADRID_2026_BODY_HTML, protected: false },
    excerpt: { rendered: `<p>${ESHOW_MADRID_2026_EXCERPT}</p>`, protected: false },
    featured_media_url: ESHOW_MADRID_2026_CABECERA_SRC,
    featured_media_alt: ESHOW_MADRID_2026_CABECERA_ALT,
    categories: [
      {
        id: ESHOW_MADRID_2026_CATEGORY_ID,
        name: 'Otros',
        slug: ESHOW_MADRID_2026_CATEGORY_SLUG,
        taxonomy: 'category',
      },
    ],
    tags: [],
    author: {
      id: 21,
      name: 'Stefanni Parabavidez',
      slug: 'stefanniparabavidez',
      avatar_urls: {
        '24': STEFANNI_AVATAR.replace('s=48', 's=24'),
        '48': STEFANNI_AVATAR,
        '96': STEFANNI_AVATAR.replace('s=48', 's=96'),
      },
    },
    author_name: 'Stefanni Parabavidez',
    status: 'publish',
    type: 'post',
  };
}

const LOCAL_BLOG_POSTS: Record<string, WPPost> = {
  [ESHOW_MADRID_2026_SLUG]: buildEshowMadrid2026Post(),
};

export function getStagingLocalBlogPost(
  slug: string | undefined | null,
  env: StagingLocalBlogEnv = process.env,
): WPPost | null {
  if (!slug || !isStagingLocalBlogEnabled(env)) return null;
  return LOCAL_BLOG_POSTS[slug] || null;
}

export function listStagingLocalBlogStaticParams(
  env: StagingLocalBlogEnv = process.env,
): Array<{ slug: string[] }> {
  if (!isStagingLocalBlogEnabled(env)) return [];
  return [{ slug: [ESHOW_MADRID_2026_CATEGORY_SLUG, ESHOW_MADRID_2026_SLUG] }];
}

export function listStagingSitemapBlogEntries(
  env: StagingLocalBlogEnv = process.env,
): Array<{ loc: string; lastmod: string }> {
  if (!isStagingLocalBlogEnabled(env)) return [];
  return [{
    loc: `https://playfulagency.com${ESHOW_MADRID_2026_PATH}`,
    lastmod: eshowMadrid2026DateModified(),
  }];
}

export function blogArticleJsonLdExtras(slug: string | undefined | null): {
  type?: 'Article';
  about?: { '@type': 'Thing'; name: string };
  inLanguage?: string;
  authorType?: 'Organization';
  authorUrl?: string;
} {
  if (slug !== ESHOW_MADRID_2026_SLUG) return {};
  return {
    type: 'Article',
    about: { '@type': 'Thing', name: ESHOW_MADRID_2026_ABOUT_NAME },
    inLanguage: 'es-ES',
    authorType: 'Organization',
    authorUrl: 'https://playfulagency.com',
  };
}
