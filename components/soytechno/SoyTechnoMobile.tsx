import Image from 'next/image';
import { FIGMA } from '@/utils/soytechno-figma-copy';
import SoyTechnoGroupedArt from '@/components/soytechno/SoyTechnoGroupedArt';

const A = '/images/casos/soytechno';

function src(file: string) {
  return `${A}/${file}`;
}

function Title({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-paytone-lock text-[28px] leading-[34px] text-[#4A4453] scroll-mt-[88px]">
      {children}
    </h2>
  );
}

function Lead({ children }: { children: React.ReactNode }) {
  return <p className="font-sans text-[16px] leading-[24px] text-[#4A4453] mt-4">{children}</p>;
}

function Chapter({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#EADDFF] rounded-[20px] px-5 py-4 scroll-mt-[88px]">
      <h2 className="font-paytone-lock text-[18px] leading-[22px] text-[#4A4453] text-center">{children}</h2>
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
    <div className="space-y-2">
      <h3 className="font-paytone-lock text-[17px] leading-[22px] text-[#4A4453]">{title}</h3>
      <p className="font-sans text-[16px] leading-[24px] text-[#4A4453]">{body}</p>
      {bullets && (
        <ul className="list-disc pl-5 space-y-2 font-sans text-[16px] leading-[24px] text-[#4A4453]">
          {bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Marks({ third }: { third: 'circuit' | 'people' }) {
  return (
    <div className="flex items-center justify-center gap-5 my-6">
      <img src={src('lifestyle-i.png')} alt="100% originales" className="w-14 h-14 object-contain" />
      <img src={src('lifestyle-1.png')} alt="" className="w-14 h-14 object-contain" />
      {third === 'circuit' ? (
        <div className="w-14 h-14 rounded-full bg-[#0063FC] overflow-hidden p-2">
          <img src={src('lifestyle-f-alt.png')} alt="SoyTechno" className="w-full h-full object-contain" />
        </div>
      ) : (
        <img
          src={src('lifestyle-f.jpg')}
          alt="SoyTechno"
          className="w-14 h-14 rounded-full object-cover object-[60%_30%]"
        />
      )}
    </div>
  );
}

function Phone({ screen, alt }: { screen: string; alt: string }) {
  return (
    <div className="relative w-full aspect-[276/577]">
      <div className="absolute inset-x-[3.6%] top-[1.8%] bottom-[1.8%] overflow-hidden rounded-[18%/9%] bg-black">
        <img src={src(screen)} alt={alt} className="w-full h-full object-cover object-top" />
      </div>
      <img
        src={src('iphone-frame-02.png')}
        alt=""
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
      />
    </div>
  );
}

const PHONES = [
  { file: 'mobile-screen-04.png', alt: 'Selección de moneda SoyTechno' },
  { file: 'mobile-screen-01.png', alt: 'Catálogo móvil SoyTechno' },
  { file: 'mobile-screen-02.png', alt: 'Producto móvil SoyTechno' },
  { file: 'mobile-screen-03.png', alt: 'Checkout móvil SoyTechno' },
] as const;

function MobilePhonesCarousel() {
  return (
    <div className="soytechno-snap-row flex gap-4 overflow-x-auto snap-x snap-mandatory -mx-5 px-5">
      {PHONES.map((phone) => (
        <div key={phone.file} className="snap-center shrink-0 w-[78vw] max-w-[320px]">
          <Phone screen={phone.file} alt={phone.alt} />
        </div>
      ))}
    </div>
  );
}

export default function SoyTechnoMobile() {
  return (
    <div className="pb-[calc(48px+16px+env(safe-area-inset-bottom,0px)+32px)]">
      <section id="soytechno-m-hero" className="relative bg-[#440099] px-5 pt-4 pb-6 scroll-mt-[88px]">
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.4) 1.2px, transparent 1.6px), url(${src('background-texture.png')})`,
            backgroundSize: '22px 22px, cover',
          }}
        />
        <div className="relative bg-[#EADDFF] rounded-[24px] px-5 py-7">
          <h1 className="font-paytone-lock text-[32px] leading-[38px] tracking-[-0.02em] text-[#4A4453]">
            {FIGMA.heroTitle}
          </h1>
          <p className="font-sans text-[16px] leading-[24px] mt-5">{FIGMA.heroP1}</p>
          <p className="font-sans text-[16px] leading-[24px] mt-4">{FIGMA.heroP2}</p>
          <div className="mt-8">
            <SoyTechnoGroupedArt slot="hero" alt="Collage SoyTechno" />
          </div>
        </div>
      </section>

      <div className="px-5">
        <section id="soytechno-m-desafio" className="scroll-mt-[88px] pt-10">
          <Title>{FIGMA.desafioTitle}</Title>
          <Lead>{FIGMA.desafioLead}</Lead>
          <Marks third="circuit" />
          <div className="relative mt-5 bg-[#EADDFF] rounded-[24px] overflow-hidden">
            <SoyTechnoGroupedArt slot="desafio" alt="Composición visual del desafío SoyTechno" />
            <div className="absolute left-[4%] top-[2.5%] w-[48%] h-[54%] bg-white rounded-[24px] px-3 py-3 overflow-hidden">
              <div className="space-y-3">
                {FIGMA.desafioItems.map((item) => (
                  <Feature key={item.title} title={item.title} body={item.body} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="soytechno-m-checkout" className="scroll-mt-[88px] pt-6">
          <Title>{FIGMA.checkoutTitle}</Title>
          <Lead>{FIGMA.checkoutLead}</Lead>
          <Marks third="people" />
        </section>

        <section id="soytechno-m-ux" className="scroll-mt-[88px] pt-8">
          <Title>{FIGMA.uxTitle}</Title>
          <Lead>{FIGMA.uxLead}</Lead>
        </section>

        <section id="soytechno-m-a" className="scroll-mt-[88px] pt-10">
          <Chapter>{FIGMA.archPill}</Chapter>
          <div className="mt-5 grid grid-cols-1 gap-5">
            <img
              src={src('giffycanvas-01.gif')}
              alt="Ficha de producto"
              width="100%"
              height="auto"
              className="w-full h-auto object-contain rounded-[20px]"
            />
            <div className="space-y-6">
              {FIGMA.archItems.map((item) => (
                <Feature key={item.title} title={item.title} body={item.body} />
              ))}
            </div>
          </div>
        </section>

        <section id="soytechno-m-b" className="scroll-mt-[88px] pt-10">
          <Chapter>{FIGMA.visualPill}</Chapter>
          <div className="mt-5 bg-[#EADDFF] rounded-[24px] px-4 pt-5 pb-6">
            <img
              src={src('section-b-phone.png')}
              alt="LG SoyTechno / Zona LG"
              width="100%"
              height="auto"
              className="w-full max-w-[340px] mx-auto h-auto object-contain"
            />
            <div className="mt-5 grid grid-cols-2 gap-3">
              {FIGMA.swatches.map((swatch) => (
                <div
                  key={swatch.name}
                  className="rounded-[16px] p-4 min-h-[150px]"
                  style={{ backgroundColor: swatch.card, color: swatch.ink }}
                >
                  <p className="font-paytone-lock text-[13px] leading-[1.2]">{swatch.name}</p>
                  <p className="font-sans text-[11px] leading-[1.35] whitespace-pre-line mt-1">{swatch.meta}</p>
                  <img src={src(swatch.icon)} alt="" className="w-[72px] h-[72px] object-contain mt-3" />
                </div>
              ))}
            </div>
            <div className="relative mt-3 rounded-[16px] overflow-hidden bg-[#0063FC] min-h-[120px]">
              <img
                src={src('circuito.png')}
                alt="Circuito"
                className="absolute inset-0 w-full h-full object-cover opacity-40 invert"
              />
              <span className="relative z-10 block font-paytone-lock text-white text-[14px] p-4">Circuito</span>
            </div>
            <div className="relative mt-3 rounded-[16px] overflow-hidden bg-[#003896] h-16 flex items-center justify-center px-6">
              <img
                src={src('circuito.png')}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-35 invert"
              />
              <Image
                src={src('soytechno-logo-white.png')}
                alt="SoyTechno"
                width={180}
                height={32}
                className="relative z-10 object-contain w-[70%] h-auto"
              />
            </div>
            <div className="mt-5 space-y-5">
              {FIGMA.visualItems.map((item) => (
                <Feature key={item.title} title={item.title} body={item.body} />
              ))}
            </div>
          </div>
        </section>

        <section id="soytechno-m-c" className="scroll-mt-[88px] pt-10">
          <Chapter>{FIGMA.emptyPill}</Chapter>
          <div className="mt-5 grid grid-cols-1 gap-5">
            <img
              src={src('section-c-ipad.png')}
              alt="Pantallas de categoría y estados de sistema"
              width="100%"
              height="auto"
              className="w-full h-auto object-contain rounded-[20px]"
            />
            <div className="space-y-6">
              {FIGMA.emptyItems.map((item) => (
                <Feature key={item.title} title={item.title} body={item.body} />
              ))}
            </div>
          </div>
        </section>

        <section id="soytechno-m-checkout-2" className="scroll-mt-[88px] pt-10">
          <hr className="border-0 border-t border-[#D0C4DE] mb-8" />
          <Title>{FIGMA.checkoutTitle}</Title>
          <Lead>{FIGMA.checkoutLead}</Lead>
        </section>

        <section id="soytechno-m-cashea" className="scroll-mt-[88px] pt-10">
          <Chapter>{FIGMA.casheaPill}</Chapter>
          <div className="mt-5 grid grid-cols-1 gap-5">
            <div>
              <h3 className="font-paytone-lock text-[28px] leading-[34px] text-[#4A4453]">{FIGMA.casheaTitle}</h3>
              <p className="font-sans text-[16px] leading-[24px] mt-3">{FIGMA.casheaLead}</p>
              <div className="mt-6 space-y-5">
                {FIGMA.casheaItems.map((item) => (
                  <Feature key={item.title} title={item.title} body={item.body} />
                ))}
              </div>
            </div>
            <img
              src={src('giffycanvas-02.gif')}
              alt="Integración Cashea"
              width="100%"
              height="auto"
              className="w-full h-auto object-contain rounded-[20px]"
            />
          </div>
        </section>

        <section id="soytechno-m-wizard" className="scroll-mt-[88px] pt-10">
          <Chapter>{FIGMA.wizardPill}</Chapter>
          <div className="mt-5 grid grid-cols-1 gap-5">
            <img
              src={src('soytechno-wizard-ipad.png')}
              alt="Checkout wizard"
              width="100%"
              height="auto"
              className="w-full h-auto object-contain"
            />
            <div>
              <p className="font-sans text-[16px] leading-[24px]">{FIGMA.wizardLead}</p>
              <div className="mt-5 space-y-5">
                {FIGMA.wizardItems.map((item) => (
                  <Feature key={item.title} title={item.title} body={item.body} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="soytechno-m-logistics" className="scroll-mt-[88px] pt-10">
          <Chapter>{FIGMA.logisticsPill}</Chapter>
          <p className="font-sans text-[16px] leading-[24px] mt-5">{FIGMA.logisticsLead}</p>
          <div className="mt-5 space-y-5">
            {FIGMA.logisticsItems.map((item) => (
              <Feature
                key={item.title}
                title={item.title}
                body={item.body}
                bullets={'bullets' in item ? item.bullets : undefined}
              />
            ))}
          </div>
          <div className="mt-6">
            <SoyTechnoGroupedArt slot="logistica" alt="Sistema logístico SoyTechno" />
          </div>
        </section>

        <section id="soytechno-m-results" className="scroll-mt-[88px] pt-10">
          <Title>{FIGMA.resultsTitle}</Title>
          <Lead>{FIGMA.resultsLead}</Lead>
          <div className="mt-5 grid grid-cols-1 gap-3">
            {FIGMA.resultCards.map((card) => (
              <div key={card.title} className="bg-[#EADDFF] rounded-[20px] p-5">
                <h3 className="font-paytone-lock text-[17px] leading-[22px] text-[#4A4453] mb-2">{card.title}</h3>
                <p className="font-sans text-[16px] leading-[24px] text-[#4A4453]">{card.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="soytechno-m-phones" className="scroll-mt-[88px] pt-10">
          <SoyTechnoGroupedArt
            slot="phones"
            alt="Galería de pantallas móviles SoyTechno"
            fallback={<MobilePhonesCarousel />}
          />
        </section>

        <section id="soytechno-m-testimonial" className="scroll-mt-[88px] pt-10">
          <div className="bg-[#FFDAD6] rounded-[24px] px-5 py-8 text-center">
            <img
              src={src('testimonial-avatar.png')}
              alt={FIGMA.testimonialName}
              className="w-[120px] h-[120px] rounded-full object-cover mx-auto mb-5"
            />
            <p className="font-paytone-lock text-[26px] leading-[32px] text-[#2A0064]">{FIGMA.testimonialName}</p>
            <p className="font-sans text-[16px] leading-[24px] text-[#2A0064]/80 mt-1">{FIGMA.testimonialRole}</p>
            <p className="font-sans italic text-[18px] leading-[24px] text-[#2A0064] mt-6">
              “{FIGMA.testimonialQuote}”
            </p>
          </div>
        </section>

        <section id="soytechno-m-cta" className="scroll-mt-[88px] pt-10">
          <div className="bg-[#B3FFF3] rounded-[24px] px-5 py-8">
            <img
              src={src('cta-illustration.png')}
              alt=""
              width="100%"
              height="auto"
              className="w-full max-w-[260px] mx-auto h-auto object-contain"
            />
            <h2 className="font-paytone-lock text-[28px] leading-[34px] text-[#453A53] mt-6">
              ¿Tu E-commerce está listo para el nivel de un Web App?
            </h2>
            <p className="font-sans text-[16px] leading-[24px] text-[#453A53] mt-4">{FIGMA.ctaBody}</p>
            <div className="mt-6 flex justify-center">
              <a
                href={FIGMA.ctaHref}
                className="inline-flex items-center justify-center min-h-[48px] bg-[#440099] text-white font-sans font-semibold px-6 py-3 rounded-full no-underline text-center"
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
