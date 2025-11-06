import { getBlogPosts } from '@/services/wordpress';
import Link from 'next/link';
import Image from 'next/image';
import BlogCategories from './BlogCategories';

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

// Función para extraer el texto del excerpt (eliminar etiquetas HTML)
const getExcerpt = (excerpt: string) => {
  return excerpt.replace(/<[^>]*>?/gm, '').substring(0, 120) + '...';
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // Obtener el número de página y categoría de los parámetros de búsqueda
  const currentPage = typeof searchParams?.page === 'string' ? parseInt(searchParams.page) : 1;
  const category = typeof searchParams?.category === 'string' ? searchParams.category : '';
  const perPage = 9; // Número de posts por página (3x3 grid)

  // Obtener los posts del blog (filtrados por categoría si existe)
  const { posts, totalPages } = await getBlogPosts(currentPage, perPage, category);

  const [featuredPost, ...otherPosts] = posts;

  return (
    <div className="min-h-screen bg-white">

      {/* Barra de categorías */}
      <BlogCategories currentCategory={category} />

      {/* Grid de Posts */}
      <div className="w-full bg-[#E8D5FF] py-12">
        <div className="max-w-7xl mx-auto px-6">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600">No se encontraron artículos en esta categoría.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <article 
                    key={post.id} 
                    className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col"
                  >
                    {/* Ilustración del post */}
                    <div className="mb-4 h-40 rounded-xl overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                      {post.featured_media_url ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={post.featured_media_url}
                            alt={post.featured_media_alt || post.title.rendered}
                            fill
                            className="object-contain p-4"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        </div>
                      ) : (
                        <svg className="w-24 h-24 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>

                    {/* Contenido del post */}
                    {post.categories && post.categories.length > 0 && (
                      <div className="mb-3">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          {post.categories[0].name}
                        </span>
                      </div>
                    )}
                    <Link 
                      href={`/blog/${post.categories?.[0]?.slug || 'sin-categoria'}/${post.slug}`} 
                      className="block"
                    >
                      <h3 className="text-base font-bold text-[#2A0064] mb-3 line-clamp-2 leading-snug hover:text-[#440099] transition-colors">
                        {post.title.rendered}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-600 mb-4 flex-grow line-clamp-3 leading-relaxed">
                      {post.excerpt?.rendered ? getExcerpt(post.excerpt.rendered) : ''}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        {formatDate(post.date)}
                      </span>
                      <Link 
                        href={`/blog/${post.categories?.[0]?.slug || 'sin-categoria'}/${post.slug}`}
                        className="inline-block bg-[#440099] text-white px-6 py-2 rounded-full font-semibold text-sm hover:bg-[#5500BB] transition-colors"
                      >
                        Leer más
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Link
                      key={page}
                      href={`/blog?page=${page}${category ? `&category=${category}` : ''}`}
                      className={`rounded-full transition-all duration-300 ${
                        currentPage === page 
                          ? 'bg-[#440099] w-8 h-3' 
                          : 'bg-[#440099]/30 hover:bg-[#440099]/50 w-3 h-3'
                      }`}
                      aria-label={`Página ${page}`}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata() {
  return {
    title: 'Blog - Playful Agency',
    description: 'Descubre las últimas noticias y consejos sobre marketing digital en nuestro blog.',
    openGraph: {
      title: 'Blog - Playful Agency',
      description: 'Descubre las últimas noticias y consejos sobre marketing digital en nuestro blog.',
      images: [
        {
          url: '/images/og-blog.jpg',
          width: 1200,
          height: 630,
          alt: 'Blog - Playful Agency',
        },
      ],
    },
  };
}
