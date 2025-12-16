import Image from 'next/image';
import { SoyTechnoSeccionA } from '@/services/wordpress';
import { formatTextWithBullets } from '@/utils/formatBullets';

interface Props {
  data: SoyTechnoSeccionA;
}

export default function SoyTechnoSectionA({ data }: Props) {
  // Guard: validar contenido mínimo
  const hasContent = 
    data?.titulo_de_esta_seccion_a ||
    data?.imagen_izquierda?.url ||
    data?.titulo_1 || data?.titulo_2 || data?.titulo_3 || data?.titulo_4 ||
    data?.parrafo1 || data?.parrafo2 || data?.parrafo3 || data?.parrafo4;

  if (!hasContent) return null;

  // Items de contenido para la columna derecha
  const contentItems = [
    { titulo: data?.titulo_1, parrafo: data?.parrafo1 },
    { titulo: data?.titulo_2, parrafo: data?.parrafo2 },
    { titulo: data?.titulo_3, parrafo: data?.parrafo3 },
    { titulo: data?.titulo_4, parrafo: data?.parrafo4 },
  ].filter(item => item.titulo || item.parrafo);

  return (
    <section className="py-16 bg-[#FEF7FF]">
      <div className="max-w-7xl mx-auto px-6">
        {/* BLOQUE A1: Header pill */}
        {data.titulo_de_esta_seccion_a && (
          <div className="flex justify-center mb-12">
            <div className="bg-[#EADDFF] rounded-full px-8 py-4">
              <h2 className="text-2xl md:text-3xl font-bold text-[#2A0064] text-center">
                {data.titulo_de_esta_seccion_a}
              </h2>
            </div>
          </div>
        )}

        {/* BLOQUE A2: Contenido 2 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Columna izquierda: Imagen */}
          {data.imagen_izquierda?.url && (
            <div className="relative w-full h-[400px] lg:h-[500px] rounded-xl overflow-hidden">
              <Image
                src={data.imagen_izquierda.url}
                alt={data.imagen_izquierda.alt || 'Sección A'}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain"
              />
            </div>
          )}

          {/* Columna derecha: Items de contenido */}
          {contentItems.length > 0 && (
            <div className="space-y-8">
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
