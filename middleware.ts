import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PERMANENT_301: Record<string, string> = {
  '/servicios': '/agencia-e-commerce',
  '/services': '/agencia-e-commerce',
  '/contacto': '/contactar-agencia-de-marketing-digital',
  '/casos': '/casos-de-exito-agencia-de-marketing-digital',
};

export function middleware(request: NextRequest) {
  const raw = request.nextUrl.pathname;
  const path = raw.length > 1 ? raw.replace(/\/+$/, '') : raw;
  const dest = PERMANENT_301[path];
  if (dest) {
    return NextResponse.redirect(new URL(dest, request.nextUrl.origin), 301);
  }
  if (raw.length > 1 && raw.endsWith('/')) {
    return NextResponse.redirect(new URL(path, request.nextUrl.origin), 308);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|api).*)'],
};
