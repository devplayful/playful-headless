import Link from 'next/link';
import HomeHeroArt from '@/components/HomeHeroArt';
import MaterialServicesSection from '@/components/MaterialServicesSection';
import SolucionesPlayful from '@/components/SolucionesPlayful';
import CarouselResultados from '@/components/CarouselResultados';
import TestimonialsSection from '@/components/TestimonialsSectionClient';
import CimaBreaker from '@/components/premios-cima/CimaBreaker';
import TwoColumnCtaSection from '@/components/ui/TwoColumnCtaSection';
import BlogRelatedPostsSection from '@/components/sections/BlogRelatedPostsSection';
import type { HomeMainContent } from '@/cms/data/home-main-content';
import { getAllCaseStudies, getLatestBlogPosts } from '@/services/wordpress';

const shell = 'max-w-[1200px] mx-auto px-4 md:px-6';

function HtmlParagraph({ html, className }: { html: string; className: string }) {
  return (
    <p
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export async function HomePayloadBody({ content }: { content: HomeMainContent }) {
  const [casosDeExito, blogPosts] = await Promise.all([
    getAllCaseStudies(),
    getLatestBlogPosts(6).catch(() => []),
  ]);

  const { hero } = content;

  return (
    <div className="">
      <section data-cta-section="hero" className="relative overflow-hidden">
        <div className={`${shell} pt-4 pb-20`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-2">
                <p className="playful-miga-pan">{hero.miga}</p>
                <p className="playful-h1">{hero.h1}</p>
              </div>
              <div className="space-y-4 2 text-purple-800">
                <HtmlParagraph html={hero.paragraph1Html} className="playful-contenido-p" />
                <HtmlParagraph html={hero.paragraph2Html} className="playful-contenido-p" />
              </div>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href={hero.ctaHref} className="playful-boton">
                    {hero.ctaLabel}
                  </Link>
                </div>
              </div>
            </div>
            <div className="relative">
              <HomeHeroArt />
            </div>
          </div>
        </div>
        <div className="absolute top-20 left-10 w-4 h-4 bg-purple-300 rounded-full opacity-60 animate-bounce" />
        <div
          className="absolute top-40 right-20 w-6 h-6 bg-pink-300 rounded-full opacity-60 animate-bounce"
          style={{ animationDelay: '0.5s' }}
        />
        <div
          className="absolute bottom-40 left-20 w-3 h-3 bg-teal-300 rounded-full opacity-60 animate-bounce"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute bottom-20 right-40 w-5 h-5 bg-yellow-300 rounded-full opacity-60 animate-bounce"
          style={{ animationDelay: '1.5s' }}
        />
      </section>

      <CimaBreaker variant={content.premiosCima.variant} />

      <MaterialServicesSection className={shell} copy={content.problemas} />

      <SolucionesPlayful className={shell} copy={content.soluciones} />

      <section className="py-12">
        <div className={shell}>
          <CarouselResultados
            casosDeExito={casosDeExito}
            title={content.casosCarousel.title}
            subtitle={content.casosCarousel.subtitle}
            title2={content.casosCarousel.title2}
          />
        </div>
      </section>

      <section className="py-12">
        <div className={shell}>
          <TestimonialsSection copy={content.testimonios} />
        </div>
      </section>

      <section className="py-12">
        <div className={shell}>
          <BlogRelatedPostsSection
            posts={blogPosts}
            headingHtml={content.blog.headingHtml}
            introHtml={content.blog.introHtml}
          />
        </div>
      </section>

      <section className="py-12">
        <div className={shell}>
          <TwoColumnCtaSection
            contentBgColor={content.cta.contentBgColor}
            imageUrl={content.cta.imageUrl}
            imageAlt={content.cta.imageAlt}
            title={content.cta.title}
            subtitle={content.cta.subtitle}
            ctaTitle={content.cta.ctaTitle}
            buttonText={content.cta.buttonText}
            buttonLink={content.cta.buttonLink}
          />
        </div>
      </section>
    </div>
  );
}
