import Image from 'next/image';
import { SoyTechnoSeccionD } from '@/services/wordpress';
import { formatTextWithBullets } from '@/utils/formatBullets';

interface Props {
  data: SoyTechnoSeccionD;
}

export default function SoyTechnoSectionD({ data }: Props) {
  // Guard: validar contenido mínimo
  const hasContent = 
    data?.titulo_de_la_seccion_d ||
    data?.imagen_derecha?.url ||
    data?.titulo_1 || data?.parrafo1 ||
    data?.titulo_2 || data?.parrafo2 ||
    data?.titulo_3 || data?.parrafo3;

  if (!hasContent) return null;

  // Items de contenido para la columna izquierda
  const contentItems = [
    { titulo: data?.titulo_1, parrafo: data?.parrafo1 },
    { titulo: data?.titulo_2, parrafo: data?.parrafo2 },
    { titulo: data?.titulo_3, parrafo: data?.parrafo3 },
  ].filter(item => item.titulo || item.parrafo);

  return (
    <section className="py-16 bg-[#FEF7FF]">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        {/* BLOQUE D1: Header pill */}
        {data.titulo_de_la_seccion_d && (
          <div className="flex justify-center mb-12">
            <div className="bg-[#EADDFF] rounded-full px-8 py-4">
              <h2 className="text-[1.2rem] leading-[1.2rem] md:text-3xl md:leading-normal font-bold text-[#2A0064] text-center">
                {data.titulo_de_la_seccion_d}
              </h2>
            </div>
          </div>
        )}

        {/* BLOQUE D2: Contenido 2 columnas (invertido: textos izq, imagen der) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Columna izquierda: Items de contenido */}
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

          {/* Columna derecha: Imagen */}
          {data.imagen_derecha?.url && (
            <div className="relative w-full h-[400px] lg:h-[800px] rounded-xl overflow-hidden">
              <Image
                src={data.imagen_derecha.url}
                alt={data.imagen_derecha.alt || 'Sección D'}
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
