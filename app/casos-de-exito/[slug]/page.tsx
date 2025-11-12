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


export default async function SuccessStoryPage({ params }: { params: { slug: string } }) {
  const story = await getSuccessStoryBySlug(params.slug);

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
              <h2 className="text-2xl lg:text-3xl font-semibold text-gray-300 mb-6">{story.acf.subtitle}</h2>
              <p className="text-lg text-gray-400">{story.acf.description}</p>
            </div>
            <div>
              <Image 
                src={story.acf.hero_image.url}
                alt={story.acf.hero_image.alt || story.title.rendered}
                width={600}
                height={400}
                className="rounded-lg shadow-2xl mx-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Challenge Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#2A0064] mb-6">{story.acf.challenge_title}</h2>
          <p className="text-lg text-gray-600 mb-12">{story.acf.challenge_description}</p>
          <div className="flex justify-center items-center space-x-8">
            {story.acf.challenge_logos.map((logo, index) => (
              <Image key={index} src={logo.url} alt={logo.alt} width={100} height={50} className="opacity-60" />
            ))}
          </div>
        </div>
      </section>

      {/* Work Process Section */}
      <section className="py-20 bg-[#F3E8FF]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#2A0064]">Nuestro Proceso de Trabajo</h2>
          </div>

                    {story.acf.work_process.map((step, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
              <div className={index % 2 !== 0 ? 'md:order-last' : ''}>
                <h3 className="text-2xl font-bold text-[#2A0064] mb-4">{step.step_title}</h3>
                <p className="text-gray-600 mb-6">{step.step_description}</p>
                <ul className="space-y-4 text-gray-700">
                  {step.step_items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <CheckmarkIcon className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                      <span>{item.item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <Image 
                  src={step.step_image.url} 
                  alt={step.step_image.alt || 'Paso del proceso'}
                  width={500}
                  height={500}
                  className="rounded-lg shadow-xl mx-auto"
                />
              </div>
            </div>
          ))}

        </div>
      </section>

      {/* Results Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#2A0064]">Los Resultados</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {story.acf.results.map((result, index) => {
              const Icon = [ResultIcon1, ResultIcon2, ResultIcon3][index % 3];
              return (
                <div key={index} className="bg-gray-50 p-8 rounded-lg shadow-lg">
                  <Icon className="w-16 h-16 text-[#2A0064] mx-auto mb-4" />
                  <h3 className="text-4xl font-bold text-[#2A0064] mb-2">{result.result_value}</h3>
                  <p className="text-gray-600">{result.result_description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
