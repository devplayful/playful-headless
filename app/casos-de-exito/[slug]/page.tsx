import Image from 'next/image';
import { getSuccessStoryBySlug } from '@/services/wordpress';
import { notFound } from 'next/navigation';

const ResultIcon1 = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
);
const ResultIcon2 = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m3 6V7h-2m3-4H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z"></path></svg>
);
const ResultIcon3 = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
);

const CheckmarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
  </svg>
);


interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function SuccessStoryPage({ params, searchParams }: PageProps) {
  // Await params to get the slug
  const { slug } = await params;
  
  // Ensure we have a valid slug
  if (!slug) {
    notFound();
  }

  // Get the story data
  const story = await getSuccessStoryBySlug(slug);

  // If no story is found, return 404
  if (!story) {
    notFound();
  }

  return (
    <div className="text-gray-800">
      {/* Hero Section */}
      <section className="text-white">
        <div className="max-w-7xl mx-auto px-6 py-20 bg-[#E9D7FF] rounded-t-[18px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <h1 className="text-4xl lg:text-5xl font-bold mb-4 text-[#4A4453]">{story.title.rendered}</h1>
              <p className="text-lg text-[#4A4453]" dangerouslySetInnerHTML={{ __html: story.acf.primerap || '' }} />
            </div>
            <div>
              <div className="relative w-full h-[400px] rounded-lg overflow-hidden bg-gray-100">
                {story.acf?.imagenbanner ? (
                  <Image 
                    src={typeof story.acf.imagenbanner === 'string' ? story.acf.imagenbanner : story.acf.imagenbanner.url}
                    alt={story.title.rendered}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-opacity duration-300"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                    <span className="text-gray-500">No hay imagen disponible</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Challenge Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#2A0064] mb-6">{story.acf.primerh2 || 'El Desafío'}</h2>
          <div className="text-lg text-gray-600 mb-12" dangerouslySetInnerHTML={{ __html: story.acf.tercerap || '' }} />
          {Array.isArray(story.acf?.challenge_logos) && story.acf.challenge_logos.length > 0 && (
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
              {story.acf.challenge_logos.map((logo, index) => (
                <div key={index} className="relative h-16 w-32 md:h-20 md:w-40 flex items-center justify-center">
                  <Image 
                    src={logo.url} 
                    alt={logo.alt || `Logo ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 8rem, 10rem"
                    className="object-contain object-center opacity-70 hover:opacity-100 transition-opacity duration-300"
                    quality={90}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Work Process Images with Title and Description */}
      <section className="py-0 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center">
            {/* Images Row */}
            <div className="flex flex-col md:flex-row justify-center items-center md:items-stretch gap-6 md:gap-8 mb-12">
              {[story.acf?.imagenminuta1, story.acf?.imagenminuta2, story.acf?.imagenminuta3]
                .filter(Boolean)
                .map((image, index) => (
                  <div key={index} className="relative w-36 h-36 bg-white rounded-lg shadow-md flex items-center justify-center p-4">
                    <Image
                      src={image || ''}
                      alt={`Imagen ${index + 1}`}
                      width={120}
                      height={120}
                      className="object-contain w-full h-full"
                    />
                  </div>
                ))}
            </div>
            
            {/* Title and Description */}
            <div className="text-center max-w-4xl">
              <h2 className="text-3xl md:text-4xl font-bold text-[#2A0064] mb-6">
                {story.acf?.segundoh2 || 'Nuestro Enfoque'}
              </h2>
              <div 
                className="text-lg text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: story.acf?.tercerap || '' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Content Grid Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-[#E9D7FF] rounded-[18px] p-8 md:p-12">
            {/* Top Row - Two Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Left Column - Text Content */}
              <div className="space-y-6 bg-white p-8 md:p-10 rounded-[18px]">
                {[
                  { content: story.acf?.cuartap, className: 'text-[#005F9E] font-payton font-bold text-[20px] md:text-[22px] leading-relaxed' },
                  { content: story.acf?.quintap, className: 'text-[#4A4453] font-dmsans font-normal text-[18px] md:text-[20px] leading-relaxed' },
                  { content: story.acf?.sextap, className: 'text-[#F78D2B] font-payton font-bold text-[20px] md:text-[22px] leading-relaxed mt-4' },
                  { content: story.acf?.septimap, className: 'text-[#4A4453] font-dmsans font-normal text-[18px] md:text-[20px] leading-relaxed' },
                  { content: story.acf?.octavap, className: 'text-[#44A147] font-payton font-bold text-[20px] md:text-[22px] leading-relaxed mt-4' },
                  { content: story.acf?.novenap, className: 'text-[#4A4453] font-dmsans font-normal text-[18px] md:text-[20px] leading-relaxed' }
                ].filter(item => item.content).map((item, index) => (
                  <div 
                    key={`text-${index}`}
                    className={item.className}
                    dangerouslySetInnerHTML={{ __html: item.content || '' }}
                  />
                ))}
              </div>

              {/* Right Column - Image */}
              {story.acf?.desafioimagen1 && (
                <div className="relative w-full h-[400px] lg:h-full min-h-[500px] bg-transparent rounded-[18px] overflow-hidden">
                  <Image
                    src={story.acf.desafioimagen1}
                    alt="Imagen de desafío"
                    fill
                    className="object-contain object-right"
                  />
                </div>
              )}
            </div>

            {/* Bottom Row - Three Images */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { id: 'desafioimagen2', url: story.acf?.desafioimagen2 },
                { id: 'desafioimagen3', url: story.acf?.desafioimagen3 },
                { id: 'desafioimagen4', url: story.acf?.desafioimagen4 }
              ].filter(item => item.url).map((item, index) => (
                <div key={`${item.id}-${index}`} className="relative w-full h-[22rem] bg-transparent rounded-[18px] overflow-hidden">
                  <Image
                    src={item.url}
                    alt={`Imagen de desafío ${index + 2}`}
                    fill
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Work Process Images with Title and Description */}
      <section className="py-0 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center">           
            {/* Title and Description */}
            <div className="text-center max-w-4xl">
              <h2 className="text-3xl md:text-4xl font-bold text-[#2A0064] mb-6">
                {story.acf?.tercerh2 || 'Nuestro Enfoque'}
              </h2>
              <div 
                className="text-lg text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: story.acf?.decima || '' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Development Process Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Image Section - Left Side */}
              <div className="relative w-full h-[500px] rounded-xl overflow-hidden shadow-lg">
                {story.acf?.imagendesarrollo ? (
                  <Image
                    src={typeof story.acf.imagendesarrollo === 'string' ? story.acf.imagendesarrollo : story.acf.imagendesarrollo.url}
                    alt="Proceso de desarrollo"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50%"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <span className="text-gray-500">Imagen no disponible</span>
                  </div>
                )}
              </div>

              {/* Content Section - Right Side */}
              <div className="space-y-8">
                {/* Debug: Check field values */}
                <div className="hidden">
                  {JSON.stringify({
                    primerh3desarrollo: story.acf?.primerh3desarrollo,
                    primerapdesarrollo: story.acf?.primerapdesarrollo,
                    segundoh3desarrollo: story.acf?.segundoh3desarrollo,
                    segundopdesarrollo: story.acf?.segundopdesarrollo,
                    tercerh3desarrollo: story.acf?.tercerh3desarrollo,
                    tercerapdesarrollo: story.acf?.tercerapdesarrollo
                  })}
                </div>

                {story.acf?.primerah3desarrollo && story.acf.primerapdesarrollo && (
                  <div className="space-y-4">
                    <h3 className="text-[22px] font-payton text-[#453A53] mb-3">
                      {story.acf.primerah3desarrollo}
                    </h3>
                    <div 
                      className="text-gray-700 leading-relaxed text-lg"
                      dangerouslySetInnerHTML={{ __html: story.acf.primerapdesarrollo }}
                    />
                  </div>
                )}

                {story.acf?.segundah3desarrollo && story.acf.segundapdesarrollo && (
                  <div className="space-y-4">
                    <h3 className="text-[22px] font-payton text-[#453A53] mb-3">
                      {story.acf.segundah3desarrollo}
                    </h3>
                    <div 
                      className="text-gray-700 leading-relaxed text-lg"
                      dangerouslySetInnerHTML={{ __html: story.acf.segundapdesarrollo }}
                    />
                  </div>
                )}

                {story.acf?.tercerh3desarrollo && story.acf.tercerapdesarrollo && (
                  <div className="space-y-4">
                    <h3 className="text-[22px] font-payton text-[#453A53] mb-3">
                      {story.acf.tercerh3desarrollo}
                    </h3>
                    <div 
                      className="text-gray-700 leading-relaxed text-lg"
                      dangerouslySetInnerHTML={{ __html: story.acf.tercerapdesarrollo }}
                    />
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-20 bg-[#E9D7FF] rounded-t-[18px]">
          {/* First Row - 3 images */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Grilla 1 */}
            {story.acf?.grilla1 && (
              <div className="relative w-full h-[248px] rounded-xl overflow-hidden shadow-lg">
                <Image
                  src={typeof story.acf.grilla1 === 'string' ? story.acf.grilla1 : story.acf.grilla1.url}
                  alt="Gallery image 1"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              </div>
            )}

            {/* Grilla 2 */}
            {story.acf?.grilla2 && (
              <div className="relative w-full h-[248px] rounded-xl overflow-hidden shadow-lg">
                <Image
                  src={typeof story.acf.grilla2 === 'string' ? story.acf.grilla2 : story.acf.grilla2.url}
                  alt="Gallery image 2"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              </div>
            )}

            {/* Grilla 3 */}
            {story.acf?.grilla3 && (
              <div className="relative w-full h-[248px] rounded-xl overflow-hidden shadow-lg">
                <Image
                  src={typeof story.acf.grilla3 === 'string' ? story.acf.grilla3 : story.acf.grilla3.url}
                  alt="Gallery image 3"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Grilla 1 */}
            {story.acf?.grilla4 && (
              <div>
              <div className="relative w-full h-[248px] rounded-xl overflow-hidden shadow-lg mb-4">
                <Image
                  src={typeof story.acf.grilla4 === 'string' ? story.acf.grilla4 : story.acf.grilla4.url}
                  alt="Gallery image 1"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              </div>
              <div className="relative w-full h-[248px] rounded-xl overflow-hidden shadow-lg">
                <Image
                  src={typeof story.acf.grilla5 === 'string' ? story.acf.grilla5 : story.acf.grilla5.url}
                  alt="Gallery image 2"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              </div>


              </div>
            )}

            {/* Grilla 2 */}
            {story.acf?.grilla6 && (

            <div className="relative w-full h-[541px] rounded-xl overflow-hidden shadow-lg">
            <Image
              src={typeof story.acf.grilla6 === 'string' ? story.acf.grilla6 : story.acf.grilla6.url}
              alt="Gallery image 3"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
            </div>
            )}

            {/* Grilla 3 */}
            {story.acf?.grilla7 && (
              <div>
              <div className="relative w-full h-[248px] rounded-xl overflow-hidden shadow-lg mb-4">
                <Image
                  src={typeof story.acf.grilla7 === 'string' ? story.acf.grilla7 : story.acf.grilla7.url}
                  alt="Gallery image 3"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              </div>
              <div className="relative w-full h-[248px] rounded-xl overflow-hidden shadow-lg flex items-center justify-center bg-gray-100">
              <Image
                src={typeof story.acf.grilla8 === 'string' ? story.acf.grilla8 : story.acf.grilla8.url}
                alt="Gallery image 3"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            </div>

            </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-0 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center">           
            {/* Title and Description */}
            <div className="text-center max-w-4xl">
              <h2 className="text-3xl md:text-4xl font-bold text-[#2A0064] mb-6">
                {story.acf?.resultadotitulo || 'Nuestro Enfoque'}
              </h2>
              <div 
                className="text-lg text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: story.acf?.resultadodescripcion || '' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Results Cards Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="rounded-[18px] px-6 py-12 md:px-10 md:py-14">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-12 max-w-5xl mx-auto">
              {/* Card 1 */}
              {(story.acf?.resultado1 || story.acf?.resultado1) && (
                <div className="bg-[#E9D7FF] rounded-[18px] px-6 py-8 h-full flex flex-col justify-start w-full max-w-[320px] mx-auto md:max-w-none md:w-full md:h-[504px] text-center">
                  <h3 className="text-sm md:text-base font-payton font-bold tracking-wide text-[#453A53] mb-3 uppercase">
                    {story.acf?.resultado1}
                  </h3>
                  <div
                    className="text-sm md:text-base leading-relaxed text-[#4A4453] font-dmsans"
                    dangerouslySetInnerHTML={{ __html: story.acf?.resultadop1 || '' }}
                  />
                </div>
              )}

              {/* Card 2 */}
              {(story.acf?.resultado2 || story.acf?.resultado2) && (
                <div className="bg-[#E9D7FF] rounded-[18px] px-6 py-8 h-full flex flex-col justify-start w-full max-w-[320px] mx-auto md:max-w-none md:w-full md:h-[504px] text-center">
                  <h3 className="text-sm md:text-base font-payton font-bold tracking-wide text-[#453A53] mb-3 uppercase">
                    {story.acf?.resultado2}
                  </h3>
                  <div
                    className="text-sm md:text-base leading-relaxed text-[#4A4453] font-dmsans"
                    dangerouslySetInnerHTML={{ __html: story.acf?.resultadop2 || '' }}
                  />
                </div>
              )}

              {/* Card 2 */}
              {(story.acf?.resultado3 || story.acf?.resultado3) && (
                <div className="bg-[#E9D7FF] rounded-[18px] px-6 py-8 h-full flex flex-col justify-start w-full max-w-[320px] mx-auto md:max-w-none md:w-full md:h-[504px] text-center">
                  <h3 className="text-sm md:text-base font-payton font-bold tracking-wide text-[#453A53] mb-3 uppercase">
                    {story.acf?.resultado3}
                  </h3>
                  <div
                    className="text-sm md:text-base leading-relaxed text-[#4A4453] font-dmsans"
                    dangerouslySetInnerHTML={{ __html: story.acf?.resultadop3 || '' }}
                  />
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* Phone Images Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          {/* En mobile y tablet: carrusel horizontal; en desktop: grilla */}
          <div className="flex gap-6 overflow-x-auto pb-4 lg:grid lg:grid-cols-4 lg:gap-8 lg:overflow-visible">
            {[
              { id: 'telefono1', value: story.acf?.telefono1 },
              { id: 'telefono2', value: story.acf?.telefono2 },
              { id: 'telefono3', value: story.acf?.telefono3 },
              { id: 'telefono4', value: story.acf?.telefono4 },
            ]
              .filter(item => item.value)
              .map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="relative w-[300px] sm:w-[300px] flex-shrink-0 h-[650px] lg:w-[300px] lg:h-[650px] rounded-[18px] overflow-hidden"
                >
                  <Image
                    src={
                      typeof item.value === 'string'
                        ? (item.value as string)
                        : (item.value as { url: string }).url
                    }
                    alt={`Teléfono ${index + 1}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      {story.acf?.testimonialnombre && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="bg-[#FFD977] rounded-[18px] px-8 py-10 md:px-16 md:py-14 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
              <div className="absolute -top-10 -left-4 text-white/40 text-[160px] leading-none select-none hidden sm:block">
                “
              </div>
              <div className="absolute -bottom-24 right-0 text-white/40 text-[220px] leading-none select-none hidden sm:block">
                ”
              </div>

              <div className="relative z-10 flex-shrink-0 flex flex-col items-center md:items-start gap-4">
                {story.acf?.testimonial_foto && (
                  <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden bg-gray-200">
                    <Image
                      src={
                        typeof story.acf.testimonial_foto === 'string'
                          ? (story.acf.testimonial_foto as string)
                          : (story.acf.testimonial_foto as { url: string }).url
                      }
                      alt={story.acf?.testimonialnombre || 'Testimonial'}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="text-center md:text-left">
                  {story.acf?.testimonialnombre && (
                    <p className="text-lg md:text-xl font-payton font-bold text-[#4A4453]">
                      {story.acf.testimonialnombre}
                    </p>
                  )}
                  {story.acf?.testimonialcargo && (
                    <p className="text-sm md:text-base font-dmsans text-[#4A4453]">
                      {story.acf.testimonialcargo}
                    </p>
                  )}
                </div>
              </div>

              <div className="relative z-10 flex-1">
                <p className="text-base md:text-lg leading-relaxed text-[#4A4453] font-dmsans max-w-2xl">
                  {story.acf.testimonio}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
