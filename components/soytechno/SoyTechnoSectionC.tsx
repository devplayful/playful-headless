import Image from 'next/image';
import { SoyTechnoSeccionC } from '@/services/wordpress';
import { formatTextWithBullets } from '@/utils/formatBullets';

interface Props {
  data: SoyTechnoSeccionC;
}

export default function SoyTechnoSectionC({ data }: Props) {
  // Guard: validar contenido mínimo
  const hasContent = 
    data?.titulo_de_la_seccion_c ||
    data?.imagen_izquierda?.url ||
    data?.titulo_1 || data?.parrafo1 ||
    data?.titulo_2 || data?.parrafo2 ||
    data?.titulo_3 || data?.parrafo3;

  if (!hasContent) return null;

  // Items de contenido para la columna derecha (solo titulo_1 y titulo_2)
  const contentItems = [
    { titulo: data?.titulo_1, parrafo: data?.parrafo1 },
    { titulo: data?.titulo_2, parrafo: data?.parrafo2 },
  ].filter(item => item.titulo || item.parrafo);

  return (
    <section className="py-16 bg-[#FEF7FF]">
      {/* Bloque superior: Header + Grid 2 columnas */}
      <div className="max-w-7xl mx-auto px-6">
        {/* BLOQUE C1: Header pill */}
        {data.titulo_de_la_seccion_c && (
          <div className="flex justify-center mb-12">
            <div className="bg-[#EADDFF] rounded-full px-8 py-4">
              <h2 className="text-[1.2rem] leading-[1.2rem] md:text-3xl md:leading-normal font-bold text-[#2A0064] text-center">
                {data.titulo_de_la_seccion_c}
              </h2>
            </div>
          </div>
        )}

        {/* BLOQUE C2: Contenido 2 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Columna izquierda: Imagen */}
          {data.imagen_izquierda?.url && (
            <div className="relative w-full h-[400px] lg:h-[800px] rounded-xl overflow-hidden">
              <Image
                src={data.imagen_izquierda.url}
                alt={data.imagen_izquierda.alt || 'Sección C'}
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

      {/* BLOQUE C2.5: Sección titulo_3 y parrafo3 */}
      {(data.titulo_3 || data.parrafo3) && (
        <div className="mt-16">
          <div className="max-w-4xl mx-auto px-6 pt-[6rem]">
            <div className="space-y-4">
              {data.titulo_3 && (
                <h3 className="text-xl md:text-2xl font-bold text-[#2A0064] text-center">
                  {data.titulo_3}
                </h3>
              )}
              {data.parrafo3 && (
                <div 
                  className="text-base md:text-lg text-gray-700 leading-relaxed text-center"
                  dangerouslySetInnerHTML={formatTextWithBullets(data.parrafo3)}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* BLOQUE C3: Ingeniería de Checkout - Contenedor separado full-width */}
      {(data.subtitulo_ingenieria || data.imagen_pantalla_1?.url || data.imagen_pantalla_2?.url || data.imagen_pantalla_3?.url || data.imagen_pantalla_4?.url) && (
        <div className="mt-16">
          <div className="max-w-4xl mx-auto px-6">
            {/* Subtítulo estilo header pill */}
            {data.subtitulo_ingenieria && (
              <div className="flex justify-center mb-8">
                <div className="bg-[#EADDFF] rounded-full px-8 py-4">
                  <h2 className="text-[1.2rem] leading-[1.2rem] md:text-3xl md:leading-normal font-bold text-[#2A0064] text-center">
                    {data.subtitulo_ingenieria}
                  </h2>
                </div>
              </div>
            )}

            {/* Párrafo descriptivo */}
            {data.parrafo_ingenieria && (
              <div className="max-w-4xl mx-auto mb-12">
                <div 
                  className="text-base md:text-lg text-gray-700 leading-relaxed text-center"
                  dangerouslySetInnerHTML={formatTextWithBullets(data.parrafo_ingenieria)}
                />
              </div>
            )}

            {/* Grid de 4 pantallas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {data.imagen_pantalla_1?.url && (
                <div className="relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden">
                  <Image
                    src={data.imagen_pantalla_1.url}
                    alt={data.imagen_pantalla_1.alt || 'Pantalla 1'}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-contain"
                  />
                </div>
              )}
              {data.imagen_pantalla_2?.url && (
                <div className="relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden">
                  <Image
                    src={data.imagen_pantalla_2.url}
                    alt={data.imagen_pantalla_2.alt || 'Pantalla 2'}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-contain"
                  />
                </div>
              )}
              {data.imagen_pantalla_3?.url && (
                <div className="relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden">
                  <Image
                    src={data.imagen_pantalla_3.url}
                    alt={data.imagen_pantalla_3.alt || 'Pantalla 3'}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-contain"
                  />
                </div>
              )}
              {data.imagen_pantalla_4?.url && (
                <div className="relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden">
                  <Image
                    src={data.imagen_pantalla_4.url}
                    alt={data.imagen_pantalla_4.alt || 'Pantalla 4'}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
