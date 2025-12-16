import Image from 'next/image';
import { SoyTechnoSeccionE } from '@/services/wordpress';
import { formatTextWithBullets } from '@/utils/formatBullets';

interface Props {
  data: SoyTechnoSeccionE;
}

export default function SoyTechnoSectionE({ data }: Props) {
  // Guard: validar contenido mínimo
  const hasContent = 
    data?.titulo_de_la_seccion_e ||
    data?.imagen_izquierda?.url ||
    data?.parrafo ||
    data?.titulo_1 || data?.parrafo1 ||
    data?.titulo_2 || data?.parrafo2 ||
    data?.titulo_3 || data?.parrafo3;

  if (!hasContent) return null;

  // Items de contenido para la columna derecha
  const contentItems = [
    { titulo: data?.titulo_1, parrafo: data?.parrafo1 },
    { titulo: data?.titulo_2, parrafo: data?.parrafo2 },
    { titulo: data?.titulo_3, parrafo: data?.parrafo3 },
  ].filter(item => item.titulo || item.parrafo);

  return (
    <section className="py-16 bg-[#FEF7FF]">
      <div className="max-w-7xl mx-auto px-6">
        {/* BLOQUE E1: Header pill */}
        {data.titulo_de_la_seccion_e && (
          <div className="flex justify-center mb-12">
            <div className="bg-[#EADDFF] rounded-full px-8 py-4">
              <h2 className="text-2xl md:text-3xl font-bold text-[#2A0064] text-center">
                {data.titulo_de_la_seccion_e}
              </h2>
            </div>
          </div>
        )}

        {/* BLOQUE E2: Contenido 2 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Columna izquierda: Imagen */}
          {data.imagen_izquierda?.url && (
            <div className="relative w-full h-[400px] lg:h-[500px] rounded-xl overflow-hidden">
              <Image
                src={data.imagen_izquierda.url}
                alt={data.imagen_izquierda.alt || 'Sección E'}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain"
              />
            </div>
          )}

          {/* Columna derecha: Párrafo principal + Items de contenido */}
          {(data.parrafo || contentItems.length > 0) && (
            <div className="space-y-8">
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
        </div>
      </div>
    </section>
  );
}
