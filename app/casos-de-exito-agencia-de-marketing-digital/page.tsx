import { getPageMetadataBySlug } from '@/services/wordpress';

// Datos de ejemplo de casos de éxito
const caseStudies = [
  {
    id: 1,
    title: 'Policlínica Metropolitana',
    slug: 'policlinica-metropolitana',
    description: 'Aumento del 150% en citas médicas online mediante estrategias de SEO y publicidad digital.',
    category: 'Salud',
    image: '/images/casos/policlinica.jpg',
  },
  {
    id: 2,
    title: 'Mercantil Servicios Financieros',
    slug: 'mercantil-servicios-financieros-internacional',
    description: 'Diseño de estrategia de marketing digital para expansión internacional en Latinoamérica.',
    category: 'Finanzas',
    image: '/images/casos/mercantil.jpg',
  },
  {
    id: 3,
    title: 'Grupo Automotriz Multimarca',
    slug: 'grupo-automotriz-multimarca',
    description: 'Campaña integral de marketing digital que incrementó los test drives en un 200%.',
    category: 'Automoción',
    image: '/images/casos/automotriz.jpg',
  },
];

export default async function CaseStudiesPage() {
  try {
    const metadata = await getPageMetadataBySlug('casos-de-exito-agencia-de-marketing-digital');
    
    return (
      <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {metadata.yoast_wpseo_title || 'Casos de Éxito'}
          </h1>
          
          {metadata.yoast_wpseo_metadesc && (
            <p className="text-xl text-gray-600 mb-12 max-w-3xl">
              {metadata.yoast_wpseo_metadesc}
            </p>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {caseStudies.map((caseStudy) => (
              <div key={caseStudy.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">Imagen de {caseStudy.title}</span>
                </div>
                <div className="p-6">
                  <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mb-2">
                    {caseStudy.category}
                  </span>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {caseStudy.title}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {caseStudy.description}
                  </p>
                  <a 
                    href={`/casos-de-exito-agencia-de-marketing-digital/${caseStudy.slug}`}
                    className="text-purple-600 hover:text-purple-800 font-medium inline-flex items-center"
                  >
                    Ver caso de estudio
                    <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-16 bg-purple-50 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">¿Listo para tu próximo caso de éxito?</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Trabajemos juntos para hacer crecer tu negocio con estrategias de marketing digital efectivas.
            </p>
            <a 
              href="/contactar-agencia-de-marketing-digital"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Contáctanos ahora
            </a>
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error('Error al cargar la página de casos de éxito:', error);
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">No se pudo cargar la página de casos de éxito.</p>
        </div>
      </main>
    );
  }
}

export async function generateMetadata() {
  try {
    const metadata = await getPageMetadataBySlug('casos-de-exito-agencia-de-marketing-digital');
    
    return {
      title: metadata.yoast_wpseo_title || 'Casos de Éxito - Playful Agency',
      description: metadata.yoast_wpseo_metadesc || 'Descubre cómo hemos ayudado a nuestros clientes a alcanzar sus objetivos de negocio con nuestras estrategias de marketing digital.',
      openGraph: {
        title: metadata.yoast_wpseo_og_title || 'Casos de Éxito - Playful Agency',
        description: metadata.yoast_wpseo_og_description || metadata.yoast_wpseo_metadesc || 'Descubre cómo hemos ayudado a nuestros clientes a alcanzar sus objetivos de negocio con nuestras estrategias de marketing digital.',
        type: 'website',
        url: 'https://playfulagency.com/casos-de-exito-agencia-de-marketing-digital',
        images: metadata.yoast_wpseo_og_image ? [{
          url: metadata.yoast_wpseo_og_image,
          width: 1200,
          height: 630,
          alt: 'Casos de Éxito - Playful Agency',
        }] : [],
      },
    };
  } catch (error) {
    console.error('Error al generar metadatos de la página de casos de éxito:', error);
    return {
      title: 'Casos de Éxito - Playful Agency',
      description: 'Descubre cómo hemos ayudado a nuestros clientes a alcanzar sus objetivos de negocio con nuestras estrategias de marketing digital.',
    };
  }
}
