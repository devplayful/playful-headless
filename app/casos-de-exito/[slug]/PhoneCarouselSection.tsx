'use client'

import Image from 'next/image'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

type PhoneValue = string | { url: string }

interface PhoneCarouselProps {
  phones: {
    telefono1?: PhoneValue
    telefono2?: PhoneValue
    telefono3?: PhoneValue
    telefono4?: PhoneValue
    telefonos?: PhoneValue
  }
}

export default function PhoneCarouselSection({ phones }: PhoneCarouselProps) {
  const phoneArray = [
    { id: 'telefono1', value: phones.telefono1 },
    { id: 'telefono2', value: phones.telefono2 },
    { id: 'telefono3', value: phones.telefono3 },
    { id: 'telefono4', value: phones.telefono4 },
    { id: 'telefonos', value: phones.telefonos },
  ].filter((item): item is { id: string; value: PhoneValue } => Boolean(item.value))

  // Si por alguna razón llega vacío, no renderizar nada
  if (phoneArray.length === 0) return null

  const settings = {
    dots: true,
    infinite: phoneArray.length > 3,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true,
    slidesToScroll: 1,
    slidesToShow: 3,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3 } },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          arrows: false,
          centerMode: true,
          centerPadding: '40px',
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          arrows: false,
          centerMode: true,
          centerPadding: '20px',
        },
      },
    ],
  } 

  return (
    <section className="py-16 bg-[#FEF7FF]">
      <div className="max-w-7xl mx-auto px-6">
        <style jsx global>{`
          .phone-carousel-wrapper .slick-slide {
            padding: 0 12px;
          }
          .phone-carousel-wrapper .slick-list {
            margin: 0 -12px;
          }
          .phone-carousel-wrapper .slick-dots {
            bottom: -40px;
          }
          .phone-carousel-wrapper .slick-dots li button:before {
            font-size: 10px;
            color: #9333ea;
          }
          .phone-carousel-wrapper .slick-dots li.slick-active button:before {
            color: #9333ea;
          }
        `}</style>

        <div className="phone-carousel-wrapper">
          <Slider {...settings}>
            {phoneArray.map((item, index) => {
              const src = typeof item.value === 'string' ? item.value : item.value.url

              return (
                <div key={`${item.id}-${index}`}>
                  <div className="relative w-full h-[650px] rounded-[18px] overflow-hidden p-4">
                    <Image
                      src={src}
                      alt={`Teléfono ${index + 1}`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 320px, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                </div>
              )
            })}
          </Slider>
        </div>
      </div>
    </section>
  )
}
