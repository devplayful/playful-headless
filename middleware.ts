import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { blogSeoRedirectDecision } from './utils/amp-junk-query';
import { blogLegacyListingRedirectDecision } from './utils/blog-legacy-listing-redirects';
import { blogClosedDecision } from './utils/blog-closed-paths';
import categoryRedirects from './utils/blog-category-redirect-map.json';
import canibalizacionOrigins from './utils/blog-canibalizacion-redirect-map.json';
import seoServiceRedirects from './utils/seo-service-redirect-map.json';
import unpublishedLandingRedirects from './utils/unpublished-landing-redirect-map.json';
import { mergeCanibalizacionIntoPermanent301 } from './utils/blog-canibalizacion-redirects';
import {
  ATTRIBUTION_COOKIE_FIRST,
  ATTRIBUTION_COOKIE_LAST,
  attributionCookieOptions,
  nextAttributionFromRequest,
  serializeAttributionCookie,
  shouldCaptureAttributionPath,
} from './lib/contact/attribution';
import { isWpProbePath } from './utils/wp-probe-paths';
import {
  bookingSignalsFromSearch,
  paBookingCookieLine,
} from './lib/analytics/ads-booking-conversion';

function appendPaBookingCookies(request: NextRequest, response: NextResponse): void {
  const hostname = request.nextUrl.hostname;
  for (const signal of bookingSignalsFromSearch(request.nextUrl.search)) {
    response.headers.append(
      'Set-Cookie',
      paBookingCookieLine(signal.name, signal.value, hostname),
    );
  }
}

function attachAttributionCookies(request: NextRequest, response: NextResponse): NextResponse {
  appendPaBookingCookies(request, response);
  if (!shouldCaptureAttributionPath(request.nextUrl.pathname)) return response;
  const { first, last } = nextAttributionFromRequest({
    pathname: request.nextUrl.pathname,
    search: request.nextUrl.search,
    referrer: request.headers.get('referer') || '',
    host: request.nextUrl.hostname,
    firstCookie: request.cookies.get(ATTRIBUTION_COOKIE_FIRST)?.value,
    lastCookie: request.cookies.get(ATTRIBUTION_COOKIE_LAST)?.value,
  });
  const options = attributionCookieOptions();
  response.cookies.set(ATTRIBUTION_COOKIE_FIRST, serializeAttributionCookie(first), options);
  response.cookies.set(ATTRIBUTION_COOKIE_LAST, serializeAttributionCookie(last), options);
  return response;
}

const PUBLIC_CASE_STUDY_SLUGS = new Set([
  'soytechno-ecommerce-venezuela',
  'jumex-shopify-dtc-ecommerce',
  'odwalla-shopify-dtc-ecommerce',
]);

const PERMANENT_301: Record<string, string> = mergeCanibalizacionIntoPermanent301({
  '/servicios': '/agencia-e-commerce',
  '/services': '/agencia-e-commerce',
  '/contacto': '/contactar-agencia-de-marketing-digital',
  '/contactanos': '/contactar-agencia-de-marketing-digital',
  '/casos': '/casos-de-exito',
  '/casos-de-exito-agencia-de-marketing-digital': '/casos-de-exito',
  // E-book PDF (404 since the WP migration; not in WP media): send to the SEO landing.
  '/e-books/Seo-Local/Playful_Agengy_Ebook_seo_local.pdf': '/agencia-seo',
  '/blog/email-marketing/tipos-de-publicidad-online':
    'https://playfulagency.com/blog/pautas-digitales/publicidad-digital-en-tu-negocio',
  '/blog/pautas-digitales/conoce-todo-sobre-instagram-ads':
    'https://playfulagency.com/blog/otros/conoce-todo-sobre-instagram-ads',
  '/otros/conoce-todo-sobre-instagram-ads':
    'https://playfulagency.com/blog/otros/conoce-todo-sobre-instagram-ads',
  '/agencia-seo-internacional-en-el-2025-es-una-necesidad':
    'https://playfulagency.com/blog/tecnologia/agencia-seo-internacional-en-el-2025-es-una-necesidad',
  '/blog/tecnologia/zelle-en-venezuela-un-metodo-pago-para-tu-ecommerce':
    'https://playfulagency.com/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce',
  '/blog/tecnologia/zelle-venezuela-metodo-de-pago-para-tu-ecommerce':
    'https://playfulagency.com/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce',
  '/blog/tecnologia/zelle-venezuela-un-metodo-de-pago-para-tu-ecommerce':
    'https://playfulagency.com/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce',
  '/blog/pautas-digitales/aprende-a-humanizar-la-marca-de-tu-negocio':
    '/blog/pautas-digitales/storytelling-en-el-marketing-digital',
  '/blog/mas-vistos/los-5-procesos-de-e-commerce':
    '/blog/mas-vistos/los-5-problemas-de-e-commerce',
  '/blog/mas-vistos/como-elegir-un-buen-framework':
    '/blog/mas-vistos/como-elegir-el-mejor-framework-para-tu-web',
  ...seoServiceRedirects,
  ...unpublishedLandingRedirects,
  ...canibalizacionOrigins,
}, categoryRedirects);

function normalizePath(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
}

const APEX_HOSTS = new Set(['playfulagency.com', 'www.playfulagency.com']);

type ResolvedRedirect = {
  changed: boolean;
  pathname: string;
  search: string;
  /** Set only when the final hop leaves playfulagency.com. */
  absolute?: string;
};

