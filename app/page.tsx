import type { Metadata } from 'next';
import { canonicalForPath } from '@/utils/canonical';
import { ORGANIZATION_JSON_LD } from '@/utils/organization-schema.mjs';
import { HOME_META } from './home-copy';

const HOME_CANONICAL = canonicalForPath('/');
const HOME_OG_IMAGE = 'https://playfulagency.com/og.jpg';

export const metadata: Metadata = {
  title: HOME_META.title,
  description: HOME_META.description,
  openGraph: {
    title: HOME_META.title,
    description: HOME_META.description,
    type: 'website',
    locale: 'es_ES',
    siteName: 'Playful Agency',
    images: [{
      url: HOME_OG_IMAGE,
      width: 1200,
      height: 630,
      alt: HOME_META.title,
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: HOME_META.title,
    description: HOME_META.description,
    images: [HOME_OG_IMAGE],
  },
};

import Image from "next/image";
import Link from "next/link";
import MaterialServicesSection from "@/components/MaterialServicesSection";
import SolucionesPlayful from "@/components/SolucionesPlayful";
import CarouselResultados, { type CaseStudy } from "@/components/CarouselResultados";
import TestimonialsSection from "@/components/TestimonialsSectionClient";
import HomeTestimonialsBlock from "@/components/HomeTestimonialsBlock";
import { HomePageContent } from "./HomePageContent";
import TwoColumnCtaSection from "@/components/ui/TwoColumnCtaSection";
import BlogRelatedPostsSection from "@/components/sections/BlogRelatedPostsSection";
import { getAllCaseStudies, getLatestBlogPosts } from "@/services/wordpress";
import { featuredTapaForSlug, resolveCaseStudyListingImage } from "@/lib/case-study-listing-image";
import {
  HOME_ALIADOS,
  HOME_BLOG,
  HOME_CASOS,
  HOME_CTA_FINAL,
  HOME_HERO,
  HOME_TESTIMONIOS,
} from "./home-copy";

const shell = "max-w-[1200px] mx-auto px-4 md:px-6";

function homeCaseStudies(
  casosDeExito: Array<Record<string, unknown>>,
): CaseStudy[] {
  const bySlug = new Map(
    casosDeExito
      .filter((item) => typeof item?.slug === "string")
      .map((item) => [item.slug as string, item]),
  );

  return HOME_CASOS.items.map((item, index) => {
    const wp = bySlug.get(item.slug);
    return {
      id: index + 1,
      title: item.name,
      slug: item.slug,
      description: item.body,
      categories: [...item.tags],
      badge: "",
      badgeColor: "bg-purple-600",
      buttonText: item.cta,
      buttonColor: "bg-blue-600",
      image:
        resolveCaseStudyListingImage(
          wp as {
            slug?: string;
            featured_media_url?: string;
            _embedded?: { 'wp:featuredmedia'?: Array<{ source_url?: string }> };
          },
        ) || featuredTapaForSlug(item.slug),
    };
  });
}

async function HomeContent() {
  const [casosDeExito, blogPosts] = await Promise.all([
    getAllCaseStudies().catch(() => []),
    getLatestBlogPosts(6).catch(() => []),
  ]);
  const homeCases = homeCaseStudies(casosDeExito);
  return (
    <div className="">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className={`${shell} pt-4 pb-20`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-2">
                <h1 className="playful-h1">
                  {HOME_HERO.h1}
                </h1>
              </div>

              <div className="space-y-4 text-purple-800">
                <p className="playful-contenido-p">{HOME_HERO.antetitulo}</p>
                <p className="playful-contenido-p">{HOME_HERO.subtitulo}</p>
              </div>

              <div className="space-y-3">
                <a href={HOME_HERO.ctaHref} className="playful-boton">
                  {HOME_HERO.ctaPrincipal}
                </a>
                <p className="playful-contenido-p">{HOME_HERO.microcopia}</p>
                <p className="playful-contenido-p">
                  <Link
                    href={HOME_HERO.ctaSecundarioHref}
                    className="text-[#440099] font-semibold underline underline-offset-2"
                  >
                    {HOME_HERO.ctaSecundario}
                  </Link>
                </p>
              </div>
            </div>

            {/* Right Illustration Area */}
            <div className="relative">
              <Image
                src="/images/playful-imagen-banner.png"
                alt=""
                width={2048}
                height={2048}
                priority
                fetchPriority="high"
                sizes="(min-width: 1024px) 560px, 100vw"
                className="w-full h-auto"
              />
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

      <section className="relative">
        <div className={`${shell} pt-2 pb-16 md:pb-20`}>
          <div className="playful-contenedor playful-contenedor-B3FFF3 rounded-[32px] md:rounded-[48px] !mt-0">
            <h2 className="playful-h2 text-center">[SUBTÍTULO PENDIENTE · Contenido]</h2>
            <div className="space-y-6 max-w-4xl mx-auto">
              {HOME_HERO.cuerpo.map((paragraph) => (
                <p key={paragraph} className="playful-contenido-p leading-7 md:leading-8">
                  {paragraph}
                </p>
              ))}
              <p className="playful-contenido-p leading-7 md:leading-8">
                {HOME_HERO.shopifyAntes}
                <Link href={HOME_HERO.shopifyHref} className="font-medium text-[#440099] underline">
                  {HOME_HERO.shopifyAnchor}
                </Link>
                {HOME_HERO.shopifyDespues}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Material UI Services Section */}
      <MaterialServicesSection className={shell} />

      <SolucionesPlayful className={shell} />

      <section className="py-12">
        <div className={shell}>
          <CarouselResultados
            title={HOME_CASOS.h2}
            subtitle={HOME_CASOS.intro}
            title2={HOME_CASOS.h3}
            cases={homeCases}
            fullDescription
          />
        </div>
      </section>

      <section className="py-12">
        <div className={shell}>
          <HomeTestimonialsBlock
            title={HOME_TESTIMONIOS.h2}
            intro={HOME_TESTIMONIOS.intro}
            items={HOME_TESTIMONIOS.destacados}
          />
          <TestimonialsSection
            alliesTitle={HOME_ALIADOS.titulo}
            hideHeader
            hideQuotes
          />
        </div>
      </section>

      <section className="py-12">
        <div className={shell}>
          <BlogRelatedPostsSection
            posts={blogPosts}
            title={HOME_BLOG.h2}
            subtitle={HOME_BLOG.intro}
            ctaLabel={HOME_BLOG.cta}
          />
        </div>
      </section>

      <section className="py-12">
        <div className={shell}>
          <TwoColumnCtaSection
            contentBgColor="#B3FFF3"
            imageUrl="/images/imagen-nueva-cta-home.png"
            title={HOME_CTA_FINAL.h2}
            subtitle={HOME_CTA_FINAL.parrafos[0]}
            extraParagraph={HOME_CTA_FINAL.parrafos[1]}
            ctaTitle={HOME_CTA_FINAL.h3}
            ctaAs="h3"
            buttonText={HOME_CTA_FINAL.ctaPrincipal}
            buttonLink={HOME_CTA_FINAL.ctaHref}
            secondaryButtonText={HOME_CTA_FINAL.ctaSecundario}
            secondaryButtonLink={HOME_CTA_FINAL.ctaSecundarioHref}
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
      <script
        id="playful-organization"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ORGANIZATION_JSON_LD }}
      />
      <HomePageContent>
        <HomeContent />
      </HomePageContent>
    </>
  );
}
