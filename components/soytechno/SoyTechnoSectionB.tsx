import Image from 'next/image';
import { SoyTechnoSeccionB } from '@/services/wordpress';

interface Props {
  data: SoyTechnoSeccionB;
}

export default function SoyTechnoSectionB({ data }: Props) {
  // Guard: validar contenido mínimo
  const collage = data?.imagenes_collage;
  const hasCollageImages = collage && (
    collage.imagen_1?.url ||
    collage.imagen_2?.url ||
    collage.imagen_3?.url ||
    collage.imagen_4?.url ||
    collage.imagen_del_telefono?.url ||
    collage.imagen_del_logo?.url
  );

  const hasPuntos = 
    data?.titulo_1 || data?.parrafo1 ||
    data?.titulo_2 || data?.parrafo2 ||
    data?.titulo_3 || data?.parrafo3;

  const hasContent = data?.titulo_de_la_seccion_b || hasCollageImages || hasPuntos;

  if (!hasContent) return null;

  // Items de puntos para la columna derecha
  const puntosItems = [
    { titulo: data?.titulo_1, parrafo: data?.parrafo1 },
    { titulo: data?.titulo_2, parrafo: data?.parrafo2 },
    { titulo: data?.titulo_3, parrafo: data?.parrafo3 },
  ].filter(item => item.titulo || item.parrafo);

  return (
    <section className="py-16 bg-[#FEF7FF]">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        {/* BLOQUE B1: Header pill */}
        {data.titulo_de_la_seccion_b && (
          <div className="flex justify-center mb-12">
            <div className="bg-[#EADDFF] rounded-full px-8 py-4">
              <h2 className="text-[1.2rem] leading-[1.2rem] md:text-3xl md:leading-normal font-bold text-[#2A0064] text-center">
                {data.titulo_de_la_seccion_b}
              </h2>
            </div>
          </div>
        )}

        {/* BLOQUE B2: Card con layout 3 columnas iguales */}
        {(hasCollageImages || hasPuntos) && (
          <div className="bg-[#F3E5F5] rounded-3xl p-8 md:p-12">
            {/* Desktop: 3 columnas iguales */}
            <div className="hidden lg:grid lg:grid-cols-3 gap-6 items-start">
              {/* Columna 1: imagen_1, imagen_2, imagen_3 */}
              <div className="flex flex-col gap-6">
                {collage?.imagen_1?.url && (
                  <div className="relative w-[320px] h-[300px] rounded-lg overflow-hidden">
                    <Image
                      src={collage.imagen_1.url}
                      alt={collage.imagen_1.alt || 'Tile 1'}
                      fill
                      sizes="320px"
                      className="object-contain"
                    />
                  </div>
                )}
                {collage?.imagen_2?.url && (
                  <div className="relative w-[320px] h-[300px] rounded-lg overflow-hidden">
                    <Image
                      src={collage.imagen_2.url}
                      alt={collage.imagen_2.alt || 'Tile 2'}
                      fill
                      sizes="320px"
                      className="object-contain"
                    />
                  </div>
                )}
                {collage?.imagen_3?.url && (
                  <div className="relative w-[320px] h-[300px] rounded-lg overflow-hidden">
                    <Image
                      src={collage.imagen_3.url}
                      alt={collage.imagen_3.alt || 'Tile 3'}
                      fill
                      sizes="320px"
                      className="object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Columna 2: imagen_del_telefono arriba, imagen_4 al fondo con space-between */}
              <div className="flex flex-col justify-between items-center h-[950px]">
                {/* Teléfono arriba */}
                {collage?.imagen_del_telefono?.url && (
                  <div className="relative w-[340px] h-[650px] mx-auto rounded-lg overflow-hidden">
                    <Image
                      src={collage.imagen_del_telefono.url}
                      alt={collage.imagen_del_telefono.alt || 'Teléfono'}
                      fill
                      sizes="340px"
                      className="object-contain"
                    />
                  </div>
                )}
                
                {/* Imagen_4 al fondo */}
                {collage?.imagen_4?.url && (
                  <div className="relative w-[320px] h-[300px] rounded-lg overflow-hidden">
                    <Image
                      src={collage.imagen_4.url}
                      alt={collage.imagen_4.alt || 'Circuito'}
                      fill
                      sizes="320px"
                      className="object-contain"
                    />
                  </div>
                )}
              </div>
              
              {/* Columna 3: imagen_del_logo arriba, textos abajo */}
              <div className="flex flex-col gap-6 h-[950px]">
                {collage?.imagen_del_logo?.url && (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden">
                    <Image
                      src={collage.imagen_del_logo.url}
                      alt={collage.imagen_del_logo.alt || 'Logo SoyTechno'}
                      fill
                      sizes="33vw"
                      className="object-contain object-top"
                    />
                  </div>
                )}
                
                {/* Textos debajo del logo */}
                {puntosItems.length > 0 && (
                  <div className="space-y-6">
                    {puntosItems.map((item, index) => (
                      <div key={index} className="space-y-2">
                        {item.titulo && (
                          <h3 className="text-lg md:text-xl font-bold text-[#2A0064]">
                            {item.titulo}
                          </h3>
                        )}
                        {item.parrafo && (
                          <p className="text-base text-gray-700 leading-relaxed">
                            {item.parrafo}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile: Stack ordenado */}
            <div className="lg:hidden flex flex-col gap-6">
              {/* 1. Teléfono */}
              {collage?.imagen_del_telefono?.url && (
                <div className="relative w-full max-w-xs mx-auto h-[360px] sm:h-[420px] rounded-lg overflow-hidden">
                  <Image
                    src={collage.imagen_del_telefono.url}
                    alt={collage.imagen_del_telefono.alt || 'Teléfono'}
                    fill
                    sizes="(max-width: 640px) 80vw, 384px"
                    className="object-contain"
                  />
                </div>
              )}
              
              {/* 2. Banner */}
              {collage?.imagen_del_logo?.url && (
                <div className="relative w-full h-48 sm:h-56 rounded-lg overflow-hidden">
                  <Image
                    src={collage.imagen_del_logo.url}
                    alt={collage.imagen_del_logo.alt || 'Banner'}
                    fill
                    sizes="100vw"
                    className="object-contain"
                  />
                </div>
              )}
              
              {/* 3. Tiles horizontal */}
              <div className="grid grid-cols-3 gap-3">
                {collage?.imagen_1?.url && (
                  <div className="relative w-full h-24 sm:h-28 rounded-lg overflow-hidden">
                    <Image
                      src={collage.imagen_1.url}
                      alt={collage.imagen_1.alt || 'Tile 1'}
                      fill
                      sizes="33vw"
                      className="object-contain"
                    />
                  </div>
                )}
                {collage?.imagen_2?.url && (
                  <div className="relative w-full h-24 sm:h-28 rounded-lg overflow-hidden">
                    <Image
                      src={collage.imagen_2.url}
                      alt={collage.imagen_2.alt || 'Tile 2'}
                      fill
                      sizes="33vw"
                      className="object-contain"
                    />
                  </div>
                )}
                {collage?.imagen_3?.url && (
                  <div className="relative w-full h-24 sm:h-28 rounded-lg overflow-hidden">
                    <Image
                      src={collage.imagen_3.url}
                      alt={collage.imagen_3.alt || 'Tile 3'}
                      fill
                      sizes="33vw"
                      className="object-contain"
                    />
                  </div>
                )}
              </div>
              
              {/* 4. Circuito */}
              {collage?.imagen_4?.url && (
                <div className="relative w-full h-32 rounded-lg overflow-hidden">
                  <Image
                    src={collage.imagen_4.url}
                    alt={collage.imagen_4.alt || 'Circuito'}
                    fill
                    sizes="100vw"
                    className="object-contain"
                  />
                </div>
              )}
              
              {/* 5. Textos al final */}
              {puntosItems.length > 0 && (
                <div className="space-y-6 mt-4">
                  {puntosItems.map((item, index) => (
                    <div key={index} className="space-y-2">
                      {item.titulo && (
                        <h3 className="text-lg md:text-xl font-bold text-[#2A0064]">
                          {item.titulo}
                        </h3>
                      )}
                      {item.parrafo && (
                        <p className="text-base text-gray-700 leading-relaxed">
                          {item.parrafo}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
