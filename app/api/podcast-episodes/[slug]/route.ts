import { NextRequest, NextResponse } from 'next/server';
import { getPodcastEpisodeBySlug } from '@/services/wordpress';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  if (!slug) {
    return NextResponse.json({ error: 'missing slug' }, { status: 400 });
  }
  try {
    const episode = await getPodcastEpisodeBySlug(slug);
    if (!episode) {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }
    return NextResponse.json(episode);
  } catch (error) {
    console.error('podcast-episode', slug, error);
    return NextResponse.json({ error: 'unavailable' }, { status: 503 });
  }
}
