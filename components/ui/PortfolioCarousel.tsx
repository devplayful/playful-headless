'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';
import Image from 'next/image';

const portfolioItems = [
  {
    title: "SOYTECHNO se transforma y genera un aumento del 40% en conversiones",
    description: "SoyTechno, una empresa de tecnología, necesitaba renovar su plataforma de ventas. Los usuarios se frustraban con la navegación y el proceso de compra era demasiado largo, lo que se traducía en ventas perdidas.",
    tags: ["UI/UX Design", "E-commerce", "Analítica SEO"],
    imageUrl: "/images/portfolio/soytechno.png",
    highlight: "+40% Conversiones",
    buttonText: "Ver caso completo"
  },
  {
    title: "Mercantil SFI se renueva e impulsa su presencia global en el sector Financiero",
    description: "Mercantil Servicios Financieros Internacional y la transformamos en una plataforma digital que impulsa su presencia global y mejora la interacción con sus clientes.",
    tags: ["UI/UX Design", "E-commerce", "Analítica SEO"],
    imageUrl: "/images/portfolio/mercantil.png",
    highlight: "Innovación Tecnológica",
    buttonText: "Explora la historia"
  },
  {
    title: "Banco Venezolano de Crédito estratega en posicionamiento",
    description: "Banco Venezolano de Crédito rediseña su plataforma y busca posicionarse con una propuesta de valor de lo más actual en el sector financiero.",
    tags: ["Analítica SEO", "E-commerce"],
    imageUrl: "/images/portfolio/bvc.png",
    highlight: "Estrategia y Posicionamiento",
    buttonText: "Conoce el caso"
  },
];

export default function PortfolioCarousel() {
  return (
    <section className="w-full bg-[#440099] py-16 md:py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-center text-3xl md:text-4xl font-bold text-white mb-12">
          ¿Quieres ser el próximo?
        </h2>
        
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={30}
          slidesPerView={'auto'}
          centeredSlides={true}
          loop={true}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          navigation={true}
          breakpoints={{
            320: {
              slidesPerView: 1,
              spaceBetween: 20
            },
            768: {
              slidesPerView: 'auto',
              spaceBetween: 30
            }
          }}
          className="portfolio-carousel !py-8"
        >
          {portfolioItems.map((item, index) => (
            <SwiperSlide key={index} className="!w-[90vw] sm:!w-[500px] lg:!w-[600px] !h-auto">
              <div className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-lg">
                <div className="relative mb-6 h-48 md:h-56 w-full overflow-hidden rounded-lg">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 90vw, 600px"
                  />
                  <div className="absolute bottom-4 right-0 rounded-l-lg bg-[#440099] px-4 py-2 text-sm md:text-base font-bold text-white shadow-lg">
                    {item.highlight}
                  </div>
                </div>
                
                <h3 className="mb-3 text-xl md:text-2xl font-bold text-gray-900">
                  {item.title}
                </h3>
                
                <div className="mb-4 flex flex-wrap gap-2">
                  {item.tags.map((tag, tagIndex) => (
                    <span 
                      key={tagIndex} 
                      className="rounded-md bg-gray-100 px-2 py-1 text-xs md:text-sm font-medium text-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <p className="mb-4 flex-grow text-gray-600 text-sm md:text-base">
                  {item.description}
                </p>
                
                <button 
                  className="mt-auto w-full rounded-lg bg-[#440099] py-2 md:py-3 text-sm md:text-base font-semibold text-white transition-colors hover:bg-[#330077]"
                  onClick={() => {
                    // Aquí puedes agregar la lógica para abrir el caso de estudio
                    console.log(`Ver caso: ${item.title}`);
                  }}
                >
                  {item.buttonText}
                </button>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .portfolio-carousel {
          padding: 1rem 0;
        }
        
        .portfolio-carousel .swiper-slide {
          transition: transform 0.3s ease, opacity 0.3s ease;
          opacity: 0.7;
        }
        
        .portfolio-carousel .swiper-slide-active {
          opacity: 1;
          transform: scale(1.05);
        }
        
        .portfolio-carousel .swiper-button-next,
        .portfolio-carousel .swiper-button-prev {
          color: white;
          background: rgba(68, 0, 153, 0.8);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          transition: all 0.3s ease;
        }
        
        .portfolio-carousel .swiper-button-next:after,
        .portfolio-carousel .swiper-button-prev:after {
          font-size: 1.25rem;
          font-weight: bold;
        }
        
        .portfolio-carousel .swiper-button-next:hover,
        .portfolio-carousel .swiper-button-prev:hover {
          background: rgba(68, 0, 153, 1);
          transform: scale(1.1);
        }
        
        @media (max-width: 640px) {
          .portfolio-carousel .swiper-button-next,
          .portfolio-carousel .swiper-button-prev {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
