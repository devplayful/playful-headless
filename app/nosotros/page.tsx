import { getPageMetadataBySlug } from '@/services/wordpress';

export default async function Nosotros() {
  try {
    const metadata = await getPageMetadataBySlug('nosotros');
    
    return (
      <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            {metadata.yoast_wpseo_title || 'Sobre Nosotros'}
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="prose max-w-none">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Conoce más sobre Playful Agency
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Somos una agencia de marketing digital apasionada por ayudar a las empresas a crecer en el mundo digital.
              </p>
              <p className="text-gray-600 mb-8">
                Con un equipo de expertos en diferentes áreas del marketing digital, ofrecemos soluciones personalizadas 
                que se adaptan a las necesidades específicas de cada cliente.
              </p>
              
              <div className="grid grid-cols-2 gap-6 mt-10">
                <div>
                  <h3 className="text-3xl font-bold text-purple-600 mb-2">+100</h3>
                  <p className="text-gray-600">Clientes satisfechos</p>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-purple-600 mb-2">+5</h3>
                  <p className="text-gray-600">Años de experiencia</p>
                </div>
              </div>
            </div>
            
            <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-500/20"></div>
              <div className="absolute bottom-0 right-0 w-4/5 h-4/5 bg-purple-600/10 rounded-tl-full"></div>
              <div className="relative h-full flex items-center justify-center">
                <span className="text-gray-400">Imagen del equipo</span>
              </div>
            </div>
          </div>
          
          {metadata.yoast_wpseo_metadesc && (
            <div className="mt-12 p-6 bg-gray-50 rounded-lg">
              <h2 className="text-xl font-semibold mb-3">Nuestro Enfoque</h2>
              <p className="text-gray-700">{metadata.yoast_wpseo_metadesc}</p>
            </div>
          )}
        </div>
      </main>
    );
  } catch (error) {
    console.error('Error al cargar la página de nosotros:', error);
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">No se pudo cargar la página de nosotros.</p>
        </div>
      </main>
    );
  }
}

export async function generateMetadata() {
  try {
    const metadata = await getPageMetadataBySlug('nosotros');
    
    return {
      title: metadata.yoast_wpseo_title || 'Sobre Nosotros - Playful Agency',
      description: metadata.yoast_wpseo_metadesc || 'Conoce más sobre Playful Agency y nuestro equipo de expertos en marketing digital.',
      openGraph: {
        title: metadata.yoast_wpseo_og_title || 'Sobre Nosotros - Playful Agency',
        description: metadata.yoast_wpseo_og_description || metadata.yoast_wpseo_metadesc || 'Conoce más sobre Playful Agency y nuestro equipo de expertos en marketing digital.',
        type: 'website',
        url: 'https://playfulagency.com/nosotros',
        images: metadata.yoast_wpseo_og_image ? [{
          url: metadata.yoast_wpseo_og_image,
          width: 1200,
          height: 630,
          alt: 'Sobre Nosotros - Playful Agency',
        }] : [],
      },
    };
  } catch (error) {
    console.error('Error al generar metadatos de la página Nosotros:', error);
    return {
      title: 'Sobre Nosotros - Playful Agency',
      description: 'Conoce más sobre Playful Agency y nuestro equipo de expertos en marketing digital.',
    };
  }
}
