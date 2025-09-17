import { getBlogPostBySlug, getBlogPosts } from '@/services/wordpress';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  // Obtener todos los slugs de los posts para generar las páginas estáticas
  const { posts } = await getBlogPosts(1, 100); // Ajusta el número según sea necesario
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// Función para formatear la fecha
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    timeZone: 'UTC'
  };
  return new Date(dateString).toLocaleDateString('es-ES', options);
};

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  // Extraer la categoría principal del post
  const mainCategory = post.categories?.[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Encabezado del post */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <Link 
              href="/blog" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver al blog
            </Link>
            
            {mainCategory && (
              <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full mb-4">
                {mainCategory.name}
              </span>
            )}
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {post.title.rendered}
            </h1>
            
            <div className="flex items-center text-sm text-gray-500">
              <span>{formatDate(post.date)}</span>
              <span className="mx-2">•</span>
              <span>{Math.ceil(post.content.rendered.split(/\s+/).length / 200)} min de lectura</span>
            </div>
          </div>
        </div>
      </div>

      {/* Imagen destacada */}
      {post.featured_media_url && (
        <div className="container mx-auto px-4 mb-12">
          <div className="max-w-5xl mx-auto rounded-lg overflow-hidden shadow-lg">
            <div className="relative h-96 w-full">
              <Image
                src={post.featured_media_url}
                alt={post.featured_media_alt || post.title.rendered}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      )}

      {/* Contenido del post */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-3xl mx-auto">
          <div 
            className="prose prose-blue max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content.rendered }}
          />
          
          {/* Etiquetas */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Etiquetas:</h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link 
                    key={tag.id} 
                    href={`/blog/etiqueta/${tag.slug}`}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          {/* Compartir en redes sociales */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Compartir:</h3>
            <div className="flex space-x-4">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://tudominio.com/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-blue-600 transition-colors"
                aria-label="Compartir en Facebook"
              >
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://tudominio.com/blog/${post.slug}`)}&text=${encodeURIComponent(post.title.rendered)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-blue-400 transition-colors"
                aria-label="Compartir en Twitter"
              >
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://tudominio.com/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-blue-700 transition-colors"
                aria-label="Compartir en LinkedIn"
              >
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getBlogPostBySlug(params.slug);
  
  if (!post) {
    return {
      title: 'Post no encontrado',
      description: 'El post que estás buscando no existe o ha sido eliminado.',
    };
  }

  // Extraer el texto del contenido sin etiquetas HTML
  const excerpt = post.excerpt.rendered.replace(/<[^>]*>?/gm, '');
  
  return {
    title: post.title.rendered,
    description: excerpt,
    openGraph: {
      title: post.title.rendered,
      description: excerpt,
      images: post.featured_media_url ? [{
        url: post.featured_media_url,
        width: 1200,
        height: 630,
        alt: post.title.rendered,
      }] : [],
    },
  };
}
