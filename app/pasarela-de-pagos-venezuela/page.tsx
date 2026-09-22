import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { canonicalForPath } from '@/utils/canonical';
import { CaseStudyCard } from '@/components/CarouselResultados';
import TestimonialsSection from '@/components/TestimonialsSectionClient';
import BlogRelatedPostsSection from '@/components/sections/BlogRelatedPostsSection';
import { getAllCaseStudies, getLatestBlogPosts } from '@/services/wordpress';
import { toShopifyCaseCards } from '@/app/agencia-shopify/shopify-cases';
import PasarelaFaqAccordion from './PasarelaFaqAccordion';
import styles from './PasarelaPagos.module.css';
import {
  BENEFITS,
  BOOKING_HREF,
  CONTACT_HREF,
  CTA,
  FAQ,
  HERO,
  INTRO_BAND,
  PAGE_META,
  PAIN_POINTS,
  PLAYFUL_URL_RE,
  SOCIAL_PROOF,
  buildFaqPageJsonLd,
} from './copy';

const PAGE_URL = canonicalForPath(PAGE_META.path);

const HERO_ART = '/images/pasarela-de-pagos-venezuela/hero-sofa@2x.png';
const BENEFIT_ART: Record<string, string> = {
  'beneficio-integracion': '/images/pasarela-de-pagos-venezuela/beneficio-integracion@2x.png',
  'beneficio-seguridad': '/images/pasarela-de-pagos-venezuela/beneficio-seguridad@2x.png',
  'beneficio-experiencia': '/images/pasarela-de-pagos-venezuela/beneficio-experiencia@2x.png',
};

export const metadata: Metadata = {
  title: PAGE_META.title,
  description: PAGE_META.description,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: PAGE_META.title,
    description: PAGE_META.description,
    url: PAGE_URL,
  },
};

function LinkedCopy({ text }: { text: string }) {
  const parts = text.split(PLAYFUL_URL_RE);
  return (
    <>
      {parts.map((part, index) => {
        if (!part.startsWith('https://playfulagency.com/')) {
          return <span key={`${part}-${index}`}>{part}</span>;
        }
        const href = part.replace('https://playfulagency.com', '') || '/';
        return (
          <Link
            key={part}
            href={href}
            className="text-[#440099] font-semibold underline underline-offset-2 break-all"
          >
            {part}
          </Link>
        );
      })}
    </>
  );
}

