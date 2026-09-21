import Image from 'next/image';
import { FIGMA } from '@/utils/soytechno-figma-copy';
import SoyTechnoMobile from '@/components/soytechno/SoyTechnoMobile';
import SoyTechnoGroupedArt from '@/components/soytechno/SoyTechnoGroupedArt';
import SoyTechnoChrome from '@/components/soytechno/SoyTechnoChrome';
import {
  DesafioArt,
  DesktopPhonesRow,
  HeroCollage,
  IPadPortrait,
} from '@/components/soytechno/SoyTechnoNativeArt';

const A = '/images/casos/soytechno';

function img(file: string) {
  return `${A}/${file}`;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-paytone-lock text-[47px] leading-[1.2] text-[#4A4453] text-center max-w-[920px] mx-auto scroll-mt-[168px]">
      {children}
    </h2>
  );
}

function Lead({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-sans text-[18px] leading-[1.5] text-[#4A4453] text-center max-w-[820px] mx-auto mt-8">
      {children}
    </p>
  );
}

function ChapterBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full rounded-[36px] bg-[#EADDFF] px-10 py-10 text-center scroll-mt-[168px]">
      <h2 className="font-paytone-lock text-[32px] leading-[1.2] text-[#4A4453]">{children}</h2>
    </div>
  );
}

