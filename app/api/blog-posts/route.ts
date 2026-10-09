import { NextResponse } from 'next/server';
import { getLatestBlogPosts } from '@/services/wordpress';
import {
  RELATED_BLOG_CARD_COUNT,
  RELATED_BLOG_FETCH_COUNT,
  excludeCurrentBlogPost,
} from '@/lib/blog-related-posts';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const exclude = searchParams.get('exclude') || searchParams.get('excludeSlug');
    const posts = await getLatestBlogPosts(
      exclude ? RELATED_BLOG_FETCH_COUNT : RELATED_BLOG_CARD_COUNT,
    );
    const payload = exclude
      ? excludeCurrentBlogPost(posts, { slug: exclude, id: exclude })
      : posts;
    return NextResponse.json(payload);
  } catch (error) {
    console.error('Error fetching blog posts', error);
    return NextResponse.json(
      { error: 'Error al cargar las publicaciones' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