export default async function PasarelaDePagosVenezuelaPage() {
  const faqJsonLd = buildFaqPageJsonLd();
  const [casosDeExito, blogPosts] = await Promise.all([
    getAllCaseStudies().catch(() => []),
    getLatestBlogPosts(6).catch(() => []),
  ]);
  const caseCards = toShopifyCaseCards(casosDeExito);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <article className={`${styles.page} w-full pb-20`}>
        <section className={styles.heroBand}>
          <div className={styles.sectionInner}>
            <div className={styles.heroGrid}>
              <div>
                <p className={styles.heroEyebrow}>{HERO.eyebrow}</p>
                <h1 className={styles.heroTitle}>{HERO.h1}</h1>
                <p className={styles.heroBody}>{HERO.body}</p>
                <div className="mt-6 space-y-3">
                  <a href={BOOKING_HREF} className={styles.heroCta}>
                    {HERO.button}
                  </a>
                  <p className={styles.heroSubline}>{HERO.subline}</p>
                  <Link href={CONTACT_HREF} className={styles.heroContactLink}>
                    O escríbenos por el formulario
                  </Link>
                </div>
              </div>
              <div className={styles.heroArt} data-illustration-slot="hero">
                <img
                  src={HERO_ART}
                  alt=""
                  width={437}
                  height={417}
                  decoding="async"
                  fetchPriority="high"
                />
              </div>
            </div>
          </div>
        </section>

        <section className={styles.introBand}>
          <div className={styles.sectionInner}>
            <h2 className={styles.introTitle}>{INTRO_BAND.h2}</h2>
            <p className={styles.introBody}>{INTRO_BAND.body}</p>
          </div>
        </section>

        <section className={styles.benefitsBand}>
          <div className={styles.sectionInner}>
            <h2 className={styles.benefitsTitle}>{BENEFITS.h2}</h2>
            <div className={styles.benefitsGrid}>
              {BENEFITS.items.map((item) => (
                <article key={item.title} className={styles.benefitCard}>
                  <img
                    src={BENEFIT_ART[item.slot]}
                    alt=""
                    width={300}
                    height={300}
                    decoding="async"
                    className={styles.benefitArt}
                    data-illustration-slot={item.slot}
                  />
                  <h3 className={styles.benefitHeading}>{item.title}</h3>
                  <p className={styles.benefitBody}>{item.body}</p>
                  <a href={BOOKING_HREF} className={styles.benefitLink}>
                    {item.cta} →
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.painBand}>
          <div className={styles.sectionInner}>
            <h2 className={styles.painTitle}>{PAIN_POINTS.h2}</h2>
            <p className={styles.painIntro}>{PAIN_POINTS.intro}</p>
            <div className={styles.painGrid}>
              {PAIN_POINTS.items.map((item) => (
                <article key={item.quote} className={styles.painCard}>
                  <p className={styles.painQuote}>{item.quote}</p>
                  <p className={styles.painAnswer}>{item.answer}</p>
                </article>
              ))}
            </div>
            <div className={styles.painCtaWrap}>
              <a href={BOOKING_HREF} className={styles.painCta}>
                {PAIN_POINTS.band}
              </a>
            </div>
          </div>
        </section>

        <section className={styles.liveBlock}>
          <div className={styles.sectionInner}>
            <h2 className="playful-h2 text-center mb-10">{SOCIAL_PROOF.h2}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8">
              {caseCards.map((caseStudy) => (
                <CaseStudyCard key={caseStudy.slug} caseStudy={caseStudy} />
              ))}
            </div>
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden w-full flex flex-col justify-center items-center text-center p-6 md:p-10">
              <div className="w-20 h-20 relative mb-4">
                <Image
                  src="/images/avatar-playful.svg"
                  alt="Avatar Playful"
                  fill
                  className="object-contain"
                />
              </div>
              <h4 className="font-semibold text-lg mb-2 text-[#4A4453]">{SOCIAL_PROOF.attribution}</h4>
              <div className="flex justify-center mb-4">
                <div className="text-yellow-400 text-xl">
                  {Array.from({ length: 5 }).map((_, star) => (
                    <span key={star}>★</span>
                  ))}
                </div>
              </div>
              <p className="text-sm md:text-base px-2 text-[#4A4453]">«{SOCIAL_PROOF.quote}»</p>
            </div>
          </div>
        </section>

        <section className={styles.faqBand}>
          <div className={styles.sectionInner}>
            <h2 className={styles.faqTitle}>{FAQ.h2}</h2>
            <div className="max-w-4xl mx-auto">
              <PasarelaFaqAccordion
                items={FAQ.items.map((item) => ({
                  question: item.question,
                  answer: <LinkedCopy text={item.answer} />,
                }))}
              />
            </div>
          </div>
        </section>

        <section className={styles.liveBlock}>
          <div className={styles.sectionInner}>
            <TestimonialsSection />
          </div>
        </section>

        <section className={styles.liveBlock}>
          <div className={styles.sectionInner}>
            <BlogRelatedPostsSection posts={blogPosts} />
          </div>
        </section>

        <section className={styles.bannerBand}>
          <div className="px-4 md:px-6">
            <div className={styles.bannerGrid}>
              <div className={styles.bannerLeft}>
                <h2 className={styles.bannerTitle}>{CTA.h2}</h2>
                <p className={styles.bannerBody}>{CTA.body}</p>
                <img
                  src="/images/pasarela-de-pagos-venezuela/cta-banner-left@2x.png"
                  alt=""
                  width={520}
                  height={420}
                  decoding="async"
                  className={styles.bannerIllustration}
                />
              </div>
              <div className={styles.bannerRight}>
                <h3 className={styles.bannerRightTitle}>¡Contáctanos y empieza ya!</h3>
                <p className={styles.bannerRightBody}>{CTA.question}</p>
                <a href={BOOKING_HREF} className={styles.ctaButton}>
                  {CTA.cta}
                </a>
                <Link href={CONTACT_HREF} className={styles.bannerContactLink}>
                  O escríbenos por el formulario
                </Link>
              </div>
            </div>
          </div>
        </section>
      </article>
    </>
  );
}
