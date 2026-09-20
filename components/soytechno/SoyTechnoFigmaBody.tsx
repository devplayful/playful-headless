import Image from 'next/image';
import { FIGMA } from '@/utils/soytechno-figma-copy';

const A = '/images/casos/soytechno';

function img(file: string) {
  return `${A}/${file}`;
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
      unoptimized={src.endsWith('.gif')}
    />
  );
}

function Abs({
  x,
  y,
  w,
  h,
  className,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`absolute ${className || ''}`} style={{ left: x, top: y, width: w, height: h }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-paytone text-[47px] leading-[1.2] text-[#4A4453] text-center max-w-[920px] mx-auto">
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

/** Figma chapter bar: 1200 × 128, radius 36, 40px vertical padding. Not a pill. */
function ChapterBar({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mx-auto hidden lg:flex items-center justify-center bg-[#EADDFF] rounded-[36px] px-10"
      style={{ width: 1200, height: 128 }}
    >
      <h2 className="font-paytone text-[32px] leading-[1.2] text-[#4A4453] text-center">{children}</h2>
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
      <h3 className="font-sans font-bold text-[22px] leading-[1.35] text-[#4A4453]">{title}</h3>
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

function IPhoneFrame({ screen, alt }: { screen: string; alt: string }) {
  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-x-[3.6%] top-[1.8%] bottom-[1.8%] overflow-hidden rounded-[18%/9%] bg-black">
        <Asset file={screen} alt={alt} className="object-cover object-top" />
      </div>
      <div className="absolute inset-0 z-10 pointer-events-none">
        <Asset file="iphone-frame-02.png" alt="" className="object-contain" />
      </div>
    </div>
  );
}

function IPadFrame({ screen, alt }: { screen: string; alt: string }) {
  return (
    <div className="relative w-full h-full">
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
    <div className="relative w-full h-full">
      <Asset file="rectangle-148.png" alt="" className="object-contain" />
      <div className="absolute left-[5%] top-[3.2%] w-[90%] h-[46%] overflow-hidden rounded-sm">
        <Image src={img('rectangle-146.png')} alt="Rastreo MRW" fill className="object-cover object-top" sizes="40vw" />
      </div>
    </div>
  );
}

function BrandMarks({ third }: { third: 'circuit' | 'people' }) {
  return (
    <div className="relative mx-auto hidden lg:block mt-16 mb-20" style={{ width: 448, height: 112 }}>
      <Abs x={0} y={8} w={96} h={96}>
        <Asset file="lifestyle-i.png" alt="100% originales" />
      </Abs>
      <Abs x={176} y={8} w={96} h={96}>
        <Asset file="lifestyle-1.png" alt="" />
      </Abs>
      <Abs x={352} y={8} w={96} h={96}>
        {third === 'circuit' ? (
          <div className="relative w-full h-full rounded-full bg-[#0063FC] overflow-hidden">
            <Asset file="lifestyle-f-alt.png" alt="SoyTechno" className="object-contain p-3" />
          </div>
        ) : (
          <div className="relative w-full h-full rounded-full overflow-hidden">
            <Asset file="lifestyle-f.jpg" alt="SoyTechno" className="object-cover object-[60%_30%]" />
          </div>
        )}
      </Abs>
    </div>
  );
}

function ChromaCard({
  bg,
  ink,
  name,
  meta,
  icon,
}: {
  bg: string;
  ink: string;
  name: string;
  meta: string;
  icon: string;
}) {
  return (
    <div className="relative w-full h-full rounded-[20px] overflow-hidden px-8 pt-8" style={{ backgroundColor: bg, color: ink }}>
      <p className="font-sans font-bold text-[18px] leading-[1.25]">{name}</p>
      <p className="font-sans font-bold text-[18px] leading-[1.35] whitespace-pre-line mt-2">{meta}</p>
      <div className="absolute left-1/2 -translate-x-1/2 bottom-8 w-[168px] h-[168px]">
        <img src={img(icon)} alt="" className="w-full h-full object-contain" />
      </div>
    </div>
  );
}

export default function SoyTechnoFigmaBody() {
  return (
    <div className="bg-[#FEF7FF] text-[#4A4453]">
      <div className="max-w-[1200px] mx-auto px-[20px] lg:px-0 pt-10">
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

      {/* 1. Hero — 1200×656 lavender card; title column 560px → 3 lines */}
      <section className="max-w-[1200px] mx-auto">
        <div
          id="soytechno-hero"
          className="relative mx-auto hidden lg:block bg-[#EADDFF] rounded-[36px]"
          style={{ width: 1200, height: 656 }}
        >
          <Abs x={80} y={88} w={560}>
            <h1 className="font-paytone text-[47px] leading-[1.2] text-[#4A4453] mb-10">{FIGMA.heroTitle}</h1>
            <p className="font-sans text-[18px] leading-[1.5] mb-6">{FIGMA.heroP1}</p>
            <p className="font-sans text-[18px] leading-[1.5]">{FIGMA.heroP2}</p>
          </Abs>
          <Abs x={680} y={48} w={480} h={560}>
            <div className="absolute left-[8%] top-[30%] w-[72%] h-[42%] rounded-[20px] overflow-hidden bg-[#00193F] z-10">
              <Asset file="circuito.png" alt="" className="object-cover opacity-40 invert" />
              <div className="absolute inset-0 flex items-center justify-center px-8">
                <Image
                  src={img('soytechno-logo-white.png')}
                  alt="SoyTechno"
                  width={280}
                  height={50}
                  className="object-contain w-[88%] h-auto"
                />
              </div>
            </div>
            <div className="absolute left-[46%] top-[10%] w-[210px] h-[210px] rounded-full overflow-hidden ring-4 ring-white z-20">
              <Asset file="lifestyle-f.jpg" alt="SoyTechno" className="object-cover object-[55%_28%]" />
            </div>
            <div className="absolute left-[50%] top-0 w-[76px] h-[76px] z-30">
              <Asset file="cashea-badge.png" alt="Cashea" />
            </div>
            <div className="absolute left-[74%] top-[4%] w-[64px] h-[64px] z-30">
              <Asset file="delivery-icon-3.png" alt="" />
            </div>
            <div className="absolute left-[12%] top-[66%] w-[92px] h-[92px] z-30">
              <Asset file="lifestyle-1.png" alt="" />
            </div>
            <div className="absolute left-[36%] top-[68%] w-[120px] h-[120px] z-30">
              <Asset file="lifestyle-i.png" alt="Productos 100% originales" />
            </div>
          </Abs>
        </div>
      </section>

      {/* 2. Desafío — ONE 1200×1196 lavender 2×2 */}
      <section className="max-w-[1200px] mx-auto pt-[120px]">
        <SectionTitle>{FIGMA.desafioTitle}</SectionTitle>
        <Lead>{FIGMA.desafioLead}</Lead>
        <BrandMarks third="circuit" />
        <div
          id="soytechno-desafio"
          className="relative mx-auto hidden lg:block bg-[#EADDFF] rounded-[36px]"
          style={{ width: 1200, height: 1196 }}
        >
          <Abs x={64} y={64} w={520}>
            <div className="space-y-10">
              {FIGMA.desafioItems.map((item) => (
                <Feature key={item.title} title={item.title} body={item.body} />
              ))}
            </div>
          </Abs>
          <Abs x={640} y={64} w={496} h={200} className="rounded-[20px] overflow-hidden bg-[#0063FC]">
            <Asset file="circuito.png" alt="" className="object-cover opacity-30 invert" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-[148px] h-[148px] rounded-full overflow-hidden bg-[#00193F]">
                <Asset file="website-capture-01.png" alt="SoyTechno" />
              </div>
            </div>
          </Abs>
          <Abs x={760} y={284} w={280} h={514}>
            <IPhoneFrame screen="iphone-frame-01.png" alt="Catálogo móvil SoyTechno" />
          </Abs>
          <Abs x={48} y={680} w={580} h={460}>
            <Asset file="rectangle-147.gif" alt="Catálogo SoyTechno" />
          </Abs>
          <Abs x={656} y={820} w={480} h={320} className="rounded-[36px] overflow-hidden bg-[#00193F]">
            <Asset file="circuito.png" alt="" className="object-cover opacity-40 invert" />
            <div className="absolute inset-0 flex items-end justify-center gap-4 p-6">
              <div className="relative w-[26%] h-[70%]">
                <Asset file="electrodomesticos-01.png" alt="" />
              </div>
              <div className="relative w-[42%] h-[80%]">
                <Asset file="electrodomesticos-02.png" alt="" />
              </div>
              <div className="relative w-[26%] h-[70%]">
                <Asset file="electrodomesticos-03.png" alt="" />
              </div>
            </div>
          </Abs>
        </div>
      </section>

      <section className="max-w-[1200px] mx-auto pt-[140px]">
        <SectionTitle>{FIGMA.checkoutTitle}</SectionTitle>
        <Lead>{FIGMA.checkoutLead}</Lead>
        <BrandMarks third="people" />
      </section>

      <section className="max-w-[1200px] mx-auto pt-[100px]">
        <SectionTitle>{FIGMA.uxTitle}</SectionTitle>
        <Lead>{FIGMA.uxLead}</Lead>
      </section>

      {/* 4. A — iPad 650×892 */}
      <section className="max-w-[1200px] mx-auto pt-[100px]">
        <ChapterBar>{FIGMA.archPill}</ChapterBar>
        <div
          id="soytechno-section-a"
          className="relative mx-auto hidden lg:block mt-16"
          style={{ width: 1200, height: 892 }}
        >
          <Abs x={0} y={0} w={650} h={892}>
            <Asset file="giffycanvas-01.gif" alt="Ficha de producto" />
          </Abs>
          <Abs x={690} y={40} w={510}>
            <div className="space-y-10">
              {FIGMA.archItems.map((item) => (
                <Feature key={item.title} title={item.title} body={item.body} />
              ))}
            </div>
          </Abs>
        </div>
      </section>

      {/* 5. B — 1200×1400, cards 336×408, phone 353×856 */}
      <section className="max-w-[1200px] mx-auto pt-[120px]">
        <ChapterBar>{FIGMA.visualPill}</ChapterBar>
        <div
          id="soytechno-section-b"
          className="relative mx-auto hidden lg:block bg-[#EADDFF] rounded-[36px] mt-16"
          style={{ width: 1200, height: 1400 }}
        >
          {FIGMA.swatches.map((swatch, i) => (
            <Abs key={swatch.name} x={48} y={48 + i * 448} w={336} h={408}>
              <ChromaCard bg={swatch.card} ink={swatch.ink} name={swatch.name} meta={swatch.meta} icon={swatch.icon} />
            </Abs>
          ))}
          <Abs x={424} y={48} w={353} h={856}>
            <Asset file="iphone-mockup.gif" alt="Interfaz SoyTechno" />
          </Abs>
          <Abs x={424} y={944} w={336} h={408} className="rounded-[20px] overflow-hidden bg-[#0063FC]">
            <Asset file="circuito.png" alt="Circuito" className="object-cover opacity-40 invert" />
            <span className="absolute left-6 top-5 font-sans font-bold text-white text-[18px]">Circuito</span>
          </Abs>
          <Abs x={817} y={48} w={335} h={200} className="rounded-[20px] overflow-hidden bg-[#003896]">
            <Asset file="circuito.png" alt="" className="object-cover opacity-35 invert" />
            <div className="absolute inset-0 flex items-center justify-center px-8">
              <Image
                src={img('soytechno-logo-white.png')}
                alt="SoyTechno"
                width={260}
                height={46}
                className="object-contain w-[82%] h-auto"
              />
            </div>
          </Abs>
          <Abs x={817} y={272} w={335} h={1080}>
            <div className="flex flex-col justify-between h-full py-2">
              {FIGMA.visualItems.map((item) => (
                <Feature key={item.title} title={item.title} body={item.body} />
              ))}
            </div>
          </Abs>
        </div>
      </section>

      {/* 6. C — iPad 650×892 */}
      <section className="max-w-[1200px] mx-auto pt-[120px]">
        <ChapterBar>{FIGMA.emptyPill}</ChapterBar>
        <div
          id="soytechno-section-c"
          className="relative mx-auto hidden lg:block mt-16"
          style={{ width: 1200, height: 892 }}
        >
          <Abs x={0} y={0} w={650} h={892}>
            <Asset file="giffycanvas-01.gif" alt="Pantallas vacías" />
          </Abs>
          <Abs x={690} y={80} w={510}>
            <div className="space-y-12">
              {FIGMA.emptyItems.map((item) => (
                <Feature key={item.title} title={item.title} body={item.body} />
              ))}
            </div>
          </Abs>
        </div>
      </section>

      {/* 7. Separator + second Ingeniería */}
      <section className="max-w-[1200px] mx-auto pt-[120px]">
        <hr className="border-0 border-t border-[#D0C4DE] mb-[120px]" />
        <SectionTitle>{FIGMA.checkoutTitle}</SectionTitle>
        <Lead>{FIGMA.checkoutLead}</Lead>
      </section>

      {/* 8. Cashea — text 520 / GIF 620×850 */}
      <section className="max-w-[1200px] mx-auto pt-[100px]">
        <ChapterBar>{FIGMA.casheaPill}</ChapterBar>
        <div
          id="soytechno-cashea"
          className="relative mx-auto hidden lg:block mt-16"
          style={{ width: 1200, height: 900 }}
        >
          <Abs x={0} y={20} w={520}>
            <h3 className="font-paytone text-[36px] leading-[1.2] text-[#4A4453] mb-8">{FIGMA.casheaTitle}</h3>
            <p className="font-sans text-[18px] leading-[1.5] mb-10">{FIGMA.casheaLead}</p>
            <div className="space-y-10">
              {FIGMA.casheaItems.map((item) => (
                <Feature key={item.title} title={item.title} body={item.body} />
              ))}
            </div>
          </Abs>
          <Abs x={560} y={0} w={640} h={878}>
            <Asset file="giffycanvas-02.gif" alt="Integración Cashea" />
          </Abs>
        </div>
      </section>

      {/* 8. Wizard — iPad 650×469 + copy */}
      <section className="max-w-[1200px] mx-auto pt-[120px]">
        <ChapterBar>{FIGMA.wizardPill}</ChapterBar>
        <div
          id="soytechno-wizard"
          className="relative mx-auto hidden lg:block mt-16"
          style={{ width: 1200, height: 720 }}
        >
          <Abs x={0} y={20} w={650} h={469}>
            <IPadFrame screen="ipad-mockup-01.png" alt="Checkout wizard" />
          </Abs>
          <Abs x={690} y={20} w={510}>
            <p className="font-sans text-[18px] leading-[1.5] mb-10">{FIGMA.wizardLead}</p>
            <div className="space-y-10">
              {FIGMA.wizardItems.map((item) => (
                <Feature key={item.title} title={item.title} body={item.body} />
              ))}
            </div>
          </Abs>
        </div>
      </section>

      {/* 8. Logística — copy 520 / iMac 620×640 */}
      <section className="max-w-[1200px] mx-auto pt-[120px]">
        <ChapterBar>{FIGMA.logisticsPill}</ChapterBar>
        <div
          id="soytechno-logistics"
          className="relative mx-auto hidden lg:block mt-16"
          style={{ width: 1200, height: 760 }}
        >
          <Abs x={0} y={40} w={520}>
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
          </Abs>
          <Abs x={560} y={0} w={640} h={760}>
            <Abs x={150} y={0} w={340} h={210} className="z-10 rounded-[12px] overflow-hidden bg-white shadow-md">
              <Asset file="rectangle-144.jpg" alt="Envíos a nivel nacional" className="object-contain" />
            </Abs>
            <Abs x={30} y={160} w={580} h={523}>
              <IMacComposite />
            </Abs>
          </Abs>
        </div>
      </section>

      {/* 9. Results — 384×380 cards */}
      <section className="max-w-[1200px] mx-auto pt-[140px]">
        <SectionTitle>{FIGMA.resultsTitle}</SectionTitle>
        <Lead>{FIGMA.resultsLead}</Lead>
        <div
          id="soytechno-results"
          className="relative mx-auto hidden lg:block mt-16"
          style={{ width: 1200, height: 380 }}
        >
          {FIGMA.resultCards.map((card, i) => (
            <Abs key={card.title} x={i * 408} y={0} w={384} h={380} className="bg-[#EADDFF] rounded-[36px] p-10">
              <h3 className="font-sans font-bold text-[20px] leading-[1.4] text-[#4A4453] mb-5">{card.title}</h3>
              <p className="font-sans text-[18px] leading-[1.5] text-[#4A4453]">{card.body}</p>
            </Abs>
          ))}
        </div>
      </section>

      {/* 9. Phones — 367×756, 4th screen peeking from the left */}
      <section className="max-w-[1200px] mx-auto pt-[120px]">
        <div
          id="soytechno-phones"
          className="relative mx-auto hidden lg:block overflow-hidden"
          style={{ width: 1200, height: 756 }}
        >
          <Abs x={-349} y={0} w={367} h={756}>
            <IPhoneFrame screen="mobile-screen-04.png" alt="" />
          </Abs>
          <Abs x={46} y={0} w={367} h={756}>
            <IPhoneFrame screen="mobile-screen-01.png" alt="Pantalla móvil SoyTechno" />
          </Abs>
          <Abs x={432} y={0} w={367} h={756}>
            <IPhoneFrame screen="mobile-screen-02.png" alt="Pantalla móvil SoyTechno" />
          </Abs>
          <Abs x={818} y={0} w={367} h={756}>
            <IPhoneFrame screen="mobile-screen-03.png" alt="Pantalla móvil SoyTechno" />
          </Abs>
        </div>
      </section>

      {/* 10. Testimonial — 1200×600, 120px padding */}
      <section className="max-w-[1200px] mx-auto pt-[120px]">
        <div
          id="soytechno-testimonial"
          className="relative mx-auto hidden lg:block bg-[#FFDAD6] rounded-[36px] overflow-hidden"
          style={{ width: 1200, height: 600 }}
        >
          <img src={img('quote-background.svg')} alt="" className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
          <Abs x={120} y={120} w={220} h={360}>
            <div className="relative w-[160px] h-[160px] rounded-full overflow-hidden mx-auto mb-8">
              <Asset file="testimonial-avatar.png" alt={FIGMA.testimonialName} className="object-cover" />
            </div>
            <p className="font-paytone text-[32px] text-[#2A0064] text-center">{FIGMA.testimonialName}</p>
            <p className="font-sans text-[18px] text-[#2A0064]/80 text-center mt-2">{FIGMA.testimonialRole}</p>
          </Abs>
          <Abs x={380} y={200} w={700}>
            <p className="font-sans italic text-[24px] leading-[1.5] text-[#2A0064] text-center">
              “{FIGMA.testimonialQuote}”
            </p>
          </Abs>
        </div>
      </section>

      {/* 11. CTA — 1200×650, title 2 lines */}
      <section className="max-w-[1200px] mx-auto pt-[100px] pb-[120px]">
        <div
          id="soytechno-cta"
          className="relative mx-auto hidden lg:block bg-[#B3FFF3] rounded-[36px] overflow-hidden"
          style={{ width: 1200, height: 650 }}
        >
          <Abs x={40} y={80} w={480} h={490}>
            <Asset file="cta-illustration.png" alt="" />
          </Abs>
          <Abs x={540} y={140} w={600}>
            <h2 className="font-paytone text-[47px] leading-[1.2] text-[#453A53] mb-8">
              ¿Tu E-commerce está listo
              <br />
              para el nivel de un Web App?
            </h2>
            <p className="font-sans text-[18px] leading-[1.5] text-[#453A53] mb-10">{FIGMA.ctaBody}</p>
            <a
              href={FIGMA.ctaHref}
              className="inline-block bg-[#440099] text-white font-sans font-semibold py-3 px-8 rounded-full no-underline"
            >
              {FIGMA.ctaButton}
            </a>
          </Abs>
        </div>
      </section>
    </div>
  );
}
