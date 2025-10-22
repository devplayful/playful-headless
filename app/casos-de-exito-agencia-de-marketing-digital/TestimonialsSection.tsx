"use client";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Image from "next/image";
import BlogPosts from "@/components/BlogPosts";

const testimonials = [
  {
    id: 1,
    name: "Carlos Rodríguez",
    role: "CEO de TechSolutions",
    content:
      "El trabajo de Playful Agency transformó por completo nuestra presencia en línea. Incrementamos nuestras conversiones en un 200% en solo 3 meses. Su equipo es altamente profesional y los resultados hablan por sí solos.",
    avatar: "/images/avatars/avatar1.jpg",
  },
  {
    id: 2,
    name: "María González",
    role: "Directora de Marketing",
    content:
      "La estrategia de marketing digital implementada superó todas nuestras expectativas. El retorno de inversión ha sido increíble. Definitivamente los recomendaría a cualquier negocio que busque crecer en línea.",
    avatar: "/images/avatars/avatar2.jpg",
  },
  {
    id: 3,
    name: "Juan Pérez",
    role: "Fundador de StartupX",
    content:
      "Trabajar con Playful Agency ha sido una de las mejores decisiones para nuestro negocio. Su enfoque en datos y resultados es impresionante. ¡Increíble equipo!",
    avatar: "/images/avatars/avatar3.jpg",
  },
  {
    id: 4,
    name: "Ana Martínez",
    role: "Directora de Ventas",
    content:
      "La implementación de su estrategia de automatización de marketing ha optimizado completamente nuestro proceso de ventas. ¡Los resultados han sido excepcionales!",
    avatar: "/images/avatars/avatar4.jpg",
  },
];

interface TestimonialsSectionProps {
  textColor?: string; // Hex color code, e.g. '#ffffff'
}

export default function TestimonialsSection({ textColor = '#4A4453' }: TestimonialsSectionProps) {
  // Create style object for text color
  const textStyle = {
    color: textColor,
  };

 
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
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          dots: true,
          arrows: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: true,
          arrows: false,
        },
      },
    ],
  };

  return (
    <section className="py-16  from-purple-700 to-purple-900">
      <div className="max-w-7xl mx-auto px-1 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={textStyle}>
            Lo que nuestros clientes dicen
          </h2>
          <p className="text-lg mb-12 max-w-3xl mx-auto " style={textStyle} >
            Aquí, la voz la tienen ellos. Las historias de nuestros clientes no
            solo son nuestra mejor carta de presentación, sino también el
            reflejo de un trabajo enfocado en resultados reales que potencian
            negocios.
          </p>
        </div>

        <div className="px-12 playful-movil-testimonialCard">
          <Slider {...settings} className="mx-[-30px]">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="px-6">
                <div className="bg-white rounded-3xl shadow-lg overflow-hidden w-full h-[444px] flex flex-col mx-auto">
                  <div className="p-8 flex flex-col h-full">
                    {/* Imagen del avatar */}
                    <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mb-4 mx-auto">
                      <span className="text-2xl font-bold text-purple-700">
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>

                    {/* Nombre */}
                    <h4 className="text-center font-semibold text-lg mb-2" style={textStyle}>
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
                    <p className="text-center flex-grow flex items-center" >
                      "{testimonial.content}"
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>

        {/* Sección de Logos de Clientes - Versión Mejorada */}
        <div className="my-16">
          <div className="max-w-7xl mx-auto  sm:px-6 lg:px-8">
            <h3 className="text-center text-white text-2xl md:text-3xl font-bold mb-12">
              <span style={textStyle}>Nuestros aliados estratégicos</span>
            </h3>
            <div className="">
              <Slider
                {...{
                  slidesToShow: 3,
                  slidesToScroll: 1,
                  autoplay: true,
                  autoplaySpeed: 2000,
                  arrows: true,
                  dots: false,
                  infinite: true,
                  speed: 800,
                  cssEase: "ease-in-out",
                  responsive: [
                    {
                      breakpoint: 1280,
                      settings: {
                        slidesToShow: 3,
                        arrows: true,
                      },
                    },
                    {
                      breakpoint: 1024,
                      settings: {
                        slidesToShow: 2,
                        arrows: true,
                      },
                    },
                    {
                      breakpoint: 640,
                      settings: {
                        slidesToShow: 1,
                        arrows: false,
                      },
                    },
                  ],
                }}
                className="[&_.slick-arrow]:hidden sm:[&_.slick-arrow]:block"
              >
                {Array.from({ length: 5 })
                  .flatMap((_, i) => [
                    "/images/logos/venezolano.png",
                    "/images/logos/mercantil.png",
                  ])
                  .map((logo, index) => (
                    <div key={index} className="px-2 sm:px-4">
                      <div className="w-full h-[400px] sm:h-64">
                        <div className="w-full h-full relative">
                          <Image
                            src={logo}
                            alt={`Logo ${logo.split("/").pop()?.split(".")[0]}`}
                            fill
                            sizes="(max-width: 768px) 10vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-contain p-1 sm:p-2"
                            priority={index < 2}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </Slider>
            </div>
          </div>
        </div>

        {/* Sección de Entradas del Blog */}
       
      </div>
    </section>
  );
}
