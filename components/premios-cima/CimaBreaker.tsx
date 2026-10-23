import Image from 'next/image';

export const CIMA_INTERNAL_URL = '/casos-de-exito/soytechno-ecommerce-venezuela';
export const SOYTECHNO_URL = 'https://soytechno.com/';
export const CIMA_PRESS_URL = '/blog/otros/premios-cima-2026-soytechno-playful';
export const PREMIOS_CIMA_SITE_URL = 'https://premioscima.com';
export const CIMA_ALT_PLAYFUL =
  'Playful Agency, agencia reconocida en los Premios CIMA 2026, categoría Plataforma de E-commerce';
export const CIMA_ALT_SOYTECHNO =
  'SoyTechno, cliente reconocido en los Premios CIMA 2026, categoría E-commerce';

type Variant = 'home' | 'shopify' | 'soytechno';

const SIZES: Record<Variant, { d: [number, number]; m: [number, number]; alt: string }> = {
  home: { d: [1440, 600], m: [390, 700], alt: CIMA_ALT_PLAYFUL },
  shopify: { d: [1440, 600], m: [390, 700], alt: CIMA_ALT_PLAYFUL },
  soytechno: { d: [1440, 620], m: [390, 640], alt: CIMA_ALT_SOYTECHNO },
};

/** Separador Premios CIMA 2026 (imagen responsive; home → nota de prensa CIMA, shopify → caso SoyTechno; «Cliente reconocido» a soytechno.com). */
export default function CimaBreaker({ variant }: { variant: Variant }) {
  const s = SIZES[variant];
  const base = `/images/premios-cima/breaker-${variant}`;
  return (
    <section aria-label="Premios CIMA 2026" data-cima-breaker={variant} className={variant === 'soytechno' ? 'w-full overflow-hidden' : 'w-full'}>
      <a
        href={variant === 'soytechno' ? SOYTECHNO_URL : variant === 'home' ? CIMA_PRESS_URL : CIMA_INTERNAL_URL}
        {...(variant === 'soytechno' ? { target: '_blank', rel: 'noopener' } : {})}
        className="block mx-auto max-w-[1440px]">
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
          className={variant === 'soytechno' ? 'block md:hidden w-[390px] max-w-none h-auto mx-auto' : 'block md:hidden w-full h-auto'}
        />
      </a>
    </section>
  );
}
