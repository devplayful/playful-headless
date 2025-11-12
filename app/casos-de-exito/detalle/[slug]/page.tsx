import Image from 'next/image';
import { getSuccessStoryBySlug } from '@/services/wordpress';
import { notFound } from 'next/navigation';

export default async function SuccessStoryPage({ params }: { params: { slug: string } }) {
  const story = await getSuccessStoryBySlug(params.slug);

  if (!story) {
    notFound();
  }

  const { acf } = story;
  const categories = [acf.categoria1, acf.categoria2, acf.categoria3, acf.categoria4, acf.categoria5].filter(Boolean);

  // Helper function to render HTML content safely
  const renderHTML = (html: string) => ({
    __html: html || ''
  });

  return (
    <div className="bg-white text-gray-800 font-sans">
      {/* Hero Section with Full-width Image */}
      <div className="relative w-full h-[80vh] max-h-[800px]">
        {acf.imagenbanner && (
          <Image 
            src={acf.imagenbanner.url}
            alt={acf.imagenbanner.alt || 'Banner del caso de éxito'}
            fill
            style={{ objectFit: 'cover' }}
            className="w-full h-full"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/40 flex items-center">
          <div className="max-w-4xl mx-auto px-6 text-center text-white">
            <div className="flex justify-center gap-2 mb-6">
              {categories.map((cat, index) => cat && (
                <span key={index} className="text-sm font-medium bg-white/20 text-white px-4 py-1 rounded-full">
                  {cat}
                </span>
              ))}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight" 
                dangerouslySetInnerHTML={renderHTML(acf.h1)} />
            <div className="text-lg lg:text-xl text-gray-200 leading-relaxed max-w-3xl mx-auto" 
                 dangerouslySetInnerHTML={renderHTML(acf.primerap)} />
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* First Section */}
            <section className="space-y-6">
              <h2 className="text-3xl font-bold text-[#2A0064]" 
                  dangerouslySetInnerHTML={renderHTML(acf.primerh2)} />
              <div className="prose max-w-none text-gray-700 space-y-4" 
                   dangerouslySetInnerHTML={renderHTML(acf.segundap)} />
            </section>

            {/* Image Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {acf.imagenminuta1 && (
                <div className="relative aspect-square">
                  <Image 
                    src={acf.imagenminuta1.url}
                    alt={acf.imagenminuta1.alt || 'Imagen 1'}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              )}
              {acf.imagenminuta2 && (
                <div className="relative aspect-square">
                  <Image 
                    src={acf.imagenminuta2.url}
                    alt={acf.imagenminuta2.alt || 'Imagen 2'}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              )}
              {acf.imagenminuta3 && (
                <div className="relative aspect-square">
                  <Image 
                    src={acf.imagenminuta3.url}
                    alt={acf.imagenminuta3.alt || 'Imagen 3'}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Second Section */}
            <section className="space-y-6 pt-12 border-t border-gray-200">
              <h2 className="text-3xl font-bold text-[#2A0064]" 
                  dangerouslySetInnerHTML={renderHTML(acf.segundoh2)} />
              <div className="prose max-w-none text-gray-700 space-y-6">
                <div dangerouslySetInnerHTML={renderHTML(acf.tercerap)} />
                <div dangerouslySetInnerHTML={renderHTML(acf.cuartap)} />
                <div dangerouslySetInnerHTML={renderHTML(acf.quintap)} />
                <div dangerouslySetInnerHTML={renderHTML(acf.sextap)} />
                <div dangerouslySetInnerHTML={renderHTML(acf.septimap)} />
                <div dangerouslySetInnerHTML={renderHTML(acf.octavap)} />
                <div dangerouslySetInnerHTML={renderHTML(acf.novenap)} />
              </div>
            </section>

            {/* Challenge Images */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              {acf.desafioimagen1 && (
                <div className="relative aspect-square">
                  <Image 
                    src={acf.desafioimagen1.url}
                    alt={acf.desafioimagen1.alt || 'Desafío 1'}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              )}
              {acf.desafioimagen2 && (
                <div className="relative aspect-square">
                  <Image 
                    src={acf.desafioimagen2.url}
                    alt={acf.desafioimagen2.alt || 'Desafío 2'}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              )}
              {acf.desafioimagen3 && (
                <div className="relative aspect-square">
                  <Image 
                    src={acf.desafioimagen3.url}
                    alt={acf.desafioimagen3.alt || 'Desafío 3'}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              )}
              {acf.desafioimagen4 && (
                <div className="relative aspect-square">
                  <Image 
                    src={acf.desafioimagen4.url}
                    alt={acf.desafioimagen4.alt || 'Desafío 4'}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Final Section */}
            <section className="space-y-6 pt-12 border-t border-gray-200">
              <h2 className="text-3xl font-bold text-[#2A0064]" 
                  dangerouslySetInnerHTML={renderHTML(acf.tercerh2)} />
              <div className="prose max-w-none text-gray-700" 
                   dangerouslySetInnerHTML={renderHTML(acf.decima)} />
            </section>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Detalles del Proyecto</h3>
              <ul className="space-y-3">
                {categories.map((cat, index) => cat && (
                  <li key={index} className="flex items-center">
                    <span className="w-2 h-2 bg-[#2A0064] rounded-full mr-3"></span>
                    <span className="text-gray-700">{cat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Add more sidebar content as needed */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Servicios Relacionados</h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-[#2A0064] rounded-full mr-3"></span>
                  <span className="text-gray-700">Diseño de Experiencia de Usuario</span>
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-[#2A0064] rounded-full mr-3"></span>
                  <span className="text-gray-700">Desarrollo Web</span>
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-[#2A0064] rounded-full mr-3"></span>
                  <span className="text-gray-700">Estrategia Digital</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
