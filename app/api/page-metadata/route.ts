import { NextRequest, NextResponse } from 'next/server';
import { getPageMetadataBySlug } from '@/services/wordpress';

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug');
  if (!slug) {
    return NextResponse.json({ error: 'slug required' }, { status: 400 });
  }
  try {
    const metadata = await getPageMetadataBySlug(slug);
    return NextResponse.json(metadata);
  } catch (error) {
    console.error('page-metadata', slug, error);
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
}
