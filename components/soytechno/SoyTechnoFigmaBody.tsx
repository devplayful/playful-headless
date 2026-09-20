import Image from 'next/image';
import { FIGMA } from '@/utils/soytechno-figma-copy';

const A = '/images/casos/soytechno';

function img(file: string) {
  return `${A}/${file}`;
}

function isGif(src: string) {
  return src.endsWith('.gif');
}

function Asset({
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
  const src = img(file);
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes || '50vw'}
      className={className || 'object-contain'}
      unoptimized={isGif(src)}
    />
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-paytone text-[32px] md:text-[47px] leading-[1.2] text-[#4A4453] text-center max-w-[900px] mx-auto">
      {children}
    </h2>
  );
}

function Lead({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-sans text-[18px] leading-[1.5] text-[#4A4453] text-center max-w-[820px] mx-auto mt-6">
      {children}
    </p>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-center">
      <div className="bg-[#EADDFF] rounded-full px-10 py-4 max-w-[1100px]">
        <h2 className="font-paytone text-[22px] md:text-[32px] leading-[1.2] text-[#4A4453] text-center">
          {children}
        </h2>
      </div>
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
      <h3 className="font-sans font-bold text-[18px] md:text-[22px] leading-[1.5] text-[#4A4453]">
        {title}
      </h3>
      <p className="font-sans text-[18px] leading-[1.5] text-[#4A4453]">{body}</p>
      {bullets && (
        <ul className="list-disc pl-5 space-y-1 font-sans text-[18px] leading-[1.5] text-[#4A4453]">
          {bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function SoyTechnoFigmaBody() {
  return (
    <div className="bg-[#FEF7FF] text-[#4A4453]">
      <div className="max-w-[1200px] mx-auto px-[20px] md:px-0 pt-10">
        <nav aria-label="Breadcrumb" className="font-sans text-[14px] text-[#4A4453]/70 mb-8">
          <a href="/" className="hover:underline">
            {FIGMA.breadcrumb[0]}
          </a>
          <span className="mx-2">/</span>
          <a href="/casos-de-exito-agencia-de-marketing-digital" className="hover:underline">
            {FIGMA.breadcrumb[1]}
          </a>
        </nav>
      </div>

      {/* Hero */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-0">
        <div className="bg-[#FFFBFF] rounded-[36px] px-6 py-12 md:px-[80px] md:py-[80px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-paytone text-[36px] md:text-[47px] leading-[1.2] text-[#4A4453] mb-8">
                {FIGMA.heroTitle}
              </h1>
              <p className="font-sans text-[18px] leading-[1.5] mb-6">{FIGMA.heroP1}</p>
              <p className="font-sans text-[18px] leading-[1.5]">{FIGMA.heroP2}</p>
            </div>
            <div className="relative min-h-[460px] md:min-h-[540px]">
              <div className="absolute left-[40px] top-[90px] w-[280px] h-[300px] rounded-[20px] overflow-hidden bg-[#0B1B4A]">
                <Asset file="soytechno-logo-background.png" alt="" className="object-cover" />
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <Image
                    src="/images/logos/soytechno.png"
                    alt="SoyTechno"
                    width={220}
                    height={48}
                    className="object-contain brightness-0 invert"
                  />
                </div>
              </div>
              <div className="absolute right-[24px] top-[96px] w-[200px] h-[200px] rounded-full overflow-hidden ring-4 ring-white">
                <Asset file="lifestyle-f.jpg" alt="SoyTechno" className="object-cover" />
              </div>
              <div className="absolute right-[36px] top-0 w-[72px] h-[72px]">
                <Asset file="cashea-badge.png" alt="Cashea" />
              </div>
              <div className="absolute right-[130px] top-[8px] w-[64px] h-[64px]">
                <Asset file="delivery-icon-2.png" alt="" />
              </div>
              <div className="absolute left-[56px] bottom-[28px] w-[80px] h-[80px]">
                <Asset file="lifestyle-1.png" alt="" />
              </div>
              <div className="absolute left-[160px] bottom-[12px] w-[110px] h-[110px]">
                <Asset file="lifestyle-i.png" alt="Productos 100% originales" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Desafío */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-0 pt-[100px]">
        <SectionTitle>{FIGMA.desafioTitle}</SectionTitle>
        <Lead>{FIGMA.desafioLead}</Lead>
        <div className="flex justify-center items-center gap-8 md:gap-16 mt-12 mb-16">
          <div className="relative w-[96px] h-[96px]">
            <Asset file="lifestyle-i.png" alt="100% originales" />
          </div>
          <div className="relative w-[96px] h-[96px]">
            <Asset file="lifestyle-1.png" alt="" />
          </div>
          <div className="relative w-[96px] h-[96px] rounded-full overflow-hidden bg-[#0B1B4A]">
            <Asset file="logo-secondary.png" alt="SoyTechno" className="object-cover" />
          </div>
        </div>
        <div className="bg-[#FFFBFF] rounded-[36px] p-8 md:p-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-8">
              {FIGMA.desafioItems.map((item) => (
                <Feature key={item.title} title={item.title} body={item.body} />
              ))}
            </div>
            <div className="space-y-6">
              <div className="relative w-full h-[180px] rounded-[20px] overflow-hidden bg-[#0B1B4A]">
                <Asset file="soytechno-logo-background.png" alt="SoyTechno" className="object-cover" />
              </div>
              <div className="relative w-full max-w-[340px] h-[560px] mx-auto">
                <Asset file="iphone-mockup.gif" alt="Catálogo móvil SoyTechno" />
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
          <div className="relative w-full h-[360px] md:h-[480px] rounded-[36px] overflow-hidden bg-white">
            <Asset file="giffycanvas-01.gif" alt="Catálogo SoyTechno" />
          </div>
          <div className="space-y-6">
            <div className="relative w-full h-[220px] rounded-[36px] overflow-hidden bg-[#EADDFF]">
              <Asset file="phone-composite.png" alt="Categorías" />
            </div>
            <div className="relative w-full h-[220px] rounded-[36px] overflow-hidden bg-[#0B1B4A]">
              <Asset file="circuito.png" alt="" className="object-cover opacity-40" />
              <div className="absolute inset-0 flex items-end justify-center gap-4 p-6">
                <div className="relative w-[28%] h-[70%]">
                  <Asset file="electrodomesticos-01.png" alt="" />
                </div>
                <div className="relative w-[40%] h-[80%]">
                  <Asset file="electrodomesticos-02.png" alt="" />
                </div>
                <div className="relative w-[28%] h-[70%]">
                  <Asset file="electrodomesticos-03.png" alt="" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 md:px-0 pt-[100px]">
        <SectionTitle>{FIGMA.checkoutTitle}</SectionTitle>
        <Lead>{FIGMA.checkoutLead}</Lead>
        <div className="flex justify-center items-center gap-10 mt-12">
          <div className="relative w-[88px] h-[88px]">
            <Asset file="lifestyle-i.png" alt="" />
          </div>
          <div className="relative w-[88px] h-[88px]">
            <Asset file="lifestyle-1.png" alt="" />
          </div>
          <div className="relative w-[88px] h-[88px] rounded-full overflow-hidden">
            <Asset file="lifestyle-f.jpg" alt="SoyTechno" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 md:px-0 pt-[80px]">
        <SectionTitle>{FIGMA.uxTitle}</SectionTitle>
        <Lead>{FIGMA.uxLead}</Lead>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 md:px-0 pt-[64px]">
        <Pill>{FIGMA.archPill}</Pill>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-12">
          <div className="relative w-full h-[520px] md:h-[640px]">
            <Asset file="ipad-mockup-01.png" alt="Ficha de producto" />
          </div>
          <div className="space-y-8">
            {FIGMA.archItems.map((item) => (
              <Feature key={item.title} title={item.title} body={item.body} />
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 md:px-0 pt-[80px]">
        <Pill>{FIGMA.visualPill}</Pill>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mt-12">
          <div className="space-y-6">
            {FIGMA.swatches.map((swatch) => (
              <div
                key={swatch.name}
                className="rounded-[20px] p-6 text-white min-h-[140px]"
                style={{ backgroundColor: swatch.hex }}
              >
                <p className="font-sans font-bold text-[16px] whitespace-pre-line">{swatch.meta}</p>
              </div>
            ))}
          </div>
          <div className="relative w-full h-[560px]">
            <Asset file="giffycanvas-01.gif" alt="Interfaz SoyTechno" />
          </div>
          <div className="space-y-8">
            <div className="relative w-full h-[180px] rounded-[20px] overflow-hidden bg-[#0B1B4A]">
              <Asset file="soytechno-logo-background.png" alt="SoyTechno" className="object-cover" />
            </div>
            {FIGMA.visualItems.map((item) => (
              <Feature key={item.title} title={item.title} body={item.body} />
            ))}
            <div className="relative w-full h-[180px] rounded-[20px] overflow-hidden bg-[#0B1B4A]">
              <Asset file="circuito.png" alt="Circuito" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 md:px-0 pt-[80px]">
        <Pill>{FIGMA.emptyPill}</Pill>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-12">
          <div className="relative w-full h-[520px] md:h-[640px]">
            <Asset file="ipad-mockup-02.png" alt="Pantallas vacías" />
          </div>
          <div className="space-y-8">
            {FIGMA.emptyItems.map((item) => (
              <Feature key={item.title} title={item.title} body={item.body} />
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 md:px-0 pt-[100px]">
        <SectionTitle>{FIGMA.checkoutTitle}</SectionTitle>
        <Lead>{FIGMA.checkoutLead}</Lead>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 md:px-0 pt-[64px]">
        <Pill>{FIGMA.casheaPill}</Pill>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mt-12">
          <div className="space-y-8">
            <h3 className="font-paytone text-[28px] md:text-[36px] leading-[1.2] text-[#4A4453]">
              {FIGMA.casheaTitle}
            </h3>
            <p className="font-sans text-[18px] leading-[1.5]">{FIGMA.casheaLead}</p>
            {FIGMA.casheaItems.map((item) => (
              <Feature key={item.title} title={item.title} body={item.body} />
            ))}
          </div>
          <div className="relative w-full h-[520px] md:h-[680px]">
            <Asset file="giffycanvas-02.gif" alt="Integración Cashea" />
          </div>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 md:px-0 pt-[80px]">
        <Pill>{FIGMA.wizardPill}</Pill>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-12">
          <div className="relative w-full h-[520px] md:h-[680px]">
            <Asset file="rectangle-145.png" alt="Checkout wizard" className="object-contain" />
          </div>
          <div className="space-y-8">
            <p className="font-sans text-[18px] leading-[1.5]">{FIGMA.wizardLead}</p>
            {FIGMA.wizardItems.map((item) => (
              <Feature key={item.title} title={item.title} body={item.body} />
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 md:px-0 pt-[80px] pb-8">
        <Pill>{FIGMA.logisticsPill}</Pill>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-12">
          <div className="space-y-8">
            <p className="font-sans text-[18px] leading-[1.5]">{FIGMA.logisticsLead}</p>
            {FIGMA.logisticsItems.map((item) => (
              <Feature
                key={item.title}
                title={item.title}
                body={item.body}
                bullets={'bullets' in item ? item.bullets : undefined}
              />
            ))}
          </div>
          <div className="space-y-6">
            <div className="relative w-full h-[220px] rounded-[20px] overflow-hidden bg-white">
              <Asset file="rectangle-144.jpg" alt="Envíos a nivel nacional" className="object-contain" />
            </div>
            <div className="relative w-full h-[360px]">
              <Asset file="rectangle-148.png" alt="iMac" className="object-contain" />
              <div className="absolute left-[12%] top-[8%] w-[76%] h-[52%] overflow-hidden">
                <Image
                  src={img('rectangle-146.png')}
                  alt="Rastreo MRW"
                  fill
                  className="object-cover object-top"
                  sizes="40vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 md:px-0 pt-[100px]">
        <SectionTitle>{FIGMA.resultsTitle}</SectionTitle>
        <Lead>{FIGMA.resultsLead}</Lead>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {FIGMA.resultCards.map((card) => (
            <div key={card.title} className="bg-[#EADDFF] rounded-[36px] p-8 min-h-[280px]">
              <h3 className="font-sans font-bold text-[20px] leading-[1.4] text-[#4A4453] mb-4">
                {card.title}
              </h3>
              <p className="font-sans text-[18px] leading-[1.5] text-[#4A4453]">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 md:px-0 pt-[80px]">
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
          {['mobile-screen-01.png', 'mobile-screen-02.png', 'mobile-screen-03.png', 'mobile-screen-04.png'].map(
            (file) => (
              <div key={file} className="relative w-[220px] h-[460px]">
                <Asset file={file} alt="Pantalla móvil SoyTechno" className="object-contain" />
              </div>
            ),
          )}
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 md:px-0 pt-[80px]">
        <div className="bg-[#FFDAD6] rounded-[36px] px-8 py-12 md:px-16 md:py-16 relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10 items-center relative z-10">
            <div className="flex flex-col items-center text-center">
              <div className="relative w-[140px] h-[140px] rounded-full overflow-hidden mb-6">
                <Asset file="testimonial-avatar.png" alt={FIGMA.testimonialName} className="object-cover" />
              </div>
              <p className="font-paytone text-[28px] text-[#2A0064]">{FIGMA.testimonialName}</p>
              <p className="font-sans text-[18px] text-[#2A0064]/80">{FIGMA.testimonialRole}</p>
            </div>
            <p className="font-sans italic text-[22px] md:text-[24px] leading-[1.5] text-[#2A0064] text-center">
              “{FIGMA.testimonialQuote}”
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 md:px-0 pt-[64px] pb-[80px]">
        <div className="bg-[#B3FFF3] rounded-[36px] px-8 py-12 md:px-16 md:py-16 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="relative w-full h-[320px] md:h-[420px]">
              <Asset file="cta-illustration.png" alt="" />
            </div>
            <div className="text-center lg:text-left">
              <h2 className="font-paytone text-[32px] md:text-[47px] leading-[1.2] text-[#453A53] mb-6">
                {FIGMA.ctaTitle}
              </h2>
              <p className="font-sans text-[18px] leading-[1.5] text-[#453A53] mb-8">{FIGMA.ctaBody}</p>
              <a
                href={FIGMA.ctaHref}
                className="inline-block bg-[#440099] text-white font-sans font-semibold py-3 px-8 rounded-full no-underline"
              >
                {FIGMA.ctaButton}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
