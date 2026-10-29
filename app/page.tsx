import type { Metadata } from 'next';
import { getHomePageMetadata } from '@/services/wordpress';
import { canonicalForPath } from '@/utils/canonical';
import { SERVICE_BOOKING_HREF } from '@/utils/booking';
import {
  HOME_ANTETITULO,
  HOME_H1,
  HOME_HERO_CTA_LABEL,
  HOME_META_DESCRIPTION,
  HOME_SUBTITULO,
  HOME_TITLE,
} from '@/lib/home-copy';
import HomeB2BSections from '@/components/HomeB2BSections';
import HomeB2BCasosSection from '@/components/HomeB2BCasosSection';
import HomeB2BTestimonialsSection from '@/components/HomeB2BTestimonialsSection';
import { ogJpegForPath, ogJpegMeta } from '@/lib/og-images';
import { pageSocialMetadata } from '@/utils/page-seo-overrides.mjs';

const HOME_CANONICAL = canonicalForPath('/');

export async function generateMetadata(): Promise<Metadata> {
  const defaultTitle = HOME_TITLE;
  const defaultDescription = HOME_META_DESCRIPTION;
  const defaultOgImage = ogJpegForPath('/') || '/images/og/home.jpg';

  // Next.js 15 resolveAbsoluteUrlWithPathname collapses pathname `/` to origin
  // (no trailing slash). Home canonical + og:url are emitted as raw tags below
  // so they stay exactly `https://playfulagency.com/` to match the sitemap.
  try {
    await getHomePageMetadata();
    const title = defaultTitle;
    const description = defaultDescription;
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
import { HomePageContent } from "./HomePageContent";
import CimaBreaker from "@/components/premios-cima/CimaBreaker";
import TwoColumnCtaSection from "@/components/ui/TwoColumnCtaSection";
import BlogRelatedPostsSection from "@/components/sections/BlogRelatedPostsSection";
import { getLatestBlogPosts } from "@/services/wordpress";

const shell = "max-w-[1200px] mx-auto px-4 md:px-6";

async function HomeContent() {
  // Obtener casos de éxito y posts del bloque de blog una sola vez en el servidor
  const blogPosts = await getLatestBlogPosts(6).catch(() => []);
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
              <img src="../images/playful-imagen-banner.png" alt="" />
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

      <HomeB2BSections className={shell} />

      <section className="py-12">
        <div className={shell}>
          <HomeB2BCasosSection />
        </div>
      </section>

      <section className="py-12">
        <div className={shell}>
          <HomeB2BTestimonialsSection />
        </div>
      </section>

      <section className="py-12">
        <div className={shell}>
          <h2 className="playful-h2 text-center mb-8">
            Marcas y aliados con los que trabajamos
          </h2>
        </div>
      </section>

      <section className="py-12">
        <div className={shell}>
          <BlogRelatedPostsSection
            posts={blogPosts}
            sectionTitle="Guías de e-commerce para decidir plataforma, pagos, integraciones y migración"
            sectionIntro="Si tu equipo todavía está comparando plataformas, métodos de pago o cómo migrar sin perder posicionamiento, en el blog lo explicamos paso a paso, para que llegue a la reunión con las preguntas claras."
            ctaLabel="Ver más artículos"
            ctaHref="/blog"
          />
        </div>
      </section>

      <section className="py-12">
        <div className={shell}>
          <TwoColumnCtaSection
            contentBgColor="#B3FFF3"
            imageUrl="/images/imagen-nueva-cta-home.png"
            title="Reserva 30 a 40 minutos y sal con el alcance del proyecto"
            subtitle="Revisamos con tu equipo la tienda o el proyecto, recogemos toda la información que necesitamos y te decimos qué plataforma, qué integraciones y qué fases necesita el canal. Con eso preparamos el presupuesto y te lo presentamos en otra reunión, unos días después, aunque si lo necesitas antes podemos darte una cifra aproximada en la primera."
            ctaTitle="¿Revisamos juntos el canal de tu marca?"
            buttonText="Reservar reunión de 30 a 40 minutos"
            buttonLink={SERVICE_BOOKING_HREF}
            secondaryButtonText="O escríbenos por el formulario"
            secondaryButtonLink="/contactar-agencia-de-marketing-digital"
            footerNote="No hay compromiso de seguir con nosotros. Y si sigues adelante, la garantía de 30 días cubre cualquier error que aparezca después de la entrega."
          />
        </div>
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <h1 className="sr-only">{HOME_H1} </h1>
      <HomePageContent>
        <HomeContent />
      </HomePageContent>
    </>
  );
}
