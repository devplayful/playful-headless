import Image from 'next/image';
import { SoyTechnoSeccionF } from '@/services/wordpress';
import { formatTextWithBullets } from '@/utils/formatBullets';

interface Props {
  data: SoyTechnoSeccionF;
}

export default function SoyTechnoSectionF({ data }: Props) {
  // Guard: validar contenido mínimo
  const hasContent = 
    data?.titulo_de_la_seccion_f ||
    data?.parrafo ||
    data?.titulo_1 || data?.parrafo1 ||
    data?.titulo_2 || data?.parrafo2;

  if (!hasContent) return null;
  
  // Verificar si imagen_derecha es un objeto válido con url
  const hasImage = data?.imagen_derecha && typeof data.imagen_derecha === 'object' && data.imagen_derecha.url;

  // Items de contenido para la columna derecha
  const contentItems = [
    { titulo: data?.titulo_1, parrafo: data?.parrafo1 },
    { titulo: data?.titulo_2, parrafo: data?.parrafo2 },
  ].filter(item => item.titulo || item.parrafo);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* BLOQUE F1: Header pill */}
        {data.titulo_de_la_seccion_f && (
          <div className="flex justify-center mb-12">
            <div className="bg-[#EADDFF] rounded-full px-8 py-4">
              <h2 className="text-2xl md:text-3xl font-bold text-[#2A0064] text-center">
                {data.titulo_de_la_seccion_f}
              </h2>
            </div>
          </div>
        )}

        {/* BLOQUE F2: Contenido 2 columnas */}
        <div className={`grid grid-cols-1 ${hasImage ? 'lg:grid-cols-2' : ''} gap-12 items-center`}>
          {/* Columna izquierda: Párrafo principal + Items de contenido */}
          {(data.parrafo || contentItems.length > 0) && (
            <div className={`space-y-8 ${!hasImage ? 'max-w-4xl mx-auto' : ''}`}>
              {/* Párrafo principal arriba */}
              {data.parrafo && (
                <div 
                  className="text-base md:text-lg text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={formatTextWithBullets(data.parrafo)}
                />
              )}
              
              {/* Items de contenido */}
              {contentItems.map((item, index) => (
                <div key={index} className="space-y-3">
                  {item.titulo && (
                    <h3 className="text-xl md:text-2xl font-bold text-[#2A0064]">
                      {item.titulo}
                    </h3>
                  )}
                  {item.parrafo && (
                    <div 
                      className="text-base md:text-lg text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={formatTextWithBullets(item.parrafo)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Columna derecha: Imagen (si existe) */}
          {hasImage && data.imagen_derecha && typeof data.imagen_derecha === 'object' && (
            <div className="relative w-full h-[400px] lg:h-[500px] rounded-xl overflow-hidden">
              <Image
                src={data.imagen_derecha.url}
                alt={data.imagen_derecha.alt || 'Sección F'}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
