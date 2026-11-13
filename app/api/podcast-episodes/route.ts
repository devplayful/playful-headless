import { NextRequest, NextResponse } from 'next/server';
import { getPodcastEpisodes } from '@/services/wordpress';

export async function GET(request: NextRequest) {
  const page = Math.max(1, parseInt(request.nextUrl.searchParams.get('page') || '1', 10) || 1);
  const perPage = Math.min(
    50,
    Math.max(1, parseInt(request.nextUrl.searchParams.get('per_page') || '9', 10) || 9),
  );
  try {
    const data = await getPodcastEpisodes(page, perPage);
    return NextResponse.json(data);
  } catch (error) {
    console.error('podcast-episodes', error);
    return NextResponse.json({ episodes: [], totalPages: 1 }, { status: 503 });
  }
}
