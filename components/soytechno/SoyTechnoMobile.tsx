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

function Title({ children }: { children: React.ReactNode }) {
  return <h2 className="font-paytone-lock text-[26px] sm:text-[32px] leading-[1.2] text-[#4A4453]">{children}</h2>;
}

function Lead({ children }: { children: React.ReactNode }) {
  return <p className="font-sans text-[16px] sm:text-[17px] leading-[1.55] text-[#4A4453] mt-4">{children}</p>;
}

function Chapter({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#EADDFF] rounded-[20px] px-5 py-4 scroll-mt-[120px]">
      <h2 className="font-paytone-lock text-[18px] sm:text-[22px] leading-[1.25] text-[#4A4453] text-center">{children}</h2>
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
      <h3 className="font-paytone-lock text-[17px] sm:text-[19px] leading-[1.3] text-[#4A4453]">{title}</h3>
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

function WhitePhoneIcon() {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-sm" aria-hidden>
      <rect x="18" y="6" width="28" height="52" rx="6" fill="white" />
      <rect x="28" y="10" width="8" height="3" rx="1.5" fill="#00193F" />
      <circle cx="32" cy="52" r="2.2" fill="#00193F" />
    </svg>
  );
}

function Marks({ third }: { third: 'circuit' | 'people' }) {
  return (
    <div className="flex items-center justify-center gap-5 my-6">
      <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0">
        <Shot file="lifestyle-i.png" alt="100% originales" />
      </div>
      <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0">
        <Shot file="lifestyle-1.png" alt="" />
      </div>
      <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 overflow-hidden rounded-full">
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
    <div className="pb-28">
      <section id="soytechno-m-hero" className="relative bg-[#440099] px-4 pt-4 pb-6 scroll-mt-[120px]">
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.4) 1.2px, transparent 1.6px), url(${src('background-texture.png')})`,
            backgroundSize: '22px 22px, cover',
          }}
        />
        <div className="relative bg-[#EADDFF] rounded-[24px] px-5 py-7 max-w-[720px] mx-auto">
          <h1 className="font-paytone-lock text-[28px] sm:text-[34px] leading-[1.15] tracking-[-0.02em] text-[#4A4453]">
            {FIGMA.heroTitle}
          </h1>
          <p className="font-sans text-[16px] leading-[1.55] mt-5">{FIGMA.heroP1}</p>
          <p className="font-sans text-[16px] leading-[1.55] mt-4">{FIGMA.heroP2}</p>
          <div className="relative mt-8 h-[210px] sm:h-[250px]">
            <div className="absolute left-[4%] top-[32%] w-[72%] h-[52%] rounded-[16px] overflow-hidden bg-[#00193F] z-10">
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
            <div className="absolute right-[6%] top-[4%] w-[118px] h-[118px] sm:w-[140px] sm:h-[140px] rounded-full overflow-hidden ring-4 ring-white z-20">
              <Shot file="lifestyle-f.jpg" alt="SoyTechno" className="object-cover object-[55%_28%]" />
            </div>
            <div className="absolute right-[34%] top-0 w-11 h-11 z-30">
              <Shot file="cashea-badge.png" alt="Cashea" />
            </div>
            <div className="absolute right-[2%] top-[28%] w-10 h-10 z-30">
              <Shot file="delivery-icon-3.png" alt="" />
            </div>
            <div className="absolute left-0 top-[58%] w-12 h-12 z-30">
              <WhitePhoneIcon />
            </div>
            <div className="absolute right-[28%] bottom-1 w-12 h-12 z-30">
              <Shot file="lifestyle-1.png" alt="" />
            </div>
            <div className="absolute right-[8%] bottom-0 w-11 h-11 z-30">
              <Shot file="lifestyle-i.png" alt="Productos 100% originales" />
            </div>
          </div>
        </div>
      </section>

      <div className="px-5 max-w-[720px] mx-auto">
        <section id="soytechno-m-desafio" className="scroll-mt-[120px] pt-10">
          <Title>{FIGMA.desafioTitle}</Title>
          <Lead>{FIGMA.desafioLead}</Lead>
          <Marks third="circuit" />
          <div className="bg-white rounded-[24px] px-5 py-6 space-y-6 shadow-sm">
            {FIGMA.desafioItems.map((item) => (
              <Feature key={item.title} title={item.title} body={item.body} />
            ))}
          </div>
          <div className="relative mt-5 h-[420px] sm:h-[460px] bg-[#EADDFF] rounded-[24px] overflow-hidden">
            <div className="absolute left-3 top-3 right-[28%] h-[42%] rounded-[16px] overflow-hidden bg-[#0063FC]">
              <Shot file="circuito.png" alt="" className="object-cover opacity-30 invert" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-[#00193F]">
                  <Shot file="website-capture-01.png" alt="SoyTechno" />
                </div>
              </div>
            </div>
            <div className="absolute left-3 bottom-3 w-[58%] h-[48%] bg-[#FFF4C4] rounded-[18px] p-2">
              <div className="relative w-full h-full">
                <Shot file="rectangle-147-catalog.png" alt="Catálogo SoyTechno" className="object-contain" />
              </div>
            </div>
            <div className="absolute right-3 bottom-3 w-[36%] h-[38%] rounded-[16px] overflow-hidden bg-[#00193F]">
              <Shot file="circuito.png" alt="" className="object-cover opacity-40 invert" />
              <div className="absolute inset-0 flex items-end justify-center gap-1 p-2">
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
            <div className="absolute right-[8%] top-[18%] w-[132px] h-[270px] sm:w-[150px] sm:h-[308px] z-20">
              <Phone screen="iphone-frame-01.png" alt="Catálogo móvil SoyTechno" />
            </div>
          </div>
        </section>

        <section id="soytechno-m-checkout" className="scroll-mt-[120px] pt-6">
          <Title>{FIGMA.checkoutTitle}</Title>
          <Lead>{FIGMA.checkoutLead}</Lead>
          <Marks third="people" />
        </section>

        <section id="soytechno-m-ux" className="scroll-mt-[120px] pt-8">
          <Title>{FIGMA.uxTitle}</Title>
          <Lead>{FIGMA.uxLead}</Lead>
        </section>

        <section id="soytechno-m-a" className="scroll-mt-[120px] pt-10">
          <Chapter>{FIGMA.archPill}</Chapter>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
            <div className="relative w-full aspect-[3/4] overflow-hidden rounded-[20px] bg-white">
              <Shot file="giffycanvas-01.gif" alt="Ficha de producto" className="object-contain object-top" />
            </div>
            <div className="space-y-6">
              {FIGMA.archItems.map((item) => (
                <Feature key={item.title} title={item.title} body={item.body} />
              ))}
            </div>
          </div>
        </section>

        <section id="soytechno-m-b" className="scroll-mt-[120px] pt-10">
          <Chapter>{FIGMA.visualPill}</Chapter>
          <div className="mt-5 relative bg-[#EADDFF] rounded-[24px] px-3 pt-4 pb-6">
            <div className="grid grid-cols-2 gap-3 pr-[38%] sm:pr-[42%]">
              {FIGMA.swatches.map((swatch) => (
                <div
                  key={swatch.name}
                  className="rounded-[16px] px-3 pt-3 pb-4 min-h-[150px] relative overflow-hidden"
                  style={{ backgroundColor: swatch.card, color: swatch.ink }}
                >
                  <p className="font-paytone-lock text-[13px] leading-[1.2]">{swatch.name}</p>
                  <p className="font-sans text-[11px] leading-[1.35] whitespace-pre-line mt-1">{swatch.meta}</p>
                  <img src={src(swatch.icon)} alt="" className="w-12 h-12 object-contain mt-3" />
                </div>
              ))}
              <div className="rounded-[16px] overflow-hidden bg-[#0063FC] min-h-[150px] relative">
                <Shot file="circuito.png" alt="Circuito" className="object-cover opacity-40 invert" />
                <span className="absolute left-3 top-3 font-paytone-lock text-white text-[14px]">Circuito</span>
              </div>
            </div>
            <div className="absolute right-2 top-4 w-[36%] max-w-[160px] aspect-[353/647]">
              <Shot file="section-b-phone.png" alt="LG SoyTechno / Zona LG" />
            </div>
            <div className="mt-4 rounded-[16px] overflow-hidden bg-[#003896] h-16 relative">
              <Shot file="circuito.png" alt="" className="object-cover opacity-35 invert" />
              <div className="absolute inset-0 flex items-center justify-center px-6">
                <Image
                  src={src('soytechno-logo-white.png')}
                  alt="SoyTechno"
                  width={180}
                  height={32}
                  className="object-contain w-[70%] h-auto"
                />
              </div>
            </div>
            <div className="mt-5 space-y-5 px-2">
              {FIGMA.visualItems.map((item) => (
                <Feature key={item.title} title={item.title} body={item.body} />
              ))}
            </div>
          </div>
        </section>

        <section id="soytechno-m-c" className="scroll-mt-[120px] pt-10">
          <Chapter>{FIGMA.emptyPill}</Chapter>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
            <div className="relative w-full aspect-[3/4] overflow-hidden rounded-[20px] bg-white">
              <Shot file="section-c-ipad.png" alt="Pantallas de categoría y estados de sistema" className="object-contain object-top" />
            </div>
            <div className="space-y-6">
              {FIGMA.emptyItems.map((item) => (
                <Feature key={item.title} title={item.title} body={item.body} />
              ))}
            </div>
          </div>
        </section>

        <section id="soytechno-m-checkout-2" className="scroll-mt-[120px] pt-10">
          <hr className="border-0 border-t border-[#D0C4DE] mb-8" />
          <Title>{FIGMA.checkoutTitle}</Title>
          <Lead>{FIGMA.checkoutLead}</Lead>
        </section>

        <section id="soytechno-m-cashea" className="scroll-mt-[120px] pt-10">
          <Chapter>{FIGMA.casheaPill}</Chapter>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
            <div>
              <h3 className="font-paytone-lock text-[24px] sm:text-[28px] leading-[1.2] text-[#4A4453]">{FIGMA.casheaTitle}</h3>
              <p className="font-sans text-[16px] leading-[1.55] mt-3">{FIGMA.casheaLead}</p>
              <div className="mt-6 space-y-5">
                {FIGMA.casheaItems.map((item) => (
                  <Feature key={item.title} title={item.title} body={item.body} />
                ))}
              </div>
            </div>
            <div className="relative w-full aspect-[3/4] overflow-hidden rounded-[20px] bg-white">
              <Shot file="giffycanvas-02.gif" alt="Integración Cashea" className="object-contain object-top" />
            </div>
          </div>
        </section>

        <section id="soytechno-m-wizard" className="scroll-mt-[120px] pt-10">
          <Chapter>{FIGMA.wizardPill}</Chapter>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
            <div className="relative w-full aspect-[1640/2360] overflow-hidden rounded-[20px] bg-white">
              <Shot file="ipad-mockup-01.png" alt="Checkout wizard" className="object-contain object-top" />
            </div>
            <div>
              <p className="font-sans text-[16px] leading-[1.55]">{FIGMA.wizardLead}</p>
              <div className="mt-5 space-y-5">
                {FIGMA.wizardItems.map((item) => (
                  <Feature key={item.title} title={item.title} body={item.body} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="soytechno-m-logistics" className="scroll-mt-[120px] pt-10">
          <Chapter>{FIGMA.logisticsPill}</Chapter>
          <p className="font-sans text-[16px] leading-[1.55] mt-5">{FIGMA.logisticsLead}</p>
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
          <div className="relative mt-6 h-[280px] sm:h-[320px]">
            <div className="absolute right-6 top-0 w-[42%] h-[38%] rounded-[12px] overflow-hidden bg-white shadow-md z-10">
              <Shot file="rectangle-144.jpg" alt="Envíos a nivel nacional" className="object-contain" />
            </div>
            <div className="absolute left-[8%] top-[28%] w-[84%] h-[72%]">
              <Shot file="rectangle-148.png" alt="" className="object-contain" />
              <div className="absolute left-[8%] top-[6%] w-[84%] h-[42%] overflow-hidden">
                <Shot file="rectangle-146.png" alt="Rastreo MRW" className="object-cover object-top" />
              </div>
            </div>
          </div>
        </section>

        <section id="soytechno-m-results" className="scroll-mt-[120px] pt-10">
          <Title>{FIGMA.resultsTitle}</Title>
          <Lead>{FIGMA.resultsLead}</Lead>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {FIGMA.resultCards.map((card) => (
              <div key={card.title} className="bg-[#EADDFF] rounded-[20px] p-5">
                <h3 className="font-paytone-lock text-[17px] leading-[1.3] text-[#4A4453] mb-2">{card.title}</h3>
                <p className="font-sans text-[16px] leading-[1.55] text-[#4A4453]">{card.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="soytechno-m-phones" className="scroll-mt-[120px] pt-10">
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 -mx-5 px-5">
            {PHONES.map((phone) => (
              <div key={phone.file} className="snap-center shrink-0 w-[220px] h-[452px] sm:w-[240px] sm:h-[494px]">
                <Phone screen={phone.file} alt={phone.alt} />
              </div>
            ))}
          </div>
        </section>

        <section id="soytechno-m-testimonial" className="scroll-mt-[120px] pt-10">
          <div className="bg-[#FFDAD6] rounded-[24px] px-5 py-8 text-center">
            <div className="relative w-[120px] h-[120px] rounded-full overflow-hidden mx-auto mb-5">
              <Shot file="testimonial-avatar.png" alt={FIGMA.testimonialName} className="object-cover" />
            </div>
            <p className="font-paytone-lock text-[26px] text-[#2A0064]">{FIGMA.testimonialName}</p>
            <p className="font-sans text-[16px] text-[#2A0064]/80 mt-1">{FIGMA.testimonialRole}</p>
            <p className="font-sans italic text-[18px] sm:text-[20px] leading-[1.5] text-[#2A0064] mt-6">
              “{FIGMA.testimonialQuote}”
            </p>
          </div>
        </section>

        <section id="soytechno-m-cta" className="scroll-mt-[120px] pt-10">
          <div className="bg-[#B3FFF3] rounded-[24px] px-5 py-8">
            <div className="relative w-full max-w-[260px] mx-auto aspect-square">
              <Shot file="cta-illustration.png" alt="" />
            </div>
            <h2 className="font-paytone-lock text-[26px] sm:text-[32px] leading-[1.2] text-[#453A53] mt-6">
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
    </div>
  );
}
