import type { Metadata } from 'next';
import Link from 'next/link';
import { canonicalForPath } from '@/utils/canonical';
import TestimonialsSection from '@/components/TestimonialsSectionClient';
import BlogRelatedPostsSection from '@/components/sections/BlogRelatedPostsSection';
import { getLatestBlogPosts } from '@/services/wordpress';
import ServiceFaqAccordion from '../agencia-shopify/ServiceFaqAccordion';
import {
  CHOOSE,
  CLOSING,
  CTA_LABEL,
  EXTRAS,
  FAQ,
  FEES,
  HERO,
  HERO_SLOT,
  LAUNCH,
  PLANS,
  PLUS,
  PRECIOS_META,
  SERVICE_BOOKING_HREF,
  buildShopifyPreciosJsonLd,
  isExternalHref,
  splitBold,
  splitMarkdownLinks,
  toInternalHref,
} from './copy';

const PAGE_URL = canonicalForPath(PRECIOS_META.path);

export const metadata: Metadata = {
  title: PRECIOS_META.title,
  description: PRECIOS_META.description,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: PRECIOS_META.title,
    description: PRECIOS_META.description,
    url: PAGE_URL,
  },
};

function LinkedCopy({ text }: { text: string }) {
  return (
    <>
      {splitMarkdownLinks(text).map((part, index) => {
        if (part.type !== 'link' || !part.href) {
          return <span key={`${part.value}-${index}`}>{part.value}</span>;
        }

        const href = toInternalHref(part.href);
        if (isExternalHref(href)) {
          return (
            <a
              key={`${href}-${index}`}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#440099] font-semibold underline underline-offset-2"
            >
              {part.value}
            </a>
          );
        }

        return (
          <Link
            key={`${href}-${index}`}
            href={href}
            className="text-[#440099] font-semibold underline underline-offset-2"
          >
            {part.value}
          </Link>
        );
      })}
    </>
  );
}

function BoldCopy({ text }: { text: string }) {
  return (
    <>
      {splitBold(text).map((part, index) =>
        part.type === 'strong' ? (
          <strong key={`${part.value}-${index}`} className="font-bold">
            {part.value}
          </strong>
        ) : (
          <span key={`${part.value}-${index}`}>{part.value}</span>
        ),
      )}
    </>
  );
}

function TalkCta() {
  return (
    <a href={SERVICE_BOOKING_HREF} className="playful-boton !text-[14px] !leading-[18px] md:!text-base md:!leading-normal">
      {CTA_LABEL}
    </a>
  );
}

function HeroIllustrationSlot() {
  return (
    <div
      data-illustration-slot={HERO_SLOT.id}
      data-illustration-src-1x={HERO_SLOT.src1x}
      data-illustration-src-2x={HERO_SLOT.src2x}
      aria-hidden="true"
      className="relative w-full overflow-hidden rounded-[32px] border border-dashed border-[#C4B5D4] bg-[#FEF7FF]"
      style={{ aspectRatio: `${HERO_SLOT.width} / ${HERO_SLOT.height}` }}
    />
  );
}

