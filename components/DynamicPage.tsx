import { getPageMetadataBySlug } from '@/services/wordpress';

export default async function DynamicPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
  try {
    // Obtener metadatos de la página
    const metadata = await getPageMetadataBySlug(slug);
    
    // Generar el título de la página
    const pageTitle = metadata.yoast_wpseo_title || 
                     slug.split('-').map(word => 
                         word.charAt(0).toUpperCase() + word.slice(1)
                     ).join(' ');

    return (
      <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            {pageTitle}
          </h1>
          
          <div className="prose max-w-none">
            <p className="text-lg text-gray-600">
              Bienvenido a la página de {pageTitle.toLowerCase()}.
              Este es un contenido de ejemplo. Próximamente tendrás aquí el contenido completo.
            </p>
            
            {metadata.yoast_wpseo_metadesc && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h2 className="text-xl font-semibold mb-2">Descripción SEO:</h2>
                <p className="text-gray-700">{metadata.yoast_wpseo_metadesc}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    );
  } catch (error) {
    console.error('Error al cargar la página:', error);
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">No se pudo cargar la página solicitada.</p>
        </div>
      </main>
    );
  }
}
