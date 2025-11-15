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
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Obtener el número de página y categoría de los parámetros de búsqueda
  const resolvedSearchParams = await searchParams;
  const currentPage = typeof resolvedSearchParams?.page === 'string' ? parseInt(resolvedSearchParams.page) : 1;
  const category = typeof resolvedSearchParams?.category === 'string' ? resolvedSearchParams.category : '';
  const perPage = 9; // Número de posts por página (3x3 grid)

  // Obtener los posts del blog (filtrados por categoría si existe)
  const { posts, totalPages } = await getBlogPosts(currentPage, perPage, category);

  return (
    <div className="min-h-screen bg-white">
      {/* Último artículo destacado */}
      {posts.length > 0 && (
        <div className="w-full bg-[#E8D5FF] pt-12">
          <div className="max-w-7xl mx-auto px-6 pb-12">
            <div>
              <h2 className="text-2xl font-bold text-[#2A0064] mb-8">Último Artículo</h2>
              <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                {/* Imagen del artículo destacado */}
                <div className="h-80 md:h-96 w-full relative">
                  {posts[0].featured_media_url ? (
                    <Image
                      src={posts[0].featured_media_url}
                      alt={posts[0].featured_media_alt || posts[0].title.rendered}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 80vw"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                      <svg className="w-24 h-24 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Contenido del artículo destacado */}
                <div className="p-8">
                  {posts[0].categories && posts[0].categories.length > 0 && (
                    <div className="mb-3">
                      <span className="text-sm font-semibold text-purple-600 uppercase tracking-wide">
                        {posts[0].categories[0].name}
                      </span>
                    </div>
                  )}
                  
                  <Link 
                    href={`/blog/${posts[0].categories?.[0]?.slug || 'sin-categoria'}/${posts[0].slug}`}
                    className="block mb-4"
                  >
                    <h3 className="text-2xl md:text-3xl font-bold text-[#2A0064] hover:text-[#440099] transition-colors">
                      {posts[0].title.rendered}
                    </h3>
                  </Link>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {posts[0].excerpt?.rendered ? getExcerpt(posts[0].excerpt.rendered) : ''}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {formatDate(posts[0].date)}
                    </span>
                    <Link 
                      href={`/blog/${posts[0].categories?.[0]?.slug || 'sin-categoria'}/${posts[0].slug}`}
                      className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center"
                    >
                      Leer más
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Barra de categorías */}
      <div className="w-full bg-[#E8D5FF] pb-6">
        <div className="max-w-7xl mx-auto px-6">
          <BlogCategories currentCategory={category} />
        </div>
      </div>

      {/* Grid de Posts */}
      <div className="w-full bg-[#E8D5FF] pt-0 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          {posts.length <= 1 ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600">No se encontraron más artículos en esta categoría.</p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-[#2A0064] mb-8">Más Artículos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.slice(1).map((post) => (
                  <article 
                    key={post.id} 
                    className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col"
                  >
                    {/* Imagen del artículo */}
                    <div className="mb-4 h-48 rounded-xl overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100">
                      {post.featured_media_url ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={post.featured_media_url}
                            alt={post.featured_media_alt || post.title.rendered}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-24 h-24 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </div>
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
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xs text-gray-500">
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
