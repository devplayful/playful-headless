import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { blogSeoRedirectDecision } from './utils/amp-junk-query';
import { blogClosedDecision } from './utils/blog-closed-paths';
import categoryRedirects from './utils/blog-category-redirect-map.json';
import canibalizacionOrigins from './utils/blog-canibalizacion-redirect-map.json';
import seoServiceRedirects from './utils/seo-service-redirect-map.json';
import { mergeCanibalizacionIntoPermanent301 } from './utils/blog-canibalizacion-redirects';
import {
  ATTRIBUTION_COOKIE_FIRST,
  ATTRIBUTION_COOKIE_LAST,
  attributionCookieOptions,
  nextAttributionFromRequest,
  serializeAttributionCookie,
  shouldCaptureAttributionPath,
} from './lib/contact/attribution';
import { resolveBookingWidgetRedirect } from './utils/booking-attribution';
import { isWpProbePath } from './utils/wp-probe-paths';

function attachAttributionCookies(request: NextRequest, response: NextResponse): NextResponse {
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
  '/gracias-v2': '/gracias',
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
  ...seoServiceRedirects,
  ...canibalizacionOrigins,
}, categoryRedirects);

function normalizePath(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
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

  if (path === '/reunion-playful') {
    const { location, status } = resolveBookingWidgetRedirect({
      search: request.nextUrl.search,
      lastCookie: request.cookies.get(ATTRIBUTION_COOKIE_LAST)?.value,
      firstCookie: request.cookies.get(ATTRIBUTION_COOKIE_FIRST)?.value,
    });
    return attachAttributionCookies(request, NextResponse.redirect(location, {
      status,
      headers: { 'Cache-Control': 'private, no-store' },
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

  const dest = PERMANENT_301[path];
  if (dest) {
    if (/^https?:\/\//i.test(dest)) {
      const target = new URL(dest);
      target.search = request.nextUrl.search;
      return attachAttributionCookies(request, NextResponse.redirect(target, 301));
    }

    const target = request.nextUrl.clone();
    target.pathname = dest;
    return attachAttributionCookies(request, NextResponse.redirect(target, 301));
  }

  const blogSeo = blogSeoRedirectDecision(
    request.nextUrl.pathname,
    request.nextUrl.searchParams,
    categoryRedirects,
  );
  if (blogSeo.type === 'redirect') {
    const target = request.nextUrl.clone();
    target.pathname = blogSeo.pathname;
    target.search = blogSeo.search;
    return attachAttributionCookies(request, NextResponse.redirect(target, blogSeo.status));
  }

  // Clean /blog is ISR. Query variants stay on the same public URL via rewrite
  // so pagination, category and search keep working without dynamizing /blog.
  if (path === '/blog/q') {
    const target = request.nextUrl.clone();
    target.pathname = '/blog';
    return attachAttributionCookies(request, NextResponse.redirect(target, 308));
  }
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
    '/gracias-v2',
    '/gracias-v2/',
    '/otros/conoce-todo-sobre-instagram-ads',
    '/otros/conoce-todo-sobre-instagram-ads/',
    '/agencia-seo-internacional-en-el-2025-es-una-necesidad',
    '/agencia-seo-internacional-en-el-2025-es-una-necesidad/',
    '/project/bottle-mockup',
    '/project/bottle-mockup/',
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
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\..*).*)',
  ],
};
