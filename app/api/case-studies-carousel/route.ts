import { NextResponse } from 'next/server';
import { getAllCaseStudies } from '@/services/wordpress-cms';

export async function GET() {
  const casos = await getAllCaseStudies();
  return NextResponse.json(casos, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  });
}
