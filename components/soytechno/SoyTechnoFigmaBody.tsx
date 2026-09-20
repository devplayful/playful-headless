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

/** Locked Figma board: pixel positions at 1200-wide desktop. Hidden below lg. */
function Board({
  w,
  h,
  className,
  id,
  children,
}: {
  w: number;
  h: number;
  className?: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      className={`relative mx-auto hidden lg:block ${className || ''}`}
      style={{ width: w, height: h }}
    >
      {children}
    </div>
  );
}

function Pin({
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
  children: React.ReactNode;
}) {
  return (
    <div className={`absolute ${className || ''}`} style={{ left: x, top: y, width: w, height: h }}>
      {children}
    </div>
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
      <h3 className="font-sans font-bold text-[18px] md:text-[22px] leading-[1.35] text-[#4A4453]">
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

function WordmarkCard({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-[#00193F] ${className || ''}`}>
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
    <div className="relative w-full h-full">
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

function BrandMarks({ third }: { third: 'logo' | 'people' }) {
  return (
    <div className="relative mx-auto mt-16 mb-20 hidden lg:block" style={{ width: 420, height: 96 }}>
      <Pin x={0} y={0} w={96} h={96}>
        <Asset file="lifestyle-i.png" alt="100% originales" />
      </Pin>
      <Pin x={162} y={0} w={96} h={96}>
        <Asset file="lifestyle-1.png" alt="" />
      </Pin>
      <Pin x={324} y={0} w={96} h={96}>
        {third === 'logo' ? (
          <Asset file="website-capture-01.png" alt="SoyTechno" />
        ) : (
          <div className="relative w-full h-full rounded-full overflow-hidden">
            <Asset file="lifestyle-f.jpg" alt="SoyTechno" className="object-cover" />
          </div>
        )}
      </Pin>
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
    <div
      className="relative w-full h-full rounded-[20px] overflow-hidden px-6 pt-5"
      style={{ backgroundColor: bg, color: ink }}
    >
      <p className="font-sans font-bold text-[15px] leading-[1.25] tracking-[0.01em]">{name}</p>
      <p className="font-sans font-bold text-[15px] leading-[1.3] whitespace-pre-line mt-1">{meta}</p>
      <div className="absolute left-1/2 -translate-x-1/2 bottom-[22px] w-[140px] h-[140px]">
        <img src={img(icon)} alt="" className="w-full h-full object-contain" />
      </div>
    </div>
  );
}

/** Section B — one closed Figma composition, not a 3-col grid. */
function SectionBComposition() {
  const W = 1200;
  const pad = 44;
  const cardW = 336;
  const cardH = 304;
  const gap = 40;
  const phoneW = 353;
  const phoneH = 648;
  const leftX = pad;
  const phoneX = pad + cardW + gap;
  const rightX = phoneX + phoneW + gap;
  const rightW = W - pad - rightX;
  const y1 = pad;
  const y2 = pad + cardH + gap;
  const y3 = pad + (cardH + gap) * 2;
  const H = y3 + cardH + pad;

  return (
    <Board id="soytechno-section-b" w={W} h={H} className="bg-[#EADDFF] rounded-[36px]">
      {FIGMA.swatches.map((swatch, i) => (
        <Pin key={swatch.name} x={leftX} y={[y1, y2, y3][i]} w={cardW} h={cardH}>
          <ChromaCard
            bg={swatch.card}
            ink={swatch.ink}
            name={swatch.name}
            meta={swatch.meta}
            icon={swatch.icon}
          />
        </Pin>
      ))}

      <Pin x={phoneX} y={y1} w={phoneW} h={phoneH}>
        <Asset file="iphone-mockup.gif" alt="Interfaz SoyTechno" />
      </Pin>

      <Pin x={phoneX} y={y3} w={cardW} h={cardH} className="rounded-[20px] overflow-hidden bg-[#0063FC]">
        <Asset file="circuito.png" alt="Circuito" className="object-cover opacity-40 invert" />
        <span className="absolute left-5 top-4 font-sans font-bold text-white text-[16px]">Circuito</span>
      </Pin>

      <Pin x={rightX} y={y1} w={rightW} h={200} className="rounded-[20px] overflow-hidden bg-[#003896]">
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
      </Pin>

      <Pin x={rightX} y={y1 + 200 + 24} w={rightW} h={H - (y1 + 200 + 24) - pad}>
        <div className="flex flex-col justify-between h-full">
          {FIGMA.visualItems.map((item) => (
            <Feature key={item.title} title={item.title} body={item.body} />
          ))}
        </div>
      </Pin>
    </Board>
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

      {/* Hero — text + overlapping collage as one board */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-0">
        <div className="bg-[#FFFBFF] rounded-[36px] overflow-hidden">
          <Board w={1200} h={620} className="px-0">
            <Pin x={80} y={90} w={520}>
              <h1 className="font-paytone text-[47px] leading-[1.2] text-[#4A4453] mb-10">
                {FIGMA.heroTitle}
              </h1>
              <p className="font-sans text-[18px] leading-[1.5] mb-6">{FIGMA.heroP1}</p>
              <p className="font-sans text-[18px] leading-[1.5]">{FIGMA.heroP2}</p>
            </Pin>
            <Pin x={640} y={40} w={520} h={540}>
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
            </Pin>
          </Board>
          <div className="lg:hidden px-6 py-16">
            <h1 className="font-paytone text-[36px] leading-[1.2] text-[#4A4453] mb-8">{FIGMA.heroTitle}</h1>
            <p className="font-sans text-[18px] leading-[1.5] mb-6">{FIGMA.heroP1}</p>
            <p className="font-sans text-[18px] leading-[1.5]">{FIGMA.heroP2}</p>
          </div>
        </div>
      </section>

      {/* Desafío */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-0 pt-[140px]">
        <SectionTitle>{FIGMA.desafioTitle}</SectionTitle>
        <Lead>{FIGMA.desafioLead}</Lead>
        <BrandMarks third="logo" />
        <div className="bg-[#FFFBFF] rounded-[36px] overflow-hidden">
          <Board w={1200} h={860}>
            <Pin x={80} y={80} w={520}>
              <div className="space-y-10">
                {FIGMA.desafioItems.map((item) => (
                  <Feature key={item.title} title={item.title} body={item.body} />
                ))}
              </div>
            </Pin>
            <Pin x={680} y={80} w={440} h={180} className="rounded-[20px] overflow-hidden bg-[#00193F]">
              <Asset file="circuito.png" alt="" className="object-cover opacity-40 invert" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-[140px] h-[140px]">
                  <Asset file="website-capture-01.png" alt="SoyTechno" />
                </div>
              </div>
            </Pin>
            <Pin x={790} y={280} w={220}>
              <IPhoneFrame screen="iphone-frame-01.png" alt="Catálogo móvil SoyTechno" />
            </Pin>
          </Board>
        </div>
        <Board w={1200} h={480} className="mt-[80px]">
          <Pin x={0} y={20} w={620} h={380}>
            <Asset file="rectangle-147.gif" alt="Catálogo SoyTechno" />
          </Pin>
          <Pin x={660} y={20} w={540} h={400} className="rounded-[36px] overflow-hidden bg-[#00193F]">
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
          </Pin>
        </Board>
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

      {/* A — iPad + copy locked */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-0 pt-[100px]">
        <Pill>{FIGMA.archPill}</Pill>
        <Board w={1200} h={920} className="mt-16">
          <Pin x={0} y={0} w={560} h={768}>
            <Asset file="giffycanvas-01.gif" alt="Ficha de producto" />
          </Pin>
          <Pin x={600} y={40} w={600}>
            <div className="space-y-10">
              {FIGMA.archItems.map((item) => (
                <Feature key={item.title} title={item.title} body={item.body} />
              ))}
            </div>
          </Pin>
        </Board>
      </section>

      {/* B */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-0 pt-[120px]">
        <Pill>{FIGMA.visualPill}</Pill>
        <div className="mt-16">
          <SectionBComposition />
        </div>
      </section>

      {/* C — iPad + copy locked */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-0 pt-[120px]">
        <Pill>{FIGMA.emptyPill}</Pill>
        <Board w={1200} h={920} className="mt-16">
          <Pin x={0} y={0} w={560} h={768}>
            <Asset file="giffycanvas-01.gif" alt="Pantallas vacías" />
          </Pin>
          <Pin x={600} y={80} w={600}>
            <div className="space-y-10">
              {FIGMA.emptyItems.map((item) => (
                <Feature key={item.title} title={item.title} body={item.body} />
              ))}
            </div>
          </Pin>
        </Board>
      </section>

      <section className="max-w-[1200px] mx-auto px-4 md:px-0 pt-[120px]">
        <SectionTitle>{FIGMA.checkoutTitle}</SectionTitle>
        <Lead>{FIGMA.checkoutLead}</Lead>
      </section>

      {/* Cashea — copy + iPad locked */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-0 pt-[100px]">
        <Pill>{FIGMA.casheaPill}</Pill>
        <Board w={1200} h={900} className="mt-16">
          <Pin x={0} y={20} w={540}>
            <h3 className="font-paytone text-[36px] leading-[1.2] text-[#4A4453] mb-8">{FIGMA.casheaTitle}</h3>
            <p className="font-sans text-[18px] leading-[1.5] mb-8">{FIGMA.casheaLead}</p>
            <div className="space-y-10">
              {FIGMA.casheaItems.map((item) => (
                <Feature key={item.title} title={item.title} body={item.body} />
              ))}
            </div>
          </Pin>
          <Pin x={580} y={0} w={620} h={850}>
            <Asset file="giffycanvas-02.gif" alt="Integración Cashea" />
          </Pin>
        </Board>
      </section>

      {/* Wizard */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-0 pt-[120px]">
        <Pill>{FIGMA.wizardPill}</Pill>
        <Board w={1200} h={720} className="mt-16">
          <Pin x={0} y={40} w={560} h={404}>
            <IPadFrame screen="ipad-mockup-01.png" alt="Checkout wizard" />
          </Pin>
          <Pin x={600} y={40} w={600}>
            <p className="font-sans text-[18px] leading-[1.5] mb-8">{FIGMA.wizardLead}</p>
            <div className="space-y-8">
              {FIGMA.wizardItems.map((item) => (
                <Feature key={item.title} title={item.title} body={item.body} />
              ))}
            </div>
          </Pin>
        </Board>
      </section>

      {/* MRW / iMac */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-0 pt-[120px]">
        <Pill>{FIGMA.logisticsPill}</Pill>
        <Board w={1200} h={760} className="mt-16">
          <Pin x={0} y={40} w={540}>
            <p className="font-sans text-[18px] leading-[1.5] mb-8">{FIGMA.logisticsLead}</p>
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
          </Pin>
          <Pin x={580} y={0} w={620} h={760}>
            <Pin x={140} y={0} w={340} h={210} className="z-10 rounded-[12px] overflow-hidden bg-white shadow-md">
              <Asset file="rectangle-144.jpg" alt="Envíos a nivel nacional" className="object-contain" />
            </Pin>
            <Pin x={40} y={150} w={540} h={486}>
              <IMacComposite />
            </Pin>
          </Pin>
        </Board>
      </section>

      {/* Results — three equal cards, locked row */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-0 pt-[140px]">
        <SectionTitle>{FIGMA.resultsTitle}</SectionTitle>
        <Lead>{FIGMA.resultsLead}</Lead>
        <Board w={1200} h={320} className="mt-16">
          {FIGMA.resultCards.map((card, i) => (
            <Pin key={card.title} x={i * 416} y={0} w={384} h={320} className="bg-[#EADDFF] rounded-[36px] p-10">
              <h3 className="font-sans font-bold text-[20px] leading-[1.4] text-[#4A4453] mb-5">{card.title}</h3>
              <p className="font-sans text-[18px] leading-[1.5] text-[#4A4453]">{card.body}</p>
            </Pin>
          ))}
        </Board>
      </section>

      {/* 3-phone band — locked, no wrap */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-0 pt-[120px]">
        <Board w={1200} h={620}>
          {['mobile-screen-01.png', 'mobile-screen-02.png', 'mobile-screen-03.png'].map((file, i) => (
            <Pin key={file} x={145 + i * 320} y={0} w={280}>
              <IPhoneFrame screen={file} alt="Pantalla móvil SoyTechno" />
            </Pin>
          ))}
        </Board>
      </section>

      {/* Testimonial */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-0 pt-[120px]">
        <div className="bg-[#FFDAD6] rounded-[36px] overflow-hidden relative">
          <img
            src={img('quote-background.svg')}
            alt=""
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          />
          <Board w={1200} h={420}>
            <Pin x={80} y={90} w={220}>
              <div className="relative w-[140px] h-[140px] rounded-full overflow-hidden mx-auto mb-6">
                <Asset file="testimonial-avatar.png" alt={FIGMA.testimonialName} className="object-cover" />
              </div>
              <p className="font-paytone text-[28px] text-[#2A0064] text-center">{FIGMA.testimonialName}</p>
              <p className="font-sans text-[18px] text-[#2A0064]/80 text-center">{FIGMA.testimonialRole}</p>
            </Pin>
            <Pin x={360} y={140} w={740}>
              <p className="font-sans italic text-[24px] leading-[1.5] text-[#2A0064] text-center">
                “{FIGMA.testimonialQuote}”
              </p>
            </Pin>
          </Board>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-0 pt-[100px] pb-[120px]">
        <div className="bg-[#B3FFF3] rounded-[36px] overflow-hidden">
          <Board w={1200} h={520}>
            <Pin x={40} y={50} w={500} h={420}>
              <Asset file="cta-illustration.png" alt="" />
            </Pin>
            <Pin x={580} y={90} w={560}>
              <h2 className="font-paytone text-[47px] leading-[1.2] text-[#453A53] mb-8">{FIGMA.ctaTitle}</h2>
              <p className="font-sans text-[18px] leading-[1.5] text-[#453A53] mb-10">{FIGMA.ctaBody}</p>
              <a
                href={FIGMA.ctaHref}
                className="inline-block bg-[#440099] text-white font-sans font-semibold py-3 px-8 rounded-full no-underline"
              >
                {FIGMA.ctaButton}
              </a>
            </Pin>
          </Board>
        </div>
      </section>
    </div>
  );
}
