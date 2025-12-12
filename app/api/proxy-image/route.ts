import { NextRequest, NextResponse } from 'next/server';

// Configurar para Edge Runtime (más rápido y ligero en Vercel)
export const runtime = 'edge';

// Cache agresivo para imágenes
export const revalidate = 31536000; // 1 año

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url');
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' }, 
        { status: 400 }
      );
    }

    // Validar que la URL sea válida y de WordPress
    let imageUrl: URL;
    try {
      imageUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL' }, 
        { status: 400 }
      );
    }

    // Opcional: Validar dominio permitido (seguridad)
    const allowedDomains = [
      'endpoint.playfulagency.com',
      'playfulagency.com',
      'wp.com',
      'wordpress.com'
    ];
    
    const isAllowed = allowedDomains.some(domain => 
      imageUrl.hostname.includes(domain)
    );

    if (!isAllowed) {
      return NextResponse.json(
        { error: 'Domain not allowed' }, 
        { status: 403 }
      );
    }

    // Fetch de la imagen
    const imageResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${imageResponse.status}` },
        { status: imageResponse.status }
      );
    }

    // Obtener el blob de la imagen
    const blob = await imageResponse.blob();
    
    // Determinar Content-Type
    const contentType = imageResponse.headers.get('Content-Type') || 'image/jpeg';

    // Retornar la imagen con headers de caché agresivo
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'CDN-Cache-Control': 'public, max-age=31536000',
        'Vercel-CDN-Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Error proxying image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
