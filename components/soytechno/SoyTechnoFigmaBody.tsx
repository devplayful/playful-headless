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
    <p className="font-sans text-[18px] leading-[1.5] text-[#4A4453] text-center max-w-[820px] mx-auto mt-8">
      {children}
    </p>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-center">
      <div className="bg-[#EADDFF] rounded-full px-10 py-5 max-w-[1100px] w-full">
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
    <div className="space-y-3">
      <h3 className="font-sans font-bold text-[18px] md:text-[22px] leading-[1.5] text-[#4A4453]">
        {title}
      </h3>
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

function CircuitPanel({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-[#071642] ${className || ''}`}>
      <Asset file="circuito.png" alt="" className="object-cover opacity-40 invert" />
    </div>
  );
}

function WordmarkCard({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-[#071642] ${className || ''}`}>
      <Asset file="circuito.png" alt="" className="object-cover opacity-40 invert" />
      <div className="absolute inset-0 flex items-center justify-center px-8">
        <Image
          src={img('soytechno-logo-white.png')}
          alt="SoyTechno"
          width={260}
          height={46}
          className="object-contain w-[86%] h-auto"
        />
      </div>
    </div>
  );
}

/** iPhone chrome from handoff (iphone-frame-02). Screen shows through the transparent bezel hole. */
function IPhoneFrame({
  screen,
  alt,
  className,
}: {
  screen: string;
  alt: string;
  className?: string;
}) {
  return (
    <div className={`relative w-full aspect-[372/750] ${className || ''}`}>
      <div className="absolute inset-x-[3.6%] top-[1.8%] bottom-[1.8%] overflow-hidden rounded-[18%/9%] bg-black">
        <Asset file={screen} alt={alt} className="object-cover object-top" />
      </div>
      <div className="absolute inset-0 z-10 pointer-events-none">
        <Asset file="iphone-frame-02.png" alt="" className="object-contain" />
      </div>
    </div>
  );
}

/** iPad chrome from handoff (ipad-mockup-02). */
function IPadFrame({
  screen,
  alt,
  className,
}: {
  screen: string;
  alt: string;
  className?: string;
}) {
  return (
    <div className={`relative w-full aspect-[750/541] ${className || ''}`}>
      <div className="absolute inset-x-[2.4%] top-[3.1%] bottom-[3.6%] overflow-hidden rounded-[12px] bg-white">
        <Asset file={screen} alt={alt} className="object-cover object-top" />
      </div>
      <div className="absolute inset-0 z-10 pointer-events-none">
        <Asset file="ipad-mockup-02.png" alt="" className="object-contain" />
      </div>
    </div>
  );
}

function IMacComposite() {
  return (
    <div className="relative w-full aspect-[750/676]">
      <Asset file="rectangle-148.png" alt="" className="object-contain" />
      <div className="absolute left-[5%] top-[3.2%] w-[90%] h-[46%] overflow-hidden rounded-sm">
        <Image
          src={img('rectangle-146.png')}
          alt="Rastreo MRW"
          fill
          className="object-cover object-top"
          sizes="40vw"
        />
      </div>
    </div>
  );
}

function BrandMarks({
  third,
}: {
  third: 'logo' | 'people';
}) {
  return (
    <div className="flex justify-center items-center gap-10 md:gap-16 mt-16 mb-20">
      <div className="relative w-[96px] h-[96px]">
        <Asset file="lifestyle-i.png" alt="100% originales" />
      </div>
      <div className="relative w-[96px] h-[96px]">
        <Asset file="lifestyle-1.png" alt="" />
      </div>
      {third === 'logo' ? (
        <div className="relative w-[96px] h-[96px]">
          <Asset file="website-capture-01.png" alt="SoyTechno" />
        </div>
      ) : (
        <div className="relative w-[96px] h-[96px] rounded-full overflow-hidden">
          <Asset file="lifestyle-f.jpg" alt="SoyTechno" className="object-cover" />
        </div>
      )}
    </div>
  );
}

export default function SoyTechnoFigmaBody() {
  return (
    <div className="bg-[#FEF7FF] text-[#4A4453]">
      <div className="max-w-[1200px] mx-auto px-[20px] md:px-0 pt-10">
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

      {/* Hero */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-0">
        <div className="bg-[#FFFBFF] rounded-[36px] px-6 py-16 md:px-[80px] md:py-[100px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h1 className="font-paytone text-[36px] md:text-[47px] leading-[1.2] text-[#4A4453] mb-10">
                {FIGMA.heroTitle}
              </h1>
              <p className="font-sans text-[18px] leading-[1.5] mb-6">{FIGMA.heroP1}</p>
              <p className="font-sans text-[18px] leading-[1.5]">{FIGMA.heroP2}</p>
            </div>
            <div className="relative h-[500px] md:h-[540px] w-full max-w-[560px] mx-auto lg:ml-auto">
              <WordmarkCard className="absolute left-[4%] top-[28%] w-[64%] h-[40%] rounded-[20px] z-10" />
              <div className="absolute left-[40%] top-[12%] w-[220px] h-[220px] rounded-full overflow-hidden ring-4 ring-white z-20">
                <Asset file="lifestyle-f.jpg" alt="SoyTechno" className="object-cover" />
              </div>
              <div className="absolute left-[44%] top-0 w-[80px] h-[80px] z-30">
                <Asset file="cashea-badge.png" alt="Cashea" />
              </div>
              <div className="absolute left-[68%] top-[6%] w-[56px] h-[56px] z-30">
                <Asset file="delivery-icon-3.png" alt="" className="object-contain brightness-0" />
              </div>
              <div className="absolute left-[8%] top-[60%] w-[96px] h-[96px] z-30">
                <Asset file="lifestyle-1.png" alt="" />
              </div>
              <div className="absolute left-[30%] top-[64%] w-[128px] h-[128px] z-30">
                <Asset file="lifestyle-i.png" alt="Productos 100% originales" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Desafío */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-0 pt-[140px]">
        <SectionTitle>{FIGMA.desafioTitle}</SectionTitle>
        <Lead>{FIGMA.desafioLead}</Lead>
        <BrandMarks third="logo" />
        <div className="bg-[#FFFBFF] rounded-[36px] p-8 md:p-[80px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-10">
              {FIGMA.desafioItems.map((item) => (
                <Feature key={item.title} title={item.title} body={item.body} />
              ))}
            </div>
            <div className="flex flex-col items-center gap-8">
              <div className="relative w-full h-[200px] rounded-[20px] overflow-hidden bg-[#071642]">
                <Asset file="circuito.png" alt="" className="object-cover opacity-40 invert" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-[140px] h-[140px]">
                    <Asset file="website-capture-01.png" alt="SoyTechno" />
                  </div>
                </div>
              </div>
              <div className="relative w-full max-w-[300px]">
                <IPhoneFrame screen="iphone-frame-01.png" alt="Catálogo móvil SoyTechno" />
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-[80px] items-center">
          <div className="relative w-full aspect-[918/560]">
            <Asset file="rectangle-147.gif" alt="Catálogo SoyTechno" />
          </div>
          <div className="relative w-full h-[360px] md:h-[420px] rounded-[36px] overflow-hidden bg-[#071642]">
            <Asset file="circuito.png" alt="" className="object-cover opacity-40 invert" />
            <div className="absolute inset-0 flex items-end justify-center gap-4 p-8">
              <div className="relative w-[26%] h-[68%]">
                <Asset file="electrodomesticos-01.png" alt="" />
              </div>
              <div className="relative w-[42%] h-[78%]">
                <Asset file="electrodomesticos-02.png" alt="" />
              </div>
              <div className="relative w-[26%] h-[68%]">
                <Asset file="electrodomesticos-03.png" alt="" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 md:px-0 pt-[140px]">
        <SectionTitle>{FIGMA.checkoutTitle}</SectionTitle>
        <Lead>{FIGMA.checkoutLead}</Lead>
        <BrandMarks third="people" />
      </section>

      <section className="max-w-[1200px] mx-auto px-4 md:px-0 pt-[100px]">
        <SectionTitle>{FIGMA.uxTitle}</SectionTitle>
        <Lead>{FIGMA.uxLead}</Lead>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 md:px-0 pt-[100px]">
        <Pill>{FIGMA.archPill}</Pill>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mt-16">
          <div className="relative w-full aspect-[827/1134]">
            <Asset file="giffycanvas-01.gif" alt="Ficha de producto" />
          </div>
          <div className="space-y-10">
            {FIGMA.archItems.map((item) => (
              <Feature key={item.title} title={item.title} body={item.body} />
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 md:px-0 pt-[120px]">
        <Pill>{FIGMA.visualPill}</Pill>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start mt-16">
          <div className="space-y-8">
            {FIGMA.swatches.map((swatch, index) => (
              <div
                key={swatch.name}
                className="rounded-[20px] p-7 text-white min-h-[180px] flex flex-col justify-between"
                style={{ backgroundColor: swatch.hex }}
              >
                <p className="font-sans font-bold text-[16px] whitespace-pre-line">{swatch.meta}</p>
                {index === 0 && (
                  <div className="relative w-14 h-14 mt-4">
                    <img src={img('shipping-national.svg')} alt="" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="space-y-8">
            <div className="relative w-full max-w-[320px] mx-auto">
              <div className="relative w-full aspect-[353/647]">
                <Asset file="iphone-mockup.gif" alt="Interfaz SoyTechno" />
              </div>
            </div>
            <CircuitPanel className="w-full h-[200px] rounded-[20px]" />
          </div>
          <div className="space-y-10">
            <WordmarkCard className="w-full h-[180px] rounded-[20px]" />
            {FIGMA.visualItems.map((item) => (
              <Feature key={item.title} title={item.title} body={item.body} />
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 md:px-0 pt-[120px]">
        <Pill>{FIGMA.emptyPill}</Pill>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mt-16">
          <div className="relative w-full aspect-[827/1134]">
            <Asset file="giffycanvas-01.gif" alt="Pantallas vacías" />
          </div>
          <div className="space-y-10">
            {FIGMA.emptyItems.map((item) => (
              <Feature key={item.title} title={item.title} body={item.body} />
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 md:px-0 pt-[120px]">
        <SectionTitle>{FIGMA.checkoutTitle}</SectionTitle>
        <Lead>{FIGMA.checkoutLead}</Lead>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 md:px-0 pt-[100px]">
        <Pill>{FIGMA.casheaPill}</Pill>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mt-16">
          <div className="space-y-10">
            <h3 className="font-paytone text-[28px] md:text-[36px] leading-[1.2] text-[#4A4453]">
              {FIGMA.casheaTitle}
            </h3>
            <p className="font-sans text-[18px] leading-[1.5]">{FIGMA.casheaLead}</p>
            {FIGMA.casheaItems.map((item) => (
              <Feature key={item.title} title={item.title} body={item.body} />
            ))}
          </div>
          <div className="relative w-full aspect-[729/1000]">
            <Asset file="giffycanvas-02.gif" alt="Integración Cashea" />
          </div>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 md:px-0 pt-[120px]">
        <Pill>{FIGMA.wizardPill}</Pill>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mt-16">
          <IPadFrame screen="ipad-mockup-01.png" alt="Checkout wizard" />
          <div className="space-y-10">
            <p className="font-sans text-[18px] leading-[1.5]">{FIGMA.wizardLead}</p>
            {FIGMA.wizardItems.map((item) => (
              <Feature key={item.title} title={item.title} body={item.body} />
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 md:px-0 pt-[120px]">
        <Pill>{FIGMA.logisticsPill}</Pill>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mt-16">
          <div className="space-y-10">
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
          <div className="relative">
            <div className="absolute left-1/2 -translate-x-1/2 -top-6 w-[56%] z-10 rounded-[12px] overflow-hidden bg-white shadow-md">
              <div className="relative w-full aspect-[16/10]">
                <Asset file="rectangle-144.jpg" alt="Envíos a nivel nacional" className="object-contain" />
              </div>
            </div>
            <div className="pt-16">
              <IMacComposite />
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 md:px-0 pt-[140px]">
        <SectionTitle>{FIGMA.resultsTitle}</SectionTitle>
        <Lead>{FIGMA.resultsLead}</Lead>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {FIGMA.resultCards.map((card) => (
            <div key={card.title} className="bg-[#EADDFF] rounded-[36px] p-10 min-h-[300px]">
              <h3 className="font-sans font-bold text-[20px] leading-[1.4] text-[#4A4453] mb-5">
                {card.title}
              </h3>
              <p className="font-sans text-[18px] leading-[1.5] text-[#4A4453]">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 md:px-0 pt-[120px]">
        <div className="flex flex-wrap justify-center items-end gap-6 md:gap-8">
          {['mobile-screen-01.png', 'mobile-screen-02.png', 'mobile-screen-03.png'].map((file) => (
            <div key={file} className="w-[240px] md:w-[300px]">
              <IPhoneFrame screen={file} alt="Pantalla móvil SoyTechno" />
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 md:px-0 pt-[120px]">
        <div className="bg-[#FFDAD6] rounded-[36px] px-8 py-16 md:px-16 md:py-[100px] relative overflow-hidden">
          <img
            src={img('quote-background.svg')}
            alt=""
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          />
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-12 items-center relative z-10">
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

      <section className="max-w-[1200px] mx-auto px-4 md:px-0 pt-[100px] pb-[120px]">
        <div className="bg-[#B3FFF3] rounded-[36px] px-8 py-16 md:px-16 md:py-[100px] overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative w-full h-[320px] md:h-[420px]">
              <Asset file="cta-illustration.png" alt="" />
            </div>
            <div className="text-center lg:text-left">
              <h2 className="font-paytone text-[32px] md:text-[47px] leading-[1.2] text-[#453A53] mb-8">
                {FIGMA.ctaTitle}
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
        </div>
      </section>
    </div>
  );
}
