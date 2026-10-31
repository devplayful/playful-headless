"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import Image from "next/image";
import {
  homePartnerLogos,
  homePartnerLogosHeading,
  homeTestimonials,
  homeTestimonialsHeading,
  homeTestimonialsSubheading,
} from "@/cms/data/home-testimonials-data";
import type { HomeMainContent } from "@/cms/data/home-main-content";
import { HOME_MAIN_CONTENT } from "@/cms/data/home-main-content";

type TestimonialsCopy = HomeMainContent["testimonios"];

const defaultCopy = HOME_MAIN_CONTENT.testimonios;

interface TestimonialsSectionProps {
  textColor?: string;
  className?: string;
  copy?: TestimonialsCopy;
}

export default function TestimonialsSection({
  textColor = "#4A4453",
  className,
  copy = defaultCopy,
}: TestimonialsSectionProps) {
  const textStyle: React.CSSProperties = { color: textColor };
  const testimonials = copy.items.length ? copy.items : [...homeTestimonials];
  const partnerLogos = copy.partnerLogos.length ? copy.partnerLogos : homePartnerLogos;
  const heading = copy.heading || homeTestimonialsHeading;
  const subheading = copy.subheading || homeTestimonialsSubheading;
  const logosHeading = copy.logosHeading || homePartnerLogosHeading;

  return (
    <section className={className}>
      <div className="w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-normal mb-4" style={textStyle}>
            {heading}
          </h2>
          <p className="text-lg mb-12 max-w-3xl mx-auto" style={textStyle}>
            {subheading}
          </p>
        </div>

        <div className="w-full overflow-hidden pb-12">
          <div className="max-w-[1200px] mx-auto px-4">
            <Swiper
              modules={[Pagination, Autoplay]}
              slidesPerView={1}
              spaceBetween={20}
              pagination={{
                clickable: true,
                dynamicBullets: true,
              }}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
              }}
              breakpoints={{
                768: {
                  slidesPerView: 2,
                  spaceBetween: 24,
                },
              }}
              className="testimonials-swiper"
            >
              {testimonials.map((testimonial) => (
                <SwiperSlide key={testimonial.id}>
                  <div className="bg-white rounded-3xl shadow-lg overflow-hidden w-full h-[650px] flex flex-col justify-center items-center text-center p-3 md:p-8">
                    <div className="w-20 h-20 relative mb-4">
                      <Image
                        src="/images/avatar-playful.svg"
                        alt="Avatar Playful"
                        fill
                        className="object-contain"
                      />
                    </div>

                    <h4 className="font-semibold text-lg mb-2" style={textStyle}>
                      {testimonial.name}
                    </h4>

                    <div className="flex justify-center mb-4">
                      <div className="text-yellow-400 text-xl">
                        {[...Array(5)].map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>
                    </div>

                    <p className="flex-grow flex items-center text-sm md:text-base px-2">
                      &quot;{testimonial.content}&quot;
                    </p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        <div className="py-16">
          <h3 className="text-center text-2xl md:text-3xl font-normal mb-12" style={textStyle}>
            {logosHeading}
          </h3>

          <div className="w-full max-w-[1200px] mx-auto px-4 pb-12">
            <Swiper
              modules={[Pagination, Autoplay]}
              slidesPerView={1}
              spaceBetween={20}
              pagination={{
                clickable: true,
                dynamicBullets: true,
              }}
              autoplay={{
                delay: 2000,
                disableOnInteraction: false,
              }}
              breakpoints={{
                480: {
                  slidesPerView: 2,
                  spaceBetween: 16,
                },
                640: {
                  slidesPerView: 3,
                  spaceBetween: 20,
                },
                768: {
                  slidesPerView: 4,
                  spaceBetween: 24,
                },
              }}
              className="logos-swiper"
            >
              {partnerLogos.map((logo, index) => (
                <SwiperSlide key={logo}>
                  <div className="w-full h-[200px] flex items-center justify-center p-4">
                    <div className="w-full h-full relative">
                      <Image
                        src={logo}
                        alt={`Logo ${logo.split("/").pop()?.split(".")[0]}`}
                        fill
                        sizes="(max-width: 768px) 90vw, (max-width: 1024px) 40vw, 25vw"
                        className="object-contain"
                        priority={index < 2}
                      />
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
}
