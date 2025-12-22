import { getBlogPosts } from '@/services/wordpress';
import Link from 'next/link';
import Image from 'next/image';
import BlogCategories from './BlogCategories';
import NosotrosCTASection from '@/components/sections/NosotrosCTASection';
import MostViewedArticles from '@/components/blog/MostViewedArticles';
import TwoColumnCtaSection from '@/components/ui/TwoColumnCtaSection';

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
  const perPage = 10; // 1 destacado + 9 en el grid (3x3)

  // Obtener los posts del blog (filtrados por categoría si existe)
  const { posts, totalPages } = await getBlogPosts(currentPage, perPage, category);

  return (
    <div className="min-h-screen">
      {/* Último artículo destacado */}
      {posts.length > 0 && (
        <div className="w-full pt-4">
          <div className="max-w-7xl mx-auto px-6 pb-12">
            <div>
              <div className="bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
                {/* Imagen del artículo destacado con fondo colorido */}
                <div className="h-80 md:h-96 w-full relative bg-white">
                  {posts[0].featured_media_url ? (
                    <div className="relative w-full h-full flex items-center justify-center p-8">
                      <Image
                        src={posts[0].featured_media_url}
                        alt={posts[0].featured_media_alt || posts[0].title.rendered}
                        fill
                        className="object-contain p-8"
                        sizes="(max-width: 768px) 100vw, 80vw"
                        priority
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-32 h-32 text-white opacity-50" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Contenido del artículo destacado */}
                <div className="p-8 md:p-10">
                  {/* Metadata superior */}
                  <div className="flex flex-wrap items-center justify-between mb-4 text-sm gap-3">
                    <div className="flex items-center gap-2 bg-[#F0E6FF] px-4 py-2 rounded-full">
                      <svg className="w-4 h-4 text-[#440099]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <span className="text-[#440099] font-semibold">{posts[0].author_name?.toUpperCase() || 'PLAYFUL AGENCY'}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#F0E6FF] px-4 py-2 rounded-full">
                      <svg className="w-4 h-4 text-[#440099]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span className="text-[#440099] font-semibold">{formatDate(posts[0].date)}</span>
                    </div>
                  </div>

                  {/* Título destacado */}
                  <Link 
                    href={`/blog/${posts[0].categories?.[0]?.slug || 'sin-categoria'}/${posts[0].slug}`}
                    className="block mb-4"
                  >
                    <h1 className="text-[1.4rem] md:text-4xl lg:text-5xl font-bold text-[#440099] hover:text-[#5500BB] transition-colors leading-tight">
                      {posts[0].title.rendered}
                    </h1>
                  </Link>
                  
                  <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                    {posts[0].excerpt?.rendered ? getExcerpt(posts[0].excerpt.rendered) : ''}
                  </p>
                  
                  <Link 
                    href={`/blog/${posts[0].categories?.[0]?.slug || 'sin-categoria'}/${posts[0].slug}`}
                    className="inline-block bg-[#440099] text-white px-8 py-3 rounded-full font-bold text-base hover:bg-[#5500BB] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    LEER ARTÍCULO ›
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Artículos Más Vistos */}
      <MostViewedArticles posts={posts} />

      {/* Barra de categorías */}
      <div className="w-full pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <BlogCategories currentCategory={category} />
        </div>
      </div>

      {/* Grid de Posts */}
      <div className="w-full pt-0 pb-0 md:pb-6">
        <div className="max-w-7xl mx-auto px-6">
          {posts.length <= 1 ? (
            <div className="text-center py-12">
              <p className="text-lg text-gray-700">No se encontraron más artículos en esta categoría.</p>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-[#440099] mb-10">Más Artículos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 bg-[#D2BBFF] p-10 rounded-[10px]">
                {posts.slice(1).map((post) => (
                  <article 
                    key={post.id} 
                    className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col hover:-translate-y-1"
                  >
                    {/* Imagen del artículo con fondo colorido */}
                    <div className="h-56 relative bg-white">
                      {post.featured_media_url ? (
                        <div className="relative w-full h-full">
                          <Image
                            src={post.featured_media_url}
                            alt={post.featured_media_alt || post.title.rendered}
                            fill
                            className="object-contain p-6 hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-20 h-20 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Contenido del post */}
                    <div className="p-6 flex flex-col flex-grow">
                      {/* Categoría con badge */}
                      {post.categories && post.categories.length > 0 && (
                        <div className="mb-3">
                          <span className="inline-block bg-[#F0E6FF] text-[#440099] px-4 py-1.5 rounded-full text-xs font-bold uppercase">
                            {post.categories[0].name}
                          </span>
                        </div>
                      )}

                      {/* Título */}
                      <Link 
                        href={`/blog/${post.categories?.[0]?.slug || 'sin-categoria'}/${post.slug}`} 
                        className="block mb-3"
                      >
                        <h3 className="text-xl font-bold text-[#440099] line-clamp-2 leading-tight hover:text-[#5500BB] transition-colors">
                          {post.title.rendered}
                        </h3>
                      </Link>
                      
                      {/* Párrafo */}
                      <p className="text-sm text-gray-700 mb-4 flex-grow line-clamp-3 leading-relaxed">
                        {post.excerpt?.rendered ? getExcerpt(post.excerpt.rendered) : ''}
                      </p>
                      
                      {/* Fecha y botón */}
                      <div className="flex flex-col gap-3 mt-auto">
                        <span className="text-xs text-gray-500 font-medium">
                          {formatDate(post.date)}
                        </span>
                        <Link 
                          href={`/blog/${post.categories?.[0]?.slug || 'sin-categoria'}/${post.slug}`}
                          className="w-full bg-[#440099] text-white py-3 rounded-full font-bold text-sm text-center hover:bg-[#5500BB] transition-all shadow-md hover:shadow-lg"
                        >
                          LEER MÁS
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="mt-12 mb-10 flex justify-center items-center gap-4">
                  <Link
                    href={`/blog?page=${currentPage - 1}${category ? `&category=${category}` : ''}`}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md ${
                      currentPage === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none'
                        : 'bg-white text-[#440099] hover:bg-[#440099] hover:text-white'
                    }`}
                    aria-label="Página anterior"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </Link>
                  
                  <span className="text-lg font-bold text-[#440099]">
                    {currentPage} / {totalPages}
                  </span>
                  
                  <Link
                    href={`/blog?page=${currentPage + 1}${category ? `&category=${category}` : ''}`}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md ${
                      currentPage === totalPages
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none'
                        : 'bg-[#440099] text-white hover:bg-[#5500BB]'
                    }`}
                    aria-label="Página siguiente"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <section className="w-[calc(100%-80px)] max-w-[1200px] mx-auto mt-8 mb-20">
        <TwoColumnCtaSection />
      </section>
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
