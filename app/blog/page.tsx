import { getBlogPosts } from '@/services/wordpress';
import Link from 'next/link';
import Image from 'next/image';

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
  return excerpt.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...';
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // Obtener el número de página de los parámetros de búsqueda
  const currentPage = typeof searchParams?.page === 'string' ? parseInt(searchParams.page) : 1;
  const perPage = 6; // Número de posts por página

  // Obtener los posts del blog
  const { posts, totalPages } = await getBlogPosts(currentPage, perPage);

  // Generar los números de página para la paginación
  const pageNumbers = [];
  const maxPageButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
  
  if (endPage - startPage + 1 < maxPageButtons) {
    startPage = Math.max(1, endPage - maxPageButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Nuestro Blog</h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Descubre las últimas noticias, consejos y tendencias en marketing digital
          </p>
        </div>
      </div>

      {/* Blog Posts */}
      <div className="container mx-auto px-4 py-16">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-700">No se encontraron artículos</h2>
            <p className="text-gray-500 mt-2">Pronto publicaremos nuevo contenido.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <article key={post.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                  <Link href={`/blog/${post.slug}`} className="flex flex-col h-full group">
                    <div className="h-48 w-full relative overflow-hidden">
                      {post.featured_media_url ? (
                        <Image
                          src={post.featured_media_url}
                          alt={post.featured_media_alt || post.title.rendered}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <span className="text-gray-400">Sin imagen</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <span>{formatDate(post.date)}</span>
                        {post.categories?.length > 0 && (
                          <>
                            <span className="mx-2">•</span>
                            <span>{post.categories[0].name}</span>
                          </>
                        )}
                      </div>
                      <h2 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-blue-600 transition-colors">
                        {post.title.rendered}
                      </h2>
                      <div className="text-gray-600 mb-4 flex-grow text-sm">
                        {getExcerpt(post.excerpt.rendered)}
                      </div>
                      <div className="flex items-center text-blue-600 font-medium mt-auto">
                        Leer más
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </article>
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <Link 
                    href={`/blog?page=${Math.max(1, currentPage - 1)}`}
                    className={`px-4 py-2 border rounded-md ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 border-blue-300 hover:bg-blue-50'}`}
                    aria-disabled={currentPage === 1}
                    tabIndex={currentPage === 1 ? -1 : undefined}
                  >
                    Anterior
                  </Link>
                  
                  {startPage > 1 && (
                    <>
                      <Link 
                        href="/blog?page=1"
                        className="px-3 py-1 rounded-md hover:bg-blue-50"
                      >
                        1
                      </Link>
                      {startPage > 2 && <span className="px-1">...</span>}
                    </>
                  )}
                  
                  {pageNumbers.map((number) => (
                    <Link
                      key={number}
                      href={`/blog?page=${number}`}
                      className={`px-3 py-1 rounded-md ${currentPage === number ? 'bg-blue-600 text-white' : 'hover:bg-blue-50'}`}
                    >
                      {number}
                    </Link>
                  ))}
                  
                  {endPage < totalPages && (
                    <>
                      {endPage < totalPages - 1 && <span className="px-1">...</span>}
                      <Link 
                        href={`/blog?page=${totalPages}`}
                        className="px-3 py-1 rounded-md hover:bg-blue-50"
                      >
                        {totalPages}
                      </Link>
                    </>
                  )}
                  
                  <Link 
                    href={`/blog?page=${Math.min(totalPages, currentPage + 1)}`}
                    className={`px-4 py-2 border rounded-md ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 border-blue-300 hover:bg-blue-50'}`}
                    aria-disabled={currentPage === totalPages}
                    tabIndex={currentPage === totalPages ? -1 : undefined}
                  >
                    Siguiente
                  </Link>
                </nav>
              </div>
            )}
          </>
        )}
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
