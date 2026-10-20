import Image from 'next/image';

export const CIMA_URL = 'https://premioscima.com';
export const CIMA_ALT_PLAYFUL =
  'Playful Agency, agencia reconocida en los Premios CIMA 2026, categoría Plataforma de E-commerce';
export const CIMA_ALT_SOYTECHNO =
  'SoyTechno, cliente reconocido en los Premios CIMA 2026, categoría E-commerce';

type Variant = 'home' | 'ecommerce' | 'shopify' | 'soytechno';

const SIZES: Record<Variant, { d: [number, number]; m: [number, number]; alt: string }> = {
  home: { d: [1440, 600], m: [390, 700], alt: CIMA_ALT_PLAYFUL },
  ecommerce: { d: [1440, 600], m: [390, 700], alt: CIMA_ALT_PLAYFUL },
  shopify: { d: [1440, 600], m: [390, 700], alt: CIMA_ALT_PLAYFUL },
  soytechno: { d: [1440, 620], m: [390, 640], alt: CIMA_ALT_SOYTECHNO },
};

/** Separador Premios CIMA 2026 (imagen responsive, enlaza a premioscima.com). */
export default function CimaBreaker({ variant }: { variant: Variant }) {
  const s = SIZES[variant];
  const base = `/images/premios-cima/breaker-${variant}`;
  return (
    <section aria-label="Premios CIMA 2026" data-cima-breaker={variant} className="w-full">
      <a href={CIMA_URL} target="_blank" rel="noopener" className="block mx-auto max-w-[1440px]">
        <Image
          src={`${base}-desktop.png`}
          width={s.d[0]}
          height={s.d[1]}
          alt={s.alt}
          sizes="(min-width: 1440px) 1440px, 100vw"
          className="hidden md:block w-full h-auto"
        />
        <Image
          src={`${base}-mobile.png`}
          width={s.m[0]}
          height={s.m[1]}
          alt={s.alt}
          sizes="100vw"
          className="block md:hidden w-full h-auto"
        />
      </a>
    </section>
  );
}
