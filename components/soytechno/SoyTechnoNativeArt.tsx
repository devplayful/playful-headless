const A = '/images/casos/soytechno';

function asset(file: string) {
  return `${A}/${file}`;
}

export function WhitePhoneIcon() {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-sm" aria-hidden>
      <rect x="18" y="6" width="28" height="52" rx="6" fill="white" />
      <rect x="28" y="10" width="8" height="3" rx="1.5" fill="#00193F" />
      <circle cx="32" cy="52" r="2.2" fill="#00193F" />
    </svg>
  );
}

export function IPhoneFrame({ screen, alt }: { screen: string; alt: string }) {
  return (
    <div className="relative w-full aspect-[276/577]">
      <div className="absolute inset-x-[3.6%] top-[1.8%] bottom-[1.8%] overflow-hidden rounded-[18%/9%] bg-black">
        <img src={asset(screen)} alt={alt} className="w-full h-full object-cover object-top" />
      </div>
      <img
        src={asset('iphone-frame-02.png')}
        alt=""
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
      />
    </div>
  );
}

/** Vector bezel + native 1640×2360 screenshot (same trick as section-c iPad). */
export function IPadPortrait({ screen, alt }: { screen: string; alt: string }) {
  return (
    <div className="relative w-full aspect-[1640/2360]" data-soytechno-art="wizard">
      <div className="absolute inset-0 rounded-[6.5%] bg-[#0d0d0f] shadow-[0_24px_60px_rgba(16,12,28,0.22)]">
        <div className="absolute left-1/2 top-[1.05%] z-10 h-[0.55%] w-[12%] -translate-x-1/2 rounded-full bg-[#2a2a2e]" />
        <div className="absolute inset-[1.8%] overflow-hidden rounded-[4.5%] bg-white">
          <img src={asset(screen)} alt={alt} className="w-full h-full object-cover object-top" />
        </div>
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

export function DesktopPhonesRow() {
  return (
    <div className="overflow-hidden" data-soytechno-art="phones">
      <div className="flex gap-8 -ml-[18%]">
        {PHONES.map((phone) => (
          <div key={phone.file} className="w-[276px] shrink-0">
            <IPhoneFrame screen={phone.file} alt={phone.alt} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function MobilePhonesCarousel() {
  return (
    <div
      className="soytechno-snap-row flex gap-4 overflow-x-auto snap-x snap-mandatory -mx-5 px-5"
      data-soytechno-art="phones"
    >
      {PHONES.map((phone) => (
        <div key={phone.file} className="snap-center shrink-0 w-[78vw] max-w-[320px]">
          <IPhoneFrame screen={phone.file} alt={phone.alt} />
        </div>
      ))}
    </div>
  );
}

/** Individual native assets — browser scales logo 4096 / photo 1456, never a flattened 2× PNG. */
export function HeroCollage() {
  return (
    <div className="relative w-full aspect-[480/560]" data-soytechno-art="hero">
      <div className="absolute left-[8%] top-[30%] z-10 h-[46%] w-[80%] overflow-hidden rounded-[20px] bg-[#00193F]">
        <img
          src={asset('circuito.png')}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40 invert"
        />
        <div className="absolute inset-0 flex items-center justify-center px-8">
          <img
            src={asset('soytechno-logo-white.png')}
            alt="SoyTechno"
            className="h-auto w-[88%] object-contain"
          />
        </div>
      </div>
      <div className="absolute left-[40%] top-[10%] z-20 aspect-square w-[41%] overflow-hidden rounded-full ring-4 ring-white">
        <img
          src={asset('lifestyle-f.jpg')}
          alt="SoyTechno"
          className="h-full w-full object-cover object-[55%_28%]"
        />
      </div>
      <img
        src={asset('cashea-badge.png')}
        alt="Cashea"
        className="absolute left-[36%] top-[2%] z-30 h-auto w-[15%]"
      />
      <img
        src={asset('delivery-icon-3.png')}
        alt=""
        className="absolute left-[74%] top-[22%] z-30 h-auto w-[12%]"
      />
      <div className="absolute left-[4%] top-[58%] z-30 aspect-square w-[17.5%]">
        <WhitePhoneIcon />
      </div>
      <img
        src={asset('lifestyle-1.png')}
        alt=""
        className="absolute left-[56%] top-[66%] z-30 h-auto w-[17.5%]"
      />
      <img
        src={asset('lifestyle-i.png')}
        alt="Productos 100% originales"
        className="absolute left-[74%] top-[68%] z-30 h-auto w-[16%]"
      />
    </div>
  );
}

/** 2×2 graphic only. Parent paints the white “prioridad móvil” card on top. */
export function DesafioArt() {
  return (
    <div className="relative w-full aspect-[1200/1152] bg-[#EADDFF]" data-soytechno-art="desafio">
      <div className="absolute left-[53.3%] top-[4.2%] h-[15.3%] w-[42.7%] overflow-hidden rounded-[20px] bg-[#0063FC]">
        <img
          src={asset('circuito.png')}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-30 invert"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={asset('website-capture-01.png')}
            alt="SoyTechno"
            className="aspect-square w-[26%] rounded-full bg-[#00193F] object-cover"
          />
        </div>
      </div>
      <div className="absolute left-[63.3%] top-[31.2%] z-20 w-[20.8%]">
        <IPhoneFrame screen="iphone-frame-01.png" alt="Catálogo móvil SoyTechno" />
      </div>
      <div className="absolute left-[4%] top-[59.9%] flex h-[40%] w-[53.3%] items-center justify-center rounded-[28px] bg-[#FFF4C4] p-5">
        <img
          src={asset('rectangle-147-catalog.png')}
          alt="Catálogo SoyTechno"
          className="h-full w-full object-contain"
        />
      </div>
      <div className="absolute left-[60%] top-[68.6%] h-[31.3%] w-[36%] overflow-hidden rounded-[28px] bg-[#00193F]">
        <img
          src={asset('circuito.png')}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40 invert"
        />
        <div className="absolute inset-0 flex items-end justify-center gap-3 p-5">
          <img
            src={asset('electrodomesticos-01.png')}
            alt=""
            className="h-[70%] w-[26%] object-contain"
          />
          <img
            src={asset('electrodomesticos-02.png')}
            alt=""
            className="h-[80%] w-[42%] object-contain"
          />
          <img
            src={asset('electrodomesticos-03.png')}
            alt=""
            className="h-[70%] w-[26%] object-contain"
          />
        </div>
      </div>
    </div>
  );
}