function Feature({
  title,
  body,
  bullets,
}: {
  title: string;
  body: string;
  bullets?: readonly string[];
}) {
  return (
    <div className="space-y-3">
      <h3 className="font-paytone-lock text-[20px] leading-[1.25] text-[#4A4453]">{title}</h3>
      <p className="font-sans text-[18px] leading-[1.5] text-[#4A4453]">{body}</p>
      {bullets && (
        <ul className="list-disc pl-5 space-y-2 font-sans text-[18px] leading-[1.5] text-[#4A4453]">
          {bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function BrandMarks({ third }: { third: 'circuit' | 'people' }) {
  return (
    <div className="flex items-center justify-center gap-10 mt-10 mb-8">
      <img src={img('lifestyle-i.png')} alt="100% originales" className="w-24 h-24 object-contain" />
      <img src={img('lifestyle-1.png')} alt="" className="w-24 h-24 object-contain" />
      {third === 'circuit' ? (
        <div className="w-24 h-24 rounded-full bg-[#0063FC] overflow-hidden p-3">
          <img src={img('lifestyle-f-alt.png')} alt="SoyTechno" className="w-full h-full object-contain" />
        </div>
      ) : (
        <img
          src={img('lifestyle-f.jpg')}
          alt="SoyTechno"
          className="w-24 h-24 rounded-full object-cover object-[60%_30%]"
        />
      )}
    </div>
  );
}

export default function SoyTechnoFigmaBody() {
  return (
    <div className="bg-[#FEF7FF] text-[#4A4453] overflow-x-hidden">
      <SoyTechnoChrome />
      <div className="max-w-[1200px] mx-auto px-5 lg:px-0 pt-10">
        <nav aria-label="Breadcrumb" className="font-sans text-[14px] text-[#4A4453]/70 mb-10">
          <a href="/" className="hover:underline">
            {FIGMA.breadcrumb[0]}
          </a>
          <span className="mx-2">/</span>
          <a href="/casos-de-exito-agencia-de-marketing-digital" className="hover:underline">
            {FIGMA.breadcrumb[1]}
          </a>
        </nav>
      </div>

      <div className="lg:hidden">
        <SoyTechnoMobile />
      </div>

      <div className="hidden lg:block">
        {/* 1. Hero — HTML copy + native collage (not a flattened PNG) */}
        <section className="relative bg-[#440099] py-10 px-6 lg:px-[120px]">
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.4) 1.2px, transparent 1.6px), url(${img('background-texture.png')})`,
              backgroundSize: '22px 22px, cover',
            }}
          />
          <div
            id="soytechno-hero"
            className="relative mx-auto max-w-[1200px] rounded-[36px] bg-[#EADDFF] px-12 py-14 scroll-mt-[168px]"
          >
            <div className="grid grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="font-paytone-lock text-[47px] leading-[1.15] tracking-[-0.02em] text-[#4A4453] mb-10">
                  {FIGMA.heroTitle}
                </h1>
                <p className="font-sans text-[18px] leading-[1.5] mb-6">{FIGMA.heroP1}</p>
                <p className="font-sans text-[18px] leading-[1.5]">{FIGMA.heroP2}</p>
              </div>
              <HeroCollage />
            </div>
          </div>
        </section>

        {/* 2. Desafío — HTML text card + native 2×2 visual */}
        <section className="max-w-[1200px] mx-auto px-5 lg:px-0 pt-[120px] scroll-mt-[168px]">
          <SectionTitle>{FIGMA.desafioTitle}</SectionTitle>
          <Lead>{FIGMA.desafioLead}</Lead>
          <BrandMarks third="circuit" />
          <div
            id="soytechno-desafio"
            className="relative bg-[#EADDFF] rounded-[36px] overflow-hidden scroll-mt-[168px]"
          >
            <DesafioArt />
            <div className="absolute left-[4%] top-[2.5%] w-[48%] h-[54%] bg-white rounded-[28px] px-8 py-8">
              <div className="space-y-6">
                {FIGMA.desafioItems.map((item) => (
                  <Feature key={item.title} title={item.title} body={item.body} />
                ))}
              </div>
            </div>
          </div>
          <div className="pt-8 scroll-mt-[168px]">
            <SectionTitle>{FIGMA.checkoutTitle}</SectionTitle>
            <Lead>{FIGMA.checkoutLead}</Lead>
            <BrandMarks third="people" />
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-5 lg:px-0 pt-[100px] scroll-mt-[168px]">
          <SectionTitle>{FIGMA.uxTitle}</SectionTitle>
          <Lead>{FIGMA.uxLead}</Lead>
        </section>

        {/* A — single device image + HTML */}
        <section className="max-w-[1200px] mx-auto px-5 lg:px-0 pt-[100px] scroll-mt-[168px]">
          <ChapterBar>{FIGMA.archPill}</ChapterBar>
          <div id="soytechno-section-a" className="mt-16 grid grid-cols-2 gap-10 items-start">
            <img
              src={img('giffycanvas-01.gif')}
              alt="Ficha de producto"
              width="100%"
              height="auto"
              className="w-full h-auto object-contain"
            />
            <div className="space-y-10">
              {FIGMA.archItems.map((item) => (
                <Feature key={item.title} title={item.title} body={item.body} />
              ))}
            </div>
          </div>
        </section>

        {/* B — HTML grid 350 / 350 / 1fr, not a raster collage */}
        <section className="max-w-[1196px] mx-auto px-5 lg:px-0 pt-[120px] scroll-mt-[168px]">
          <ChapterBar>{FIGMA.visualPill}</ChapterBar>
          <div
            id="soytechno-section-b"
            className="mt-16 w-full max-w-[1196px] mx-auto rounded-[20px] bg-[#EADDFF] p-10"
          >
            <div className="grid gap-9 [grid-template-columns:minmax(0,350px)_minmax(0,350px)_minmax(0,1fr)]">
              <div className="flex flex-col gap-9">
                {FIGMA.swatches.map((swatch) => (
                  <div
                    key={swatch.name}
                    className="relative rounded-[20px] overflow-hidden p-9 min-h-[280px]"
                    style={{ backgroundColor: swatch.card, color: swatch.ink }}
                  >
                    <p className="font-sans font-bold text-[18px] leading-[1.25]">{swatch.name}</p>
                    <p className="font-sans font-bold text-[18px] leading-[1.35] whitespace-pre-line mt-2">
                      {swatch.meta}
                    </p>
                    <img
                      src={img(swatch.icon)}
                      alt=""
                      className="w-[120px] h-[120px] object-contain mt-6"
                    />
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-9">
                <img
                  src={img('section-b-phone.png')}
                  alt="LG SoyTechno / Zona LG"
                  width={340}
                  height={644}
                  className="w-[340px] max-w-full h-auto object-contain"
                />
                <div className="relative rounded-[20px] overflow-hidden bg-[#0063FC] min-h-[200px]">
                  <img
                    src={img('circuito.png')}
                    alt="Circuito"
                    className="absolute inset-0 w-full h-full object-cover opacity-40 invert"
                  />
                  <span className="relative z-10 block font-paytone-lock text-white text-[18px] p-6">
                    Circuito
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-8 min-w-0">
                <div className="relative rounded-[20px] overflow-hidden bg-[#003896] min-h-[160px] flex items-center justify-center px-8">
                  <img
                    src={img('circuito.png')}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-35 invert"
                  />
                  <Image
                    src={img('soytechno-logo-white.png')}
                    alt="SoyTechno"
                    width={260}
                    height={46}
                    className="relative z-10 object-contain w-[82%] h-auto"
                  />
                </div>
                {FIGMA.visualItems.map((item) => (
                  <Feature key={item.title} title={item.title} body={item.body} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* C — single device image + HTML */}
        <section className="max-w-[1200px] mx-auto px-5 lg:px-0 pt-[120px] scroll-mt-[168px]">
          <ChapterBar>{FIGMA.emptyPill}</ChapterBar>
          <div id="soytechno-section-c" className="mt-16 grid grid-cols-2 gap-10 items-start">
            <img
              src={img('section-c-ipad.png')}
              alt="Pantallas de categoría y estados de sistema"
              width="100%"
              height="auto"
              className="w-full h-auto object-contain"
            />
            <div className="space-y-12">
              {FIGMA.emptyItems.map((item) => (
                <Feature key={item.title} title={item.title} body={item.body} />
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-5 lg:px-0 pt-[120px] scroll-mt-[168px]">
          <hr className="border-0 border-t border-[#D0C4DE] mb-[120px]" />
          <SectionTitle>{FIGMA.checkoutTitle}</SectionTitle>
          <Lead>{FIGMA.checkoutLead}</Lead>
        </section>

        <section className="max-w-[1200px] mx-auto px-5 lg:px-0 pt-[100px] scroll-mt-[168px]">
          <ChapterBar>{FIGMA.casheaPill}</ChapterBar>
          <div id="soytechno-cashea" className="mt-16 grid grid-cols-2 gap-10 items-start">
            <div>
              <h3 className="font-paytone-lock text-[36px] leading-[1.2] text-[#4A4453] mb-8">{FIGMA.casheaTitle}</h3>
              <p className="font-sans text-[18px] leading-[1.5] mb-10">{FIGMA.casheaLead}</p>
              <div className="space-y-10">
                {FIGMA.casheaItems.map((item) => (
                  <Feature key={item.title} title={item.title} body={item.body} />
                ))}
              </div>
            </div>
            <img
              src={img('giffycanvas-02.gif')}
              alt="Integración Cashea"
              width="100%"
              height="auto"
              className="w-full h-auto object-contain"
            />
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-5 lg:px-0 pt-[120px] scroll-mt-[168px]">
          <ChapterBar>{FIGMA.wizardPill}</ChapterBar>
          <div id="soytechno-wizard" className="mt-16 grid grid-cols-2 gap-10 items-start">
            <IPadPortrait screen="ipad-mockup-01.png" alt="Checkout wizard" />
            <div>
              <p className="font-sans text-[18px] leading-[1.5] mb-10">{FIGMA.wizardLead}</p>
              <div className="space-y-10">
                {FIGMA.wizardItems.map((item) => (
                  <Feature key={item.title} title={item.title} body={item.body} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Logística — HTML copy + one grouped banner/iMac image */}
        <section className="max-w-[1200px] mx-auto px-5 lg:px-0 pt-[120px] scroll-mt-[168px]">
          <ChapterBar>{FIGMA.logisticsPill}</ChapterBar>
          <div id="soytechno-logistics" className="mt-16 grid grid-cols-2 gap-12 items-start">
            <div>
              <p className="font-sans text-[18px] leading-[1.5] mb-10">{FIGMA.logisticsLead}</p>
              <div className="space-y-10">
                {FIGMA.logisticsItems.map((item) => (
                  <Feature
                    key={item.title}
                    title={item.title}
                    body={item.body}
                    bullets={'bullets' in item ? item.bullets : undefined}
                  />
                ))}
              </div>
            </div>
            <SoyTechnoGroupedArt slot="logistica" alt="Sistema logístico SoyTechno" />
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-5 lg:px-0 pt-[140px] scroll-mt-[168px]">
          <SectionTitle>{FIGMA.resultsTitle}</SectionTitle>
          <Lead>{FIGMA.resultsLead}</Lead>
          <div id="soytechno-results" className="mt-16 grid grid-cols-3 gap-6">
            {FIGMA.resultCards.map((card) => (
              <div key={card.title} className="bg-[#EADDFF] rounded-[36px] p-10">
                <h3 className="font-paytone-lock text-[20px] leading-[1.3] text-[#4A4453] mb-5">{card.title}</h3>
                <p className="font-sans text-[18px] leading-[1.5] text-[#4A4453]">{card.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Phones — native 1170 screens in IPhoneFrame, peek first */}
        <section
          id="soytechno-phones"
          className="max-w-[1200px] mx-auto px-5 lg:px-0 pt-[120px] scroll-mt-[168px]"
        >
          <DesktopPhonesRow />
        </section>

        <section className="max-w-[1200px] mx-auto px-5 lg:px-0 pt-[120px] scroll-mt-[168px]">
          <div
            id="soytechno-testimonial"
            className="bg-[#FFDAD6] rounded-[36px] overflow-hidden px-[80px] py-[80px] grid grid-cols-[220px_1fr] gap-12 items-center"
          >
            <div className="text-center">
              <img
                src={img('testimonial-avatar.png')}
                alt={FIGMA.testimonialName}
                className="w-[160px] h-[160px] rounded-full object-cover mx-auto mb-8"
              />
              <p className="font-paytone-lock text-[32px] text-[#2A0064]">{FIGMA.testimonialName}</p>
              <p className="font-sans text-[18px] text-[#2A0064]/80 mt-2">{FIGMA.testimonialRole}</p>
            </div>
            <p className="font-sans italic text-[24px] leading-[1.5] text-[#2A0064] text-center">
              “{FIGMA.testimonialQuote}”
            </p>
          </div>
        </section>

        <section className="max-w-[1200px] mx-auto px-5 lg:px-0 pt-[100px] pb-[120px] scroll-mt-[168px]">
          <div
            id="soytechno-cta"
            className="bg-[#B3FFF3] rounded-[36px] overflow-hidden grid grid-cols-2 gap-10 items-center px-12 py-16 min-h-[650px]"
          >
            <img
              src={img('cta-illustration.png')}
              alt=""
              width="100%"
              height="auto"
              className="w-full h-auto object-contain"
            />
            <div>
              <h2 className="font-paytone-lock text-[47px] leading-[1.15] tracking-[-0.03em] text-[#453A53] mb-8">
                <span className="block">¿Tu E-commerce está listo</span>
                <span className="block whitespace-nowrap">para el nivel de un Web App?</span>
              </h2>
              <p className="font-sans text-[18px] leading-[1.5] text-[#453A53] mb-10">{FIGMA.ctaBody}</p>
              <a
                href={FIGMA.ctaHref}
                className="inline-block bg-[#440099] text-white font-sans font-semibold py-3 px-8 rounded-full no-underline"
              >
                {FIGMA.ctaButton}
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
