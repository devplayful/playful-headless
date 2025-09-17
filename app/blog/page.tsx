import { getPageMetadataBySlug } from '@/services/wordpress';

// Datos de ejemplo de publicaciones del blog
const blogPosts = [
  {
    id: 1,
    title: 'Las 10 tendencias de marketing digital para 2024',
    slug: 'tendencias-marketing-digital-2024',
    excerpt: 'Descubre las estrategias que dominarán el panorama digital este año y cómo aplicarlas a tu negocio.',
    date: '15 de enero, 2024',
    category: 'Marketing Digital',
    image: '/images/blog/tendencias-2024.jpg',
    readTime: '5 min de lectura'
  },
  {
    id: 2,
    title: 'Cómo mejorar el SEO técnico de tu sitio web',
    slug: 'mejorar-seo-tecnico',
    excerpt: 'Guía completa para optimizar los aspectos técnicos de tu sitio web y mejorar tu posicionamiento en buscadores.',
    date: '8 de enero, 2024',
    category: 'SEO',
    image: '/images/blog/seo-tecnico.jpg',
    readTime: '7 min de lectura'
  },
  {
    id: 3,
    title: 'Estrategias efectivas de email marketing para conversiones',
    slug: 'email-marketing-conversiones',
    excerpt: 'Aprende a diseñar campañas de email marketing que generen resultados tangibles para tu negocio.',
    date: '2 de enero, 2024',
    category: 'Email Marketing',
    image: '/images/blog/email-marketing.jpg',
    readTime: '6 min de lectura'
  },
  {
    id: 4,
    title: 'Guía completa de Google Analytics 4',
    slug: 'guia-google-analytics-4',
    excerpt: 'Todo lo que necesitas saber para sacar el máximo provecho de la nueva versión de Google Analytics.',
    date: '28 de diciembre, 2023',
    category: 'Analítica',
    image: '/images/blog/ga4.jpg',
    readTime: '8 min de lectura'
  },
  {
    id: 5,
    title: 'Diseño web conversional: principios y mejores prácticas',
    slug: 'diseno-web-conversional',
    excerpt: 'Cómo diseñar sitios web que no solo se vean bien, sino que también conviertan visitantes en clientes.',
    date: '20 de diciembre, 2023',
    category: 'Diseño Web',
    image: '/images/blog/diseno-conversional.jpg',
    readTime: '6 min de lectura'
  },
  {
    id: 6,
    title: 'El poder del storytelling en el marketing de contenidos',
    slug: 'storytelling-marketing-contenidos',
    excerpt: 'Aprende a contar historias que conecten emocionalmente con tu audiencia y mejoren tus resultados de marketing.',
    date: '12 de diciembre, 2023',
    category: 'Contenidos',
    image: '/images/blog/storytelling.jpg',
    readTime: '5 min de lectura'
  }
];

// Categorías del blog
const categories = [
  { name: 'Todos', slug: 'todos', count: 12 },
  { name: 'Marketing Digital', slug: 'marketing-digital', count: 5 },
  { name: 'SEO', slug: 'seo', count: 4 },
  { name: 'Redes Sociales', slug: 'redes-sociales', count: 3 },
  { name: 'Diseño Web', slug: 'diseno-web', count: 3 },
  { name: 'Email Marketing', slug: 'email-marketing', count: 2 },
  { name: 'Analítica', slug: 'analitica', count: 2 },
  { name: 'Contenidos', slug: 'contenidos', count: 4 }
];

export default async function BlogPage() {
  try {
    const metadata = await getPageMetadataBySlug('blog');
    
    return (
      <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Encabezado */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {metadata.yoast_wpseo_title || 'Blog de Marketing Digital'}
            </h1>
            {metadata.yoast_wpseo_metadesc && (
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {metadata.yoast_wpseo_metadesc}
              </p>
            )}
          </div>
          
          {/* Filtros de categoría */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category.slug}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  category.slug === 'todos'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
          
          {/* Listado de artículos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <article key={post.id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Imagen: {post.title}</span>
                </div>
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <span>{post.date}</span>
                    <span className="mx-2">•</span>
                    <span>{post.readTime}</span>
                  </div>
                  <span className="inline-block bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full mb-3">
                    {post.category}
                  </span>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-purple-600 transition-colors">
                    <a href={`/blog/${post.slug}`}>
                      {post.title}
                    </a>
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {post.excerpt}
                  </p>
                  <a 
                    href={`/blog/${post.slug}`}
                    className="text-purple-600 hover:text-purple-800 font-medium inline-flex items-center text-sm"
                  >
                    Leer más
                    <svg className="w-3.5 h-3.5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </article>
            ))}
          </div>
          
          {/* Paginación */}
          <div className="mt-12 flex justify-center">
            <nav className="inline-flex rounded-md shadow -space-x-px" aria-label="Pagination">
              <a
                href="#"
                className="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <span className="sr-only">Anterior</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                </svg>
              </a>
              <a
                href="#"
                aria-current="page"
                className="relative z-10 inline-flex items-center border border-purple-500 bg-purple-50 px-4 py-2 text-sm font-medium text-purple-600"
              >
                1
              </a>
              <a
                href="#"
                className="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                2
              </a>
              <a
                href="#"
                className="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                3
              </a>
              <a
                href="#"
                className="relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <span className="sr-only">Siguiente</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </a>
            </nav>
          </div>
          
          {/* Suscripción al boletín */}
          <div className="mt-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Suscríbete a nuestro boletín</h2>
            <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
              Recibe las últimas noticias, consejos y recursos de marketing digital directamente en tu bandeja de entrada.
            </p>
            <form className="max-w-md mx-auto flex gap-2">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <button
                type="submit"
                className="bg-white text-purple-700 font-medium px-6 py-3 rounded-lg hover:bg-purple-50 transition-colors"
              >
                Suscribirse
              </button>
            </form>
            <p className="text-xs text-purple-200 mt-3">
              Nos tomamos en serio tu privacidad. Nunca compartiremos tu información.
            </p>
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error('Error al cargar la página del blog:', error);
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">No se pudo cargar la página del blog.</p>
        </div>
      </main>
    );
  }
}

export async function generateMetadata() {
  try {
    const metadata = await getPageMetadataBySlug('blog');
    
    return {
      title: metadata.yoast_wpseo_title || 'Blog de Marketing Digital - Playful Agency',
      description: metadata.yoast_wpseo_metadesc || 'Artículos, noticias y consejos sobre marketing digital, SEO, redes sociales, diseño web y más. Mantente actualizado con las últimas tendencias.',
      openGraph: {
        title: metadata.yoast_wpseo_og_title || 'Blog de Marketing Digital - Playful Agency',
        description: metadata.yoast_wpseo_og_description || metadata.yoast_wpseo_metadesc || 'Artículos, noticias y consejos sobre marketing digital, SEO, redes sociales, diseño web y más. Mantente actualizado con las últimas tendencias.',
        type: 'website',
        url: 'https://playfulagency.com/blog',
        images: metadata.yoast_wpseo_og_image ? [{
          url: metadata.yoast_wpseo_og_image,
          width: 1200,
          height: 630,
          alt: 'Blog de Marketing Digital - Playful Agency',
        }] : [],
      },
    };
  } catch (error) {
    console.error('Error al generar metadatos de la página del blog:', error);
    return {
      title: 'Blog de Marketing Digital - Playful Agency',
      description: 'Artículos, noticias y consejos sobre marketing digital, SEO, redes sociales, diseño web y más. Mantente actualizado con las últimas tendencias.',
    };
  }
}
