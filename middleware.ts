import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { blogSeoRedirectDecision } from './utils/amp-junk-query';
import { blogClosedDecision } from './utils/blog-closed-paths';
import categoryRedirects from './utils/blog-category-redirect-map.json';
import { BOOKING_HREF, SERVICE_BOOKING_HREF } from './utils/booking';
import {
  ATTRIBUTION_COOKIE_FIRST,
  ATTRIBUTION_COOKIE_LAST,
  attributionCookieOptions,
  nextAttributionFromRequest,
  serializeAttributionCookie,
  shouldCaptureAttributionPath,
} from './lib/contact/attribution';

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

const PERMANENT_301: Record<string, string> = {
  '/servicios': '/agencia-e-commerce',
  '/services': '/agencia-e-commerce',
  '/contacto': '/contactar-agencia-de-marketing-digital',
  '/contactanos': '/contactar-agencia-de-marketing-digital',
  '/casos': '/casos-de-exito',
  '/casos-de-exito-agencia-de-marketing-digital': '/casos-de-exito',
  [SERVICE_BOOKING_HREF]: BOOKING_HREF,
  '/gracias-v2': '/gracias',
  '/blog/email-marketing/tipos-de-publicidad-online':
    'https://playfulagency.com/blog/pautas-digitales/tipos-de-publicidad-online',
  '/blog/pautas-digitales/conoce-todo-sobre-instagram-ads':
    'https://playfulagency.com/blog/otros/conoce-todo-sobre-instagram-ads',
  '/otros/conoce-todo-sobre-instagram-ads':
    'https://playfulagency.com/blog/otros/conoce-todo-sobre-instagram-ads',
  '/agencia-seo-internacional-en-el-2025-es-una-necesidad':
    'https://playfulagency.com/blog/tecnologia/agencia-seo-internacional-en-el-2025-es-una-necesidad',
};

function normalizePath(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
}

export function middleware(request: NextRequest) {
  const path = normalizePath(request.nextUrl.pathname);

  const closed = blogClosedDecision(path);
  if (closed.type === 'gone') {
    return attachAttributionCookies(request, new NextResponse('Gone', {
      status: 410,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    }));
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

  return attachAttributionCookies(request, NextResponse.next());
}

export const config = {
  matcher: [
    '/servicios',
    '/servicios/',
    '/services',
    '/services/',
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
    '/blog',
    '/blog/',
    '/blog/:path*',
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\..*).*)',
  ],
};
