import type { ReactNode } from 'react';
import Link from 'next/link';
import ServiceFaqAccordion from '@/app/agencia-shopify/ServiceFaqAccordion';
import { SERVICE_BOOKING_HREF } from '@/utils/booking';
import {
  isExternalHref,
  splitMarkdown,
  toInternalHref,
  type AgencyLandingCopy,
  type AgencySection,
} from '@/lib/agency-copy-landing';

function LinkedMarkdown({
  text,
  linkClassName = 'text-[#440099] font-semibold underline underline-offset-2',
}: {
  text: string;
  linkClassName?: string;
}) {
  return (
    <>
      {splitMarkdown(text).map((part, index) => {
        if (part.type === 'link') {
          const href = toInternalHref(part.href);
          if (isExternalHref(href)) {
            return (
              <a
                key={`${href}-${index}`}
                href={href}
                className={linkClassName}
                target="_blank"
                rel="noopener noreferrer"
              >
                {part.value}
              </a>
            );
          }
          return (
            <Link key={`${href}-${index}`} href={href} className={linkClassName}>
              {part.value}
            </Link>
          );
        }
        if (part.type === 'strong') {
          return (
            <strong key={`${part.value}-${index}`} className="font-bold">
              {part.value}
            </strong>
          );
        }
        if (part.type === 'code') {
          return (
            <code key={`${part.value}-${index}`} className="font-mono text-[0.95em]">
              {part.value}
            </code>
          );
        }
        return <span key={`${part.value}-${index}`}>{part.value}</span>;
      })}
    </>
  );
}

function TalkCta({ label }: { label: string }) {
  return (
    <a
      href={SERVICE_BOOKING_HREF}
      className="playful-boton !text-[14px] !leading-[18px] md:!text-base md:!leading-normal"
    >
      {label}
    </a>
  );
}

function SectionShell({
  section,
  children,
}: {
  section: AgencySection;
  children: ReactNode;
}) {
  if (section.variant === 'purple') {
    return (
      <div className="relative overflow-hidden rounded-[32px] bg-[#440099] p-8 md:p-[60px]">
        <div className="pointer-events-none absolute inset-0 bg-[url('/images/background.webp')] bg-cover bg-center bg-no-repeat opacity-40" />
        <div className="relative z-10 max-w-4xl space-y-4">{children}</div>
      </div>
    );
  }

  if (section.variant === 'cream') {
    return (
      <div className="playful-contenedor playful-contenedor-FFEFD1 rounded-[32px] md:rounded-[48px] !text-left">
        {children}
      </div>
    );
  }

  if (section.variant === 'mint') {
    return (
      <div className="playful-contenedor playful-contenedor-B3FFF3 rounded-[32px] md:rounded-[48px] !mt-0 !text-left">
        {children}
      </div>
    );
  }

  return <div className="max-w-4xl space-y-4">{children}</div>;
}

function SectionHeading({ title, purple }: { title: string; purple: boolean }) {
  if (purple) {
    return (
      <h2 className="mb-6 [font-family:var(--font-paytone-one),var(--font-montserrat),sans-serif] text-[36px] leading-[1.1] md:text-[45px] font-normal !text-white">
        {title}
      </h2>
    );
  }
  return <h2 className="playful-h2">{title}</h2>;
}

export default function AgencyCopyLanding({
  copy,
  jsonLd,
}: {
  copy: AgencyLandingCopy;
  jsonLd: object;
}) {
  const purpleLink = '!text-[#E9D7FF] font-semibold underline underline-offset-2';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article data-copy-root="true" className="w-full pb-20">
        <section className="relative overflow-hidden">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 pt-4 pb-16 md:pb-20">
            <div className="max-w-3xl space-y-6">
              <h1 className="playful-h1 text-[36px] leading-[42px] md:text-[45px] md:leading-[52px] lg:text-[56px] lg:leading-[1.1]">
                {copy.hero.h1}
              </h1>
              {copy.hero.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)} className="playful-contenido-p">
                  <LinkedMarkdown text={paragraph} />
                </p>
              ))}
              <TalkCta label={copy.ctaLabel} />
            </div>
          </div>
        </section>

        {copy.sections.map((section) => {
          const purple = section.variant === 'purple';
          return (
            <section
              key={section.h2}
              className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12"
            >
              <SectionShell section={section}>
                <SectionHeading title={section.h2} purple={purple} />
                {section.blocks.map((block) => {
                  if (block.type === 'quote') {
                    return (
                      <blockquote
                        key={block.quote.slice(0, 32)}
                        className="bg-white rounded-3xl shadow-lg w-full text-left p-6 md:p-10"
                      >
                        <p
                          className={
                            purple
                              ? '[font-family:var(--font-dm-sans),sans-serif] text-base leading-normal font-normal !text-[#E9D7FF]'
                              : 'playful-contenido-p'
                          }
                        >
                          {block.quote}
                        </p>
                        <footer
                          className={
                            purple
                              ? 'mt-4 [font-family:var(--font-dm-sans),sans-serif] text-base leading-normal font-normal !text-[#E9D7FF]'
                              : 'mt-4 playful-contenido-p'
                          }
                        >
                          {block.attribution}
                        </footer>
                      </blockquote>
                    );
                  }

                  const unchecked = block.text.startsWith('[NO COMPROBADO');
                  return (
                    <p
                      key={block.text.slice(0, 48)}
                      className={
                        purple
                          ? '[font-family:var(--font-dm-sans),sans-serif] text-base leading-normal font-normal !text-[#E9D7FF]'
                          : unchecked
                            ? 'playful-contenido-p rounded-2xl border border-[#C4B5D4] bg-white/70 px-4 py-3'
                            : 'playful-contenido-p'
                      }
                    >
                      <LinkedMarkdown text={block.text} linkClassName={purple ? purpleLink : undefined} />
                    </p>
                  );
                })}
              </SectionShell>
            </section>
          );
        })}

        <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="playful-contenedor playful-contenedor-FFEFD1 rounded-[32px] md:rounded-[48px] !text-left">
            <h2 className="playful-h2">{copy.process.h2}</h2>
            <ol className="space-y-6 max-w-4xl mt-6">
              {copy.process.steps.map((step, index) => (
                <li key={step.lead} className="playful-contenido-p">
                  <strong className="font-bold">
                    {index + 1}. {step.lead}
                  </strong>{' '}
                  {step.body}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 md:py-12">
          <h2 className="playful-h2 text-center mb-10">{copy.faq.h2}</h2>
          <div className="max-w-4xl mx-auto">
            <ServiceFaqAccordion
              items={copy.faq.items.map((item) => ({
                question: item.question,
                answer: <LinkedMarkdown text={item.answer} />,
              }))}
            />
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
                      {copy.closing.h2}
                    </h2>
                    <p className="text-lg text-[#453A53] text-center mb-8">{copy.closing.body}</p>
                    <div className="w-full flex justify-center px-5 py-5 md:p-0">
                      <TalkCta label={copy.ctaLabel} />
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
