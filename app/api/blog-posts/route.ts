import { NextResponse } from 'next/server';
import { getLatestBlogPosts } from '@/services/wordpress';

export async function GET() {
  try {
    // Obtener 6 publicaciones del blog
    const posts = await getLatestBlogPosts(6);
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Error al cargar las publicaciones' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
