import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PERMANENT_301: Record<string, string> = {
  '/servicios': '/agencia-e-commerce',
  '/services': '/agencia-e-commerce',
  '/contacto': '/contactar-agencia-de-marketing-digital',
  '/contactanos': '/contactar-agencia-de-marketing-digital',
  '/casos': '/casos-de-exito-agencia-de-marketing-digital',
};

export function middleware(request: NextRequest) {
  const raw = request.nextUrl.pathname;
  const path = raw.length > 1 ? raw.replace(/\/+$/, '') : raw;
  const dest = PERMANENT_301[path];
  if (!dest) return NextResponse.next();
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
  ],
};
