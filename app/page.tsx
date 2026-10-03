import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import MaterialServicesSection from '@/components/MaterialServicesSection';
import SolucionesPlayful from '@/components/SolucionesPlayful';
import TestimonialsSection from '@/components/TestimonialsSectionClient';
import { HomePageContent } from './HomePageContent';
import TwoColumnCtaSection from '@/components/ui/TwoColumnCtaSection';
import BlogRelatedPostsSection from '@/components/sections/BlogRelatedPostsSection';
import { getAllCaseStudies, getLatestBlogPosts } from '@/services/wordpress';
import { canonicalForPath } from '@/utils/canonical';
import { ORGANIZATION_JSON_LD } from '@/utils/organization-schema.mjs';
import { featuredTapaForSlug, resolveCaseStudyListingImage } from '@/lib/case-study-listing-image';
import {
  HOME_ALIADOS,
  HOME_BLOG,
  HOME_CASOS,
  HOME_CTA_FINAL,
  HOME_HERO,
  HOME_META,
  HOME_TESTIMONIOS,
} from './home-copy';

const HOME_CANONICAL = canonicalForPath('/');
const HOME_OG_IMAGE = 'https://playfulagency.com/og.jpg';
const shell = 'max-w-[1200px] mx-auto px-4 md:px-6';

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

function HomeCaseCards({ casosDeExito }: { casosDeExito: Array<Record<string, any>> }) {
  const bySlug = new Map(
    casosDeExito
      .filter((item) => typeof item?.slug === 'string')
      .map((item) => [item.slug as string, item]),
  );

  return (
    <div
      className="w-full flex flex-col gap-[25px] p-[2.2rem] lg:px-[4rem] box-border md:p-[60px_40px] lg:p-[80px_90px] rounded-3xl md:rounded-[68px] bg-[url('/images/background.webp')] text-center playful-contenedor-B3FFF3"
    >
      <h2 className="playful-h2 text-center text-3xl md:text-4xl font-normal mb-4 text-white">
        {HOME_CASOS.h2}
      </h2>
      <p className="playful-contenido-p text-center text-lg mb-5 max-w-3xl mx-auto text-white">
        {HOME_CASOS.intro}
      </p>
      <h3 className="playful-h2 pb-4 text-white">
        {HOME_CASOS.h3}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {HOME_CASOS.items.map((item) => {
          const wp = bySlug.get(item.slug);
          const image = resolveCaseStudyListingImage(wp) || featuredTapaForSlug(item.slug);
          return (
            <article key={item.slug} className="bg-white rounded-2xl overflow-hidden shadow-lg flex flex-col text-left">
              <div className="relative h-48 bg-gray-200 overflow-hidden">
                {image ? (
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 360px, (min-width: 768px) 45vw, 90vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <span className="text-gray-400">{item.name}</span>
                  </div>
                )}
              </div>
              <div className="p-6 flex flex-col flex-1">
                <p className="text-xl font-normal text-gray-900 mb-4 leading-tight">
                  {item.name}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center px-3 py-1 bg-white border border-gray-300 rounded-full text-xs font-medium text-gray-700 whitespace-nowrap"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="playful-contenido-p flex-1 mb-6">
                  {item.body}
                </p>
                <div className="flex justify-end mt-auto">
                  <Link
                    href={item.href}
                    className="bg-blue-600 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    {item.cta}
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

async function HomeContent() {
  const [casosDeExito, blogPosts] = await Promise.all([
    getAllCaseStudies().catch(() => []),
    getLatestBlogPosts(6).catch(() => []),
  ]);

  return (
    <div className="">
      <section className="relative overflow-hidden">
        <div className={`${shell} pt-4 pb-20`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-2">
                <p className="playful-miga-pan">{HOME_HERO.antetitulo}</p>
                <h1 className="playful-h1">
                  {HOME_HERO.h1}
                </h1>
              </div>

              <div className="space-y-4 text-purple-800">
                <p className="playful-contenido-p">{HOME_HERO.subtitulo}</p>
                {HOME_HERO.cuerpo.map((paragraph) => (
                  <p key={paragraph} className="playful-contenido-p">
                    {paragraph}
                  </p>
                ))}
                <p className="playful-contenido-p">
                  {HOME_HERO.shopifyAntes}
                  <Link href={HOME_HERO.shopifyHref} className="font-medium text-[#440099] underline">
                    {HOME_HERO.shopifyAnchor}
                  </Link>
                  {HOME_HERO.shopifyDespues}
                </p>
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

        <div className="absolute top-20 left-10 w-4 h-4 bg-purple-300 rounded-full opacity-60 animate-bounce"></div>
        <div
          className="absolute top-40 right-20 w-6 h-6 bg-pink-300 rounded-full opacity-60 animate-bounce"
          style={{ animationDelay: '0.5s' }}
        ></div>
        <div
          className="absolute bottom-40 left-20 w-3 h-3 bg-teal-300 rounded-full opacity-60 animate-bounce"
          style={{ animationDelay: '1s' }}
        ></div>
        <div
          className="absolute bottom-20 right-40 w-5 h-5 bg-yellow-300 rounded-full opacity-60 animate-bounce"
          style={{ animationDelay: '1.5s' }}
        ></div>
      </section>

      <MaterialServicesSection className={shell} />

      <SolucionesPlayful className={shell} />

      <section className="py-12">
        <div className={shell}>
          <HomeCaseCards casosDeExito={casosDeExito} />
        </div>
      </section>

      <section className="py-12">
        <div className={shell}>
          <TestimonialsSection
            title={HOME_TESTIMONIOS.h2}
            intro={HOME_TESTIMONIOS.intro}
            alliesTitle={HOME_ALIADOS.titulo}
            featuredTestimonials={HOME_TESTIMONIOS.destacados}
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
