import Image from 'next/image';
import { FIGMA } from '@/utils/soytechno-figma-copy';

const A = '/images/casos/soytechno';

function src(file: string) {
  return `${A}/${file}`;
}

function Shot({
  file,
  alt,
  className,
  sizes,
}: {
  file: string;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  const url = src(file);
  return (
    <Image
      src={url}
      alt={alt}
      fill
      sizes={sizes || '100vw'}
      className={className || 'object-contain'}
      unoptimized={url.endsWith('.gif')}
    />
  );
}

function FlowShot({
  file,
  alt,
  aspect = '4 / 5',
}: {
  file: string;
  alt: string;
  aspect?: string;
}) {
  return (
    <div className="relative w-full overflow-hidden rounded-[20px] bg-white" style={{ aspectRatio: aspect }}>
      <Shot file={file} alt={alt} className="object-contain object-top" />
    </div>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return <h2 className="font-paytone text-[26px] sm:text-[32px] leading-[1.2] text-[#4A4453]">{children}</h2>;
}

function Lead({ children }: { children: React.ReactNode }) {
  return <p className="font-sans text-[16px] sm:text-[17px] leading-[1.55] text-[#4A4453] mt-4">{children}</p>;
}

function Chapter({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#EADDFF] rounded-[20px] px-5 py-4 scroll-mt-[120px]">
      <h2 className="font-paytone text-[18px] sm:text-[22px] leading-[1.25] text-[#4A4453] text-center">{children}</h2>
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
      <h3 className="font-sans font-bold text-[17px] sm:text-[19px] leading-[1.35] text-[#4A4453]">{title}</h3>
      <p className="font-sans text-[16px] leading-[1.55] text-[#4A4453]">{body}</p>
      {bullets && (
        <ul className="list-disc pl-5 space-y-2 font-sans text-[16px] leading-[1.55] text-[#4A4453]">
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
    <div className="flex items-center justify-center gap-6 my-8">
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0">
        <Shot file="lifestyle-i.png" alt="100% originales" />
      </div>
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0">
        <Shot file="lifestyle-1.png" alt="" />
      </div>
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 overflow-hidden rounded-full">
        {third === 'circuit' ? (
          <div className="relative w-full h-full bg-[#0063FC]">
            <Shot file="lifestyle-f-alt.png" alt="SoyTechno" className="object-contain p-2" />
          </div>
        ) : (
          <Shot file="lifestyle-f.jpg" alt="SoyTechno" className="object-cover object-[60%_30%]" />
        )}
      </div>
    </div>
  );
}

function Phone({ screen, alt }: { screen: string; alt: string }) {
  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-x-[3.6%] top-[1.8%] bottom-[1.8%] overflow-hidden rounded-[18%/9%] bg-black">
        <Shot file={screen} alt={alt} className="object-cover object-top" sizes="60vw" />
      </div>
      <div className="absolute inset-0 z-10 pointer-events-none">
        <Shot file="iphone-frame-02.png" alt="" className="object-contain" sizes="60vw" />
      </div>
    </div>
  );
}

const PHONES = [
  { file: 'mobile-screen-04.png', alt: 'Selección de moneda SoyTechno' },
  { file: 'mobile-screen-01.png', alt: 'Catálogo móvil SoyTechno' },
  { file: 'mobile-screen-02.png', alt: 'Producto móvil SoyTechno' },
  { file: 'mobile-screen-03.png', alt: 'Checkout móvil SoyTechno' },
] as const;

export default function SoyTechnoMobile() {
  return (
    <div className="px-5 pb-28 space-y-12 max-w-[720px] mx-auto">
      <section id="soytechno-m-hero" className="bg-[#EADDFF] rounded-[24px] px-5 py-8 scroll-mt-[120px]">
        <h1 className="font-paytone text-[28px] sm:text-[34px] leading-[1.15] text-[#4A4453]">{FIGMA.heroTitle}</h1>
        <p className="font-sans text-[16px] leading-[1.55] mt-5">{FIGMA.heroP1}</p>
        <p className="font-sans text-[16px] leading-[1.55] mt-4">{FIGMA.heroP2}</p>
        <div className="relative mt-8 h-[200px] sm:h-[240px]">
          <div className="absolute left-0 bottom-6 w-[62%] h-[58%] rounded-[16px] overflow-hidden bg-[#00193F]">
            <Shot file="circuito.png" alt="" className="object-cover opacity-40 invert" />
            <div className="absolute inset-0 flex items-center justify-center px-4">
              <Image
                src={src('soytechno-logo-white.png')}
                alt="SoyTechno"
                width={200}
                height={36}
                className="object-contain w-[86%] h-auto"
              />
            </div>
          </div>
          <div className="absolute right-2 top-0 w-[120px] h-[120px] sm:w-[148px] sm:h-[148px] rounded-full overflow-hidden ring-4 ring-white">
            <Shot file="lifestyle-f.jpg" alt="SoyTechno" className="object-cover object-[55%_28%]" />
          </div>
          <div className="absolute right-[42%] top-2 w-12 h-12">
            <Shot file="cashea-badge.png" alt="Cashea" />
          </div>
        </div>
      </section>

      <section id="soytechno-m-desafio" className="scroll-mt-[120px]">
        <Title>{FIGMA.desafioTitle}</Title>
        <Lead>{FIGMA.desafioLead}</Lead>
        <Marks third="circuit" />
        <div className="space-y-8">
          {FIGMA.desafioItems.map((item) => (
            <Feature key={item.title} title={item.title} body={item.body} />
          ))}
        </div>
        <div className="mt-8 space-y-5">
          <FlowShot file="rectangle-147-catalog.png" alt="Catálogo SoyTechno" aspect="16 / 10" />
          <div className="mx-auto w-[220px] h-[452px] sm:w-[240px] sm:h-[494px]">
            <Phone screen="iphone-frame-01.png" alt="Catálogo móvil SoyTechno" />
          </div>
          <div className="relative w-full aspect-[3/2] rounded-[24px] overflow-hidden bg-[#00193F]">
            <Shot file="circuito.png" alt="" className="object-cover opacity-40 invert" />
            <div className="absolute inset-0 flex items-end justify-center gap-3 p-5">
              <div className="relative w-[26%] h-[70%]">
                <Shot file="electrodomesticos-01.png" alt="" />
              </div>
              <div className="relative w-[42%] h-[80%]">
                <Shot file="electrodomesticos-02.png" alt="" />
              </div>
              <div className="relative w-[26%] h-[70%]">
                <Shot file="electrodomesticos-03.png" alt="" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="soytechno-m-checkout" className="scroll-mt-[120px]">
        <Title>{FIGMA.checkoutTitle}</Title>
        <Lead>{FIGMA.checkoutLead}</Lead>
        <Marks third="people" />
      </section>

      <section id="soytechno-m-ux" className="scroll-mt-[120px]">
        <Title>{FIGMA.uxTitle}</Title>
        <Lead>{FIGMA.uxLead}</Lead>
      </section>

      <section id="soytechno-m-a" className="scroll-mt-[120px] space-y-6">
        <Chapter>{FIGMA.archPill}</Chapter>
        <FlowShot file="giffycanvas-01.gif" alt="Ficha de producto" aspect="3 / 4" />
        <div className="space-y-8">
          {FIGMA.archItems.map((item) => (
            <Feature key={item.title} title={item.title} body={item.body} />
          ))}
        </div>
      </section>

      <section id="soytechno-m-b" className="scroll-mt-[120px] space-y-6">
        <Chapter>{FIGMA.visualPill}</Chapter>
        <div className="space-y-4">
          {FIGMA.swatches.map((swatch) => (
            <div
              key={swatch.name}
              className="rounded-[20px] px-5 pt-5 pb-6 min-h-[220px] relative overflow-hidden"
              style={{ backgroundColor: swatch.card, color: swatch.ink }}
            >
              <p className="font-sans font-bold text-[16px]">{swatch.name}</p>
              <p className="font-sans font-bold text-[16px] whitespace-pre-line mt-2">{swatch.meta}</p>
              <img src={src(swatch.icon)} alt="" className="w-24 h-24 object-contain mt-6" />
            </div>
          ))}
        </div>
        <div className="relative w-full aspect-[5/6] max-w-[280px] mx-auto">
          <Shot file="iphone-mockup.gif" alt="Interfaz SoyTechno" />
        </div>
        <div className="relative w-full aspect-[16/10] rounded-[20px] overflow-hidden bg-[#0063FC]">
          <Shot file="circuito.png" alt="Circuito" className="object-cover opacity-40 invert" />
          <span className="absolute left-5 top-4 font-sans font-bold text-white text-[16px]">Circuito</span>
        </div>
        <div className="space-y-8">
          {FIGMA.visualItems.map((item) => (
            <Feature key={item.title} title={item.title} body={item.body} />
          ))}
        </div>
      </section>

      <section id="soytechno-m-c" className="scroll-mt-[120px] space-y-6">
        <Chapter>{FIGMA.emptyPill}</Chapter>
        <FlowShot file="section-c-ipad.png" alt="Pantallas de categoría y estados de sistema" aspect="3 / 4" />
        <div className="space-y-8">
          {FIGMA.emptyItems.map((item) => (
            <Feature key={item.title} title={item.title} body={item.body} />
          ))}
        </div>
      </section>

      <section id="soytechno-m-checkout-2" className="scroll-mt-[120px]">
        <hr className="border-0 border-t border-[#D0C4DE] mb-10" />
        <Title>{FIGMA.checkoutTitle}</Title>
        <Lead>{FIGMA.checkoutLead}</Lead>
      </section>

      <section id="soytechno-m-cashea" className="scroll-mt-[120px] space-y-6">
        <Chapter>{FIGMA.casheaPill}</Chapter>
        <h3 className="font-paytone text-[24px] sm:text-[28px] leading-[1.2] text-[#4A4453]">{FIGMA.casheaTitle}</h3>
        <p className="font-sans text-[16px] leading-[1.55]">{FIGMA.casheaLead}</p>
        <div className="space-y-8">
          {FIGMA.casheaItems.map((item) => (
            <Feature key={item.title} title={item.title} body={item.body} />
          ))}
        </div>
        <FlowShot file="giffycanvas-02.gif" alt="Integración Cashea" aspect="3 / 4" />
      </section>

      <section id="soytechno-m-wizard" className="scroll-mt-[120px] space-y-6">
        <Chapter>{FIGMA.wizardPill}</Chapter>
        <FlowShot file="ipad-mockup-01.png" alt="Checkout wizard" aspect="1640 / 2360" />
        <p className="font-sans text-[16px] leading-[1.55]">{FIGMA.wizardLead}</p>
        <div className="space-y-8">
          {FIGMA.wizardItems.map((item) => (
            <Feature key={item.title} title={item.title} body={item.body} />
          ))}
        </div>
      </section>

      <section id="soytechno-m-logistics" className="scroll-mt-[120px] space-y-6">
        <Chapter>{FIGMA.logisticsPill}</Chapter>
        <p className="font-sans text-[16px] leading-[1.55]">{FIGMA.logisticsLead}</p>
        <div className="space-y-8">
          {FIGMA.logisticsItems.map((item) => (
            <Feature
              key={item.title}
              title={item.title}
              body={item.body}
              bullets={'bullets' in item ? item.bullets : undefined}
            />
          ))}
        </div>
        <FlowShot file="rectangle-144.jpg" alt="Envíos a nivel nacional" aspect="16 / 10" />
        <FlowShot file="rectangle-146.png" alt="Rastreo MRW" aspect="16 / 10" />
      </section>

      <section id="soytechno-m-results" className="scroll-mt-[120px] space-y-6">
        <Title>{FIGMA.resultsTitle}</Title>
        <Lead>{FIGMA.resultsLead}</Lead>
        <div className="space-y-4">
          {FIGMA.resultCards.map((card) => (
            <div key={card.title} className="bg-[#EADDFF] rounded-[24px] p-6">
              <h3 className="font-sans font-bold text-[18px] leading-[1.4] text-[#4A4453] mb-3">{card.title}</h3>
              <p className="font-sans text-[16px] leading-[1.55] text-[#4A4453]">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="soytechno-m-phones" className="scroll-mt-[120px]">
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 -mx-5 px-5">
          {PHONES.map((phone) => (
            <div key={phone.file} className="snap-center shrink-0 w-[220px] h-[452px] sm:w-[240px] sm:h-[494px]">
              <Phone screen={phone.file} alt={phone.alt} />
            </div>
          ))}
        </div>
      </section>

      <section id="soytechno-m-testimonial" className="scroll-mt-[120px]">
        <div className="bg-[#FFDAD6] rounded-[24px] px-5 py-8 text-center">
          <div className="relative w-[120px] h-[120px] rounded-full overflow-hidden mx-auto mb-5">
            <Shot file="testimonial-avatar.png" alt={FIGMA.testimonialName} className="object-cover" />
          </div>
          <p className="font-paytone text-[26px] text-[#2A0064]">{FIGMA.testimonialName}</p>
          <p className="font-sans text-[16px] text-[#2A0064]/80 mt-1">{FIGMA.testimonialRole}</p>
          <p className="font-sans italic text-[18px] sm:text-[20px] leading-[1.5] text-[#2A0064] mt-6">
            “{FIGMA.testimonialQuote}”
          </p>
        </div>
      </section>

      <section id="soytechno-m-cta" className="scroll-mt-[120px]">
        <div className="bg-[#B3FFF3] rounded-[24px] px-5 py-8">
          <div className="relative w-full max-w-[260px] mx-auto aspect-square">
            <Shot file="cta-illustration.png" alt="" />
          </div>
          <h2 className="font-paytone text-[26px] sm:text-[32px] leading-[1.2] text-[#453A53] mt-6">
            ¿Tu E-commerce está listo para el nivel de un Web App?
          </h2>
          <p className="font-sans text-[16px] leading-[1.55] text-[#453A53] mt-4">{FIGMA.ctaBody}</p>
          <div className="mt-6 flex justify-center pb-10">
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
  );
}
