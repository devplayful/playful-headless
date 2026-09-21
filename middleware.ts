import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { blogSeoRedirectDecision } from './utils/amp-junk-query';
import { blogClosedDecision } from './utils/blog-closed-paths';
import categoryRedirects from './utils/blog-category-redirect-map.json';

const PERMANENT_301: Record<string, string> = {
  '/servicios': '/agencia-e-commerce',
  '/services': '/agencia-e-commerce',
  '/contacto': '/contactar-agencia-de-marketing-digital',
  '/contactanos': '/contactar-agencia-de-marketing-digital',
  '/casos': '/casos-de-exito',
  '/casos-de-exito-agencia-de-marketing-digital': '/casos-de-exito',
  '/reunion-playful': 'https://api.playfulagency.com/widget/bookings/reunion-playful',
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
    return new NextResponse('Gone', {
      status: 410,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const dest = PERMANENT_301[path];
  if (dest) {
    if (/^https?:\/\//i.test(dest)) {
      const target = new URL(dest);
      target.search = request.nextUrl.search;
      return NextResponse.redirect(target, 301);
    }

    const target = request.nextUrl.clone();
    target.pathname = dest;
    return NextResponse.redirect(target, 301);
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
    return NextResponse.redirect(target, blogSeo.status);
  }

  return NextResponse.next();
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
  ],
};
