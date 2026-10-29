import type { Metadata } from 'next';
import { getHomePageMetadata } from '@/services/wordpress';
import { canonicalForPath } from '@/utils/canonical';
import { WEBSITE_JSON_LD } from '@/utils/organization-schema.mjs';
import { SERVICE_BOOKING_HREF } from '@/utils/booking';
import {
  HOME_ANTETITULO,
  HOME_H1,
  HOME_HERO_CTA_LABEL,
  HOME_SUBTITULO,
} from '@/lib/home-copy';
import { ogJpegForPath, ogJpegMeta } from '@/lib/og-images';
import { pageSocialMetadata } from '@/utils/page-seo-overrides.mjs';

const HOME_CANONICAL = canonicalForPath('/');

export async function generateMetadata(): Promise<Metadata> {
  const defaultTitle = 'Playful Agency - Agencia de E-commerce | Marketing Digital';
  const defaultDescription = '¿Tu e-commerce está perdiendo dinero sin que lo sepas? En Playful Agency transformamos plataformas mediocres en máquinas de conversión de alto rendimiento.';
  const defaultOgImage = ogJpegForPath('/') || '/images/og/home.jpg';

  // Next.js 15 resolveAbsoluteUrlWithPathname collapses pathname `/` to origin
  // (no trailing slash). Home canonical + og:url are emitted as raw tags below
  // so they stay exactly `https://playfulagency.com/` to match the sitemap.
  try {
    const yoastData = await getHomePageMetadata();
    const title = yoastData.yoast_wpseo_title || defaultTitle;
    const description = yoastData.yoast_wpseo_metadesc || defaultDescription;
    const social = pageSocialMetadata({
      title,
      description,
      images: [ogJpegMeta(defaultOgImage, 'Playful Agency - Agencia de E-commerce')],
      type: 'website',
    });
    return {
      title,
      description,
      openGraph: {
        ...social.openGraph,
        locale: 'es_ES',
        siteName: 'Playful Agency',
      },
      twitter: social.twitter,
    };
  } catch {
    const social = pageSocialMetadata({
      title: defaultTitle,
      description: defaultDescription,
      images: [ogJpegMeta(defaultOgImage, 'Playful Agency - Agencia de E-commerce')],
      type: 'website',
    });
    return {
      title: defaultTitle,
      description: defaultDescription,
      openGraph: {
        ...social.openGraph,
        locale: 'es_ES',
        siteName: 'Playful Agency',
      },
      twitter: social.twitter,
    };
  }
}

import Link from "next/link";
import HomeHeroArt, { homeHeroLcpHref } from "@/components/HomeHeroArt";
import MaterialServicesSection from "@/components/MaterialServicesSection";
import SolucionesPlayful from "@/components/SolucionesPlayful";
import CarouselResultados from "@/components/CarouselResultados";
import TestimonialsSection from "@/components/TestimonialsSectionClient";
import { HomePageContent } from "./HomePageContent";
import CimaBreaker from "@/components/premios-cima/CimaBreaker";
import TwoColumnCtaSection from "@/components/ui/TwoColumnCtaSection";
import BlogRelatedPostsSection from "@/components/sections/BlogRelatedPostsSection";
import { getAllCaseStudies, getLatestBlogPosts } from "@/services/wordpress";

const shell = "max-w-[1200px] mx-auto px-4 md:px-6";

async function HomeContent() {
  // Obtener casos de éxito y posts del bloque de blog una sola vez en el servidor
  const [casosDeExito, blogPosts] = await Promise.all([
    getAllCaseStudies(),
    getLatestBlogPosts(6).catch(() => []),
  ]);
  return (
    <div className="">
      {/* Hero Section */}
      <section data-cta-section="hero" className="relative overflow-hidden">
        <div className={`${shell} pt-4 pb-20`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-2">
                <p className="playful-miga-pan">{HOME_ANTETITULO}</p>
                <p className="playful-h1">{HOME_H1} </p>
              </div>

              <div className="space-y-4 text-purple-800">
                <p className="playful-contenido-p">{HOME_SUBTITULO}</p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href={SERVICE_BOOKING_HREF} className="playful-boton">
                    {HOME_HERO_CTA_LABEL}
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Illustration Area */}
            <div className="relative">
              <HomeHeroArt />
            </div>
          </div>
        </div>

        {/* Floating decorative elements */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-purple-300 rounded-full opacity-60 animate-bounce"></div>
        <div
          className="absolute top-40 right-20 w-6 h-6 bg-pink-300 rounded-full opacity-60 animate-bounce"
          style={{ animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute bottom-40 left-20 w-3 h-3 bg-teal-300 rounded-full opacity-60 animate-bounce"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-20 right-40 w-5 h-5 bg-yellow-300 rounded-full opacity-60 animate-bounce"
          style={{ animationDelay: "1.5s" }}
        ></div>
      </section>

      <CimaBreaker variant="home" />

      {/* Material UI Services Section */}
      <MaterialServicesSection className={shell} />

      <SolucionesPlayful className={shell} />

      <section className="py-12">
        <div className={shell}>
          <CarouselResultados casosDeExito={casosDeExito} />
        </div>
      </section>

      <section className="py-12">
        <div className={shell}>
          <TestimonialsSection />
        </div>
      </section>

      <section className="py-12">
        <div className={shell}>
          <BlogRelatedPostsSection posts={blogPosts} />
        </div>
      </section>

      <section className="py-12">
        <div className={shell}>
          <TwoColumnCtaSection 
            contentBgColor="#B3FFF3"
            imageUrl="/images/imagen-nueva-cta-home.png"
            buttonText="Llena el formulario y hablemos sobre tu web"
            buttonLink={SERVICE_BOOKING_HREF}
          />
        </div>
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <link rel="canonical" href={HOME_CANONICAL} />
      <meta property="og:url" content={HOME_CANONICAL} />
      <link rel="preload" as="image" href={homeHeroLcpHref()} fetchPriority="high" />
      <script
        id="playful-website"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: WEBSITE_JSON_LD }}
      />
      <h1 className="sr-only">{HOME_H1} </h1>
      <HomePageContent>
        <HomeContent />
      </HomePageContent>
    </>
  );
}