function PriceTable({
  caption,
  headers,
  rows,
}: {
  caption: string;
  headers: readonly string[];
  rows: readonly (readonly string[])[];
}) {
  return (
    <div className="w-full overflow-x-auto rounded-[24px] bg-white shadow-md">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="bg-[#440099]">
            {headers.map((header) => (
              <th
                key={header}
                scope="col"
                className="px-4 py-3 [font-family:var(--font-dm-sans),sans-serif] text-sm font-semibold !text-white md:px-5 md:text-base"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join('|')} className="odd:bg-[#FEF7FF] even:bg-white">
              {row.map((cell, index) => (
                <td
                  key={`${row[0]}-${headers[index]}`}
                  className="px-4 py-3 [font-family:var(--font-dm-sans),sans-serif] text-sm text-[#4A4453] md:px-5 md:text-base"
                >
                  {index === 0 ? <strong className="font-semibold">{cell}</strong> : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function ShopifyPreciosPage() {
  const jsonLd = buildShopifyPreciosJsonLd(PAGE_URL);
  const blogPosts = await getLatestBlogPosts(6).catch(() => []);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="w-full pb-20">
        <section className="relative overflow-hidden">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 pt-4 pb-16 md:pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h1 className="playful-h1 text-[36px] leading-[42px] md:text-[45px] md:leading-[52px] lg:text-[56px] lg:leading-[1.1]">
                  {HERO.h1}
                </h1>
                {HERO.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="playful-contenido-p">
                    <LinkedCopy text={paragraph} />
                  </p>
                ))}
                <TalkCta />
              </div>
              <HeroIllustrationSlot />
            </div>
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="playful-contenedor playful-contenedor-FFEFD1 rounded-[32px] md:rounded-[48px] !text-left">
            <h2 className="playful-h2 text-center">{PLANS.h2}</h2>
            <p className="playful-contenido-p">{PLANS.intro}</p>
            <PriceTable caption={PLANS.tableCaption} headers={PLANS.headers} rows={PLANS.rows} />
            {PLANS.after.map((paragraph) => (
              <p key={paragraph} className="playful-contenido-p">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="space-y-6">
            <h2 className="playful-h2 text-center">{FEES.h2}</h2>
            <p className="playful-contenido-p">{FEES.intro}</p>
            <p className="playful-contenido-p">{FEES.payments}</p>
            <PriceTable caption={FEES.tableCaption} headers={FEES.headers} rows={FEES.rows} />
            {FEES.after.map((paragraph) => (
              <p key={paragraph} className="playful-contenido-p">
                <LinkedCopy text={paragraph} />
              </p>
            ))}
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="playful-contenedor playful-contenedor-B3FFF3 rounded-[32px] md:rounded-[48px] !mt-0 !text-left">
            <h2 className="playful-h2 text-center">{EXTRAS.h2}</h2>
            {EXTRAS.paragraphs.map((paragraph) => (
              <p key={paragraph} className="playful-contenido-p">
                {paragraph}
              </p>
            ))}
            <ul className="space-y-4 text-left">
              {EXTRAS.items.map((item) => (
                <li key={item} className="playful-contenido-p list-disc ml-5">
                  <BoldCopy text={item} />
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="relative overflow-hidden rounded-[32px] bg-[#440099] p-8 md:p-[60px]">
            <div className="pointer-events-none absolute inset-0 bg-[url('/images/background.webp')] bg-cover bg-center bg-no-repeat opacity-40" />
            <div className="relative z-10 max-w-4xl space-y-6">
              <h2 className="[font-family:var(--font-paytone-one),var(--font-montserrat),sans-serif] text-[36px] leading-[1.1] md:text-[45px] font-normal !text-white">
                {PLUS.h2}
              </h2>
              <p className="[font-family:var(--font-dm-sans),sans-serif] text-base leading-normal font-normal !text-[#E9D7FF]">
                {PLUS.intro}
              </p>
              <p className="[font-family:var(--font-dm-sans),sans-serif] text-base leading-normal font-normal !text-[#E9D7FF]">
                {PLUS.lead}
              </p>
              <ul className="space-y-3">
                {PLUS.items.map((item) => (
                  <li
                    key={item}
                    className="[font-family:var(--font-dm-sans),sans-serif] text-base leading-normal font-normal !text-[#E9D7FF] list-disc ml-5"
                  >
                    {item}
                  </li>
                ))}
              </ul>
              <p className="[font-family:var(--font-dm-sans),sans-serif] text-base leading-normal font-normal !text-[#E9D7FF]">
                {PLUS.close}
              </p>
            </div>
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="space-y-6">
            <h2 className="playful-h2 text-center">{LAUNCH.h2}</h2>
            {LAUNCH.paragraphs.map((paragraph) => (
              <p key={paragraph} className="playful-contenido-p">
                {paragraph}
              </p>
            ))}
            <ul className="space-y-3">
              {LAUNCH.readyItems.map((item) => (
                <li key={item} className="playful-contenido-p list-disc ml-5">
                  {item}
                </li>
              ))}
            </ul>
            {LAUNCH.after.map((paragraph) => (
              <p key={paragraph} className="playful-contenido-p">
                <LinkedCopy text={paragraph} />
              </p>
            ))}
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="playful-contenedor playful-contenedor-FFEFD1 rounded-[32px] md:rounded-[48px] !text-left">
            <h2 className="playful-h2 text-center">{CHOOSE.h2}</h2>
            {CHOOSE.intro.map((paragraph) => (
              <p key={paragraph} className="playful-contenido-p">
                {paragraph}
              </p>
            ))}
            {CHOOSE.profiles.map((profile) => (
              <div key={profile.h3} className="space-y-4">
                <h3 className="playful-h3">{profile.h3}</h3>
                {(Array.isArray(profile.body) ? profile.body : [profile.body]).map((paragraph) => (
                  <p key={paragraph} className="playful-contenido-p">
                    <LinkedCopy text={paragraph} />
                  </p>
                ))}
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
          <h2 className="playful-h2 text-center mb-10">{FAQ.h2}</h2>
          <div className="max-w-4xl mx-auto">
            <ServiceFaqAccordion
              items={FAQ.items.map((item) => ({
                question: item.question,
                answer: item.answer,
              }))}
            />
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6">
            <TestimonialsSection />
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6">
            <BlogRelatedPostsSection posts={blogPosts} />
          </div>
        </section>

        <section className="py-12">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6">
            <div className="w-full mb-[40px]">
              <div className="lg:flex lg:items-center lg:gap-8 xl:gap-12">
                <div className="lg:w-1/2 mb-12 lg:mb-0">
                  <div className="relative rounded-2xl overflow-hidden">
                    <img
                      src="/images/imagen-nueva-cta-home.png"
                      alt=""
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </div>
                <div className="lg:w-1/2 h-full min-h-[500px] rounded-2xl relative overflow-hidden">
                  <div
                    className="absolute inset-0 w-full h-full"
                    style={{
                      backgroundColor: '#B3FFF3',
                      backgroundImage: 'url(/images/background.webp)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                    }}
                  />
                  <div className="absolute inset-0" style={{ backgroundColor: '#B3FFF340' }} />
                  <div className="relative z-10 h-full flex flex-col items-center justify-center p-5 lg:p-12">
                    <h2 className="text-3xl md:text-4xl text-center font-normal mb-6 leading-tight text-[#453A53]">
                      {CLOSING.h2}
                    </h2>
                    <p className="text-lg text-[#453A53] text-center mb-8">{CLOSING.body}</p>
                    <div className="w-full flex justify-center px-5 py-5 md:p-0">
                      <a
                        href={SERVICE_BOOKING_HREF}
                        className="mt-0 md:mt-8 bg-[#440099] text-white hover:bg-[#5B21B6] font-semibold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 no-underline text-center !text-[14px] !leading-[18px] md:!text-base md:!leading-normal"
                      >
                        {CTA_LABEL}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </article>
    </>
  );
}
