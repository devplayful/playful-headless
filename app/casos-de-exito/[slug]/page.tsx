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
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function SuccessStoryPage({ params, searchParams }: PageProps) {
  // Ensure we have a valid slug
  if (!params?.slug) {
    notFound();
  }

  // Get the story data
  const story = await getSuccessStoryBySlug(params.slug as string);

  // If no story is found, return 404
  if (!story) {
    notFound();
  }

  return (
    <div className="bg-white text-gray-800">
      {/* Hero Section */}
      <section className="bg-[#2A0064] text-white">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">{story.title.rendered}</h1>
              <h2 className="text-2xl lg:text-3xl font-semibold text-gray-300 mb-6">{story.acf.h1 || 'Caso de Éxito'}</h2>
              <p className="text-lg text-gray-400" dangerouslySetInnerHTML={{ __html: story.acf.primerap || '' }} />
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
            <div className="flex justify-center gap-8 mb-12">
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
        <div className="max-w-6xl mx-auto px-6 bg-[#E9D7FF] rounded-[18px] p-8">
          {/* Top Row - Two Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Left Column - Text Content */}
            <div className="space-y-6 bg-white p-8 rounded-[18px]">
              {[
                { content: story.acf?.cuartap, className: 'text-[#005F9E] font-payton font-bold text-[22px] leading-relaxed' },
                { content: story.acf?.quintap, className: 'text-[#4A4453] font-dmsans font-normal text-[22px] leading-relaxed' },
                { content: story.acf?.sextap, className: 'text-[#F78D2B] font-payton font-bold text-[22px] leading-relaxed' },
                { content: story.acf?.septimap, className: 'text-[#4A4453] font-dmsans font-normal text-[22px] leading-relaxed mt-8 mb-4' },
                { content: story.acf?.octavap, className: 'text-[#44A147] font-payton font-bold text-[22px] leading-relaxed' },
                { content: story.acf?.novenap, className: 'text-[#4A4453] font-dmsans font-normal text-[22px] leading-relaxed' }
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
              <div className="relative w-full h-96 bg-gray-100 rounded-[18px] overflow-hidden">
                <Image
                  src={story.acf.desafioimagen1}
                  alt="Imagen de desafío"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>

          {/* Bottom Row - Three Images */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { id: 'desafioimagen2', url: story.acf?.desafioimagen2 },
              { id: 'desafioimagen3', url: story.acf?.desafioimagen3 },
              { id: 'desafioimagen4', url: story.acf?.desafioimagen4 }
            ].filter(item => item.url).map((item, index) => (
              <div key={`${item.id}-${index}`} className="relative w-full h-64 bg-gray-100 rounded-[18px] overflow-hidden">
                <Image
                  src={item.url}
                  alt={`La Imagen de desafío ${index + 2}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
