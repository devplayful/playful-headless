import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { blogAmpJunkDecision } from './utils/amp-junk-query';

const PERMANENT_301: Record<string, string> = {
  '/servicios': '/agencia-e-commerce',
  '/services': '/agencia-e-commerce',
  '/contacto': '/contactar-agencia-de-marketing-digital',
  '/contactanos': '/contactar-agencia-de-marketing-digital',
  '/casos': '/casos-de-exito-agencia-de-marketing-digital',
  '/reunion-playful': 'https://api.playfulagency.com/widget/bookings/reunion-playful',
};

function normalizePath(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
}

export function middleware(request: NextRequest) {
  const path = normalizePath(request.nextUrl.pathname);

  const ampJunk = blogAmpJunkDecision(request.nextUrl.pathname, request.nextUrl.searchParams);
  if (ampJunk.type === 'redirect') {
    const target = request.nextUrl.clone();
    target.pathname = ampJunk.pathname;
    target.search = ampJunk.search;
    return NextResponse.redirect(target, ampJunk.status);
  }

  const dest = PERMANENT_301[path];
  if (!dest) return NextResponse.next();

  if (/^https?:\/\//i.test(dest)) {
    const target = new URL(dest);
    target.search = request.nextUrl.search;
    return NextResponse.redirect(target, 301);
  }

  const target = request.nextUrl.clone();
  target.pathname = dest;
  return NextResponse.redirect(target, 301);
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
    '/reunion-playful',
    '/reunion-playful/',
    '/blog',
    '/blog/',
    '/blog/:path*',
  ],
};
