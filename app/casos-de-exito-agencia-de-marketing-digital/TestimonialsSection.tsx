'use client';

import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Image from 'next/image';

const testimonials = [
  {
    id: 1,
    name: 'Carlos Rodríguez',
    role: 'CEO de TechSolutions',
    content: 'El trabajo de Playful Agency transformó por completo nuestra presencia en línea. Incrementamos nuestras conversiones en un 200% en solo 3 meses. Su equipo es altamente profesional y los resultados hablan por sí solos.',
    avatar: '/images/avatars/avatar1.jpg'
  },
  {
    id: 2,
    name: 'María González',
    role: 'Directora de Marketing',
    content: 'La estrategia de marketing digital implementada superó todas nuestras expectativas. El retorno de inversión ha sido increíble. Definitivamente los recomendaría a cualquier negocio que busque crecer en línea.',
    avatar: '/images/avatars/avatar2.jpg'
  },
  {
    id: 3,
    name: 'Juan Pérez',
    role: 'Fundador de StartupX',
    content: 'Trabajar con Playful Agency ha sido una de las mejores decisiones para nuestro negocio. Su enfoque en datos y resultados es impresionante. ¡Increíble equipo!',
    avatar: '/images/avatars/avatar3.jpg'
  },
  {
    id: 4,
    name: 'Ana Martínez',
    role: 'Directora de Ventas',
    content: 'La implementación de su estrategia de automatización de marketing ha optimizado completamente nuestro proceso de ventas. ¡Los resultados han sido excepcionales!',
    avatar: '/images/avatars/avatar4.jpg'
  }
];

export default function TestimonialsSection() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    centerMode: false,
    arrows: true,
    centerPadding: '60px',
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
          centerPadding: '40px'
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: true,
          centerPadding: '60px'
        }
      }
    ]
  };

  return (
    <section className="py-16  from-purple-700 to-purple-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Nuestros aliados estratégicos
          </h2>
         
        </div>

        <div className="px-12">
          <Slider {...settings} className="mx-[-30px]">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="px-6">
                <div className="bg-white rounded-3xl shadow-lg overflow-hidden w-full h-[444px] flex flex-col mx-auto">
                  <div className="p-8 flex flex-col h-full">
                    {/* Imagen del avatar */}
                    <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mb-4 mx-auto">
                      <span className="text-2xl font-bold text-purple-700">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    
                    {/* Nombre */}
                    <h4 className="text-center text-gray-900 font-semibold text-lg mb-2">
                      {testimonial.name}
                    </h4>
                    
                    {/* Estrellas */}
                    <div className="flex justify-center mb-4">
                      <div className="text-yellow-400 text-xl">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Contenido del testimonio */}
                    <p className="text-gray-600 text-center flex-grow flex items-center">
                      "{testimonial.content}"
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>

        {/* Sección de Logos de Clientes */}
        <div className="mt-16">
          <h3 className="text-center text-white text-xl font-medium mb-8">
            Hemos trabajado con las mejores marcas
          </h3>
          <div className="px-8">
            <Slider 
              {...{
                ...settings,
                slidesToShow: 3,
                slidesToScroll: 1,
                autoplay: true,
                autoplaySpeed: 3000,
                arrows: false,
                dots: false,
                responsive: [
                  {
                    breakpoint: 1024,
                    settings: {
                      slidesToShow: 3,
                      slidesToScroll: 1,
                      infinite: true
                    }
                  },
                  {
                    breakpoint: 768,
                    settings: {
                      slidesToShow: 2,
                      slidesToScroll: 1,
                      centerMode: false
                    }
                  },
                  {
                    breakpoint: 480,
                    settings: {
                      slidesToShow: 1,
                      slidesToScroll: 1,
                      centerMode: true
                    }
                  }
                ]
              }}
              className="mx-[-15px]"
            >
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="px-4">
                  <div className="bg-white/10 rounded-2xl p-6 flex items-center justify-center h-32 backdrop-blur-sm transition-all duration-300">
                    <Image 
                      src="/images/logos/Playful-LogoV.svg" 
                      alt={`Logo ${item}`}
                      width={120}
                      height={80}
                      className="object-contain h-full w-auto"
                    />
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>

        {/* Sección de Entradas del Blog */}
        <div className="mt-20 py-16 px-4 sm:px-6 lg:px-8 rounded-3xl" style={{ backgroundColor: 'rgba(0, 106, 97, 1.0)' }}>
          <div className="max-w-7xl mx-auto">
            <h3 className="text-center text-white text-3xl md:text-4xl font-bold mb-4">
              Explora Nuestro Blog
            </h3>
            <p className="text-center text-white/80 text-lg mb-12 max-w-3xl mx-auto">
              Descubre artículos, guías y consejos para llevar tu negocio al siguiente nivel
            </p>
            
            <Slider 
              {...{
                ...settings,
                slidesToShow: 3,
                slidesToScroll: 1,
                autoplay: false,
                arrows: true,
                dots: false,
                responsive: [
                  {
                    breakpoint: 1024,
                    settings: {
                      slidesToShow: 2,
                      slidesToScroll: 1,
                      infinite: true
                    }
                  },
                  {
                    breakpoint: 640,
                    settings: {
                      slidesToShow: 1,
                      slidesToScroll: 1,
                      centerMode: true,
                      centerPadding: '20px'
                    }
                  }
                ]
              }}
              className="mx-[-10px]"
            >
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={`blog-${item}`} className="px-3">
                  <div className="bg-white rounded-2xl overflow-hidden shadow-lg h-full flex flex-col">
                    {/* Imagen del post */}
                    <div className="h-48 bg-gray-200 relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center">
                        <span className="text-white font-bold">Imagen del Post {item}</span>
                      </div>
                    </div>
                    
                    {/* Badge de categoría */}
                    <div className="px-5 pt-4">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-medium">
                        Marketing Digital
                      </span>
                    </div>
                    
                    {/* Contenido */}
                    <div className="p-5 flex-1 flex flex-col">
                      <h4 className="text-gray-900 font-bold text-xl mb-3 leading-tight">
                        Cómo mejorar tu presencia en línea con estrategias de marketing digital efectivas
                      </h4>
                      <p className="text-gray-600 text-sm mb-5 flex-1">
                        Descubre las mejores estrategias para mejorar tu presencia en línea y llegar a más clientes potenciales a través del marketing digital.
                      </p>
                      
                      {/* Pie de tarjeta */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <span className="text-sm text-gray-500">Hace 2 días</span>
                        <button className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-medium py-1.5 px-4 rounded-full transition-colors">
                          Leer más
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
            
            <div className="text-center mt-12">
              <button className="bg-white text-[#2A0064] hover:bg-gray-100 font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105">
              ¡Crece como ellos!
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