/**
 * Follows every legacy rule (PERMANENT_301, WP listing paths, category moves,
 * AMP junk params) internally so the client always gets ONE 301 to the
 * final canonical URL: no slash → 308 → 301 chains.
 */
function resolveSingleHopRedirect(startPath: string, startParams: URLSearchParams): ResolvedRedirect {
  let pathname = startPath;
  // WP-era links like `?amp/` carry the slash inside the query key.
  const cleanParams = new URLSearchParams();
  let changed = false;
  startParams.forEach((value, key) => {
    const cleanKey = key.replace(/\/+$/, '');
    if (cleanKey !== key) changed = true;
    if (cleanKey) cleanParams.append(cleanKey, value);
  });
  let search = cleanParams.toString() ? `?${cleanParams.toString()}` : '';
  for (let i = 0; i < 8; i += 1) {
    const dest = PERMANENT_301[pathname];
    if (dest) {
      changed = true;
      if (/^https?:\/\//i.test(dest)) {
        const url = new URL(dest);
        if (!APEX_HOSTS.has(url.hostname)) {
          return { changed, pathname, search, absolute: url.origin + url.pathname };
        }
        pathname = normalizePath(url.pathname);
      } else {
        pathname = normalizePath(dest);
      }
      continue;
    }
    const legacy = blogLegacyListingRedirectDecision(pathname);
    if (legacy.type === 'redirect') {
      changed = true;
      pathname = normalizePath(legacy.pathname);
      search = legacy.search;
      continue;
    }
    const params = new URLSearchParams(search);
    const seo = blogSeoRedirectDecision(pathname, params, categoryRedirects);
    if (seo.type === 'redirect' && (seo.pathname !== pathname || seo.search !== search)) {
      changed = true;
      pathname = normalizePath(seo.pathname);
      search = seo.search;
      continue;
    }
    if (pathname === '/blog/q') {
      changed = true;
      pathname = '/blog';
      continue;
    }
    break;
  }
  return { changed, pathname, search };
}

export function middleware(request: NextRequest) {
  const path = normalizePath(request.nextUrl.pathname);

  if (isWpProbePath(path)) {
    const target = request.nextUrl.clone();
    target.pathname = '/_not-found';
    return attachAttributionCookies(request, NextResponse.rewrite(target));
  }

  const closed = blogClosedDecision(path);
  if (closed.type === 'gone') {
    return attachAttributionCookies(request, new NextResponse('Gone', {
      status: 410,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    }));
  }

  if (path.startsWith('/casos-de-exito/')) {
    const slug = path.slice('/casos-de-exito/'.length);
    if (slug && !slug.includes('/') && !PUBLIC_CASE_STUDY_SLUGS.has(slug)) {
      const target = request.nextUrl.clone();
      target.pathname = '/_not-found';
      return attachAttributionCookies(request, NextResponse.rewrite(target));
    }
  }

  const resolved = resolveSingleHopRedirect(path, request.nextUrl.searchParams);
  const hadTrailingSlash = request.nextUrl.pathname !== path;
  if (resolved.changed || hadTrailingSlash) {
    if (resolved.absolute) {
      const target = new URL(resolved.absolute);
      target.search = resolved.search;
      return attachAttributionCookies(request, NextResponse.redirect(target, 301));
    }
    // Plain URL, not nextUrl.clone(): NextURL re-adds the incoming trailing
    // slash when skipTrailingSlashRedirect is on, which would loop.
    const target = new URL(`${resolved.pathname}${resolved.search}`, request.url);
    return attachAttributionCookies(request, NextResponse.redirect(target, 301));
  }

  // Clean /blog is ISR. Query variants stay on the same public URL via rewrite
  // so pagination, category and search keep working without dynamizing /blog.
  if (path === '/blog' && request.nextUrl.search && request.nextUrl.search !== '?') {
    const target = request.nextUrl.clone();
    target.pathname = '/blog/q';
    return attachAttributionCookies(request, NextResponse.rewrite(target));
  }

  return attachAttributionCookies(request, NextResponse.next());
}

export const config = {
  matcher: [
    '/servicios',
    '/servicios/',
    '/servicios/seo',
    '/servicios/seo/',
    '/servicios/analitica-avanzada',
    '/servicios/analitica-avanzada/',
    '/servicios/desarrollo-web',
    '/servicios/desarrollo-web/',
    '/services',
    '/services/',
    '/landing-seo',
    '/landing-seo/',
    '/seo',
    '/seo/',
    '/contacto',
    '/contacto/',
    '/contactanos',
    '/contactanos/',
    '/casos',
    '/casos/',
    '/casos-de-exito-agencia-de-marketing-digital',
    '/casos-de-exito-agencia-de-marketing-digital/',
    '/reunion-playful',
    '/reunion-playful/',
    '/otros/conoce-todo-sobre-instagram-ads',
    '/otros/conoce-todo-sobre-instagram-ads/',
    '/agencia-seo-internacional-en-el-2025-es-una-necesidad',
    '/agencia-seo-internacional-en-el-2025-es-una-necesidad/',
    '/project/bottle-mockup',
    '/project/bottle-mockup/',
    '/project/cosmetic-mockup',
    '/project/cosmetic-mockup/',
    '/agencylog',
    '/agencylog/',
    '/wp-login.php',
    '/wp-login.php/',
    '/xmlrpc.php',
    '/xmlrpc.php/',
    '/wp-admin',
    '/wp-admin/',
    '/wp-admin/:path*',
    '/blog',
    '/blog/',
    '/blog/:path*',
    '/e-books/:path*',
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\..*).*)',
  ],
};
