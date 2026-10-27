import Image from 'next/image';
import { CTA_ILLUSTRATION_SIZES } from '@/lib/blog-image-sizes';
import { resolveImageAlt } from '@/lib/image-alt-overrides';
import { SERVICE_BOOKING_HREF } from '@/utils/booking-attribution';

const CTA_IMAGE = '/images/imagen-nueva-cta-home.png';

type AdsFinalCtaProps = {
  title: string;
  body: string;
  button: string;
};

/** Single h2 + booking href so CtaClickTracker fires cta_reunion_click. */
export default function AdsFinalCta({ title, body, button }: AdsFinalCtaProps) {
  return (
    <div className="w-full">
      <div className="lg:flex lg:items-center lg:gap-8 xl:gap-12">
        <div className="mb-12 lg:mb-0 lg:w-1/2">
          <div className="overflow-hidden rounded-2xl">
            <Image
              src={CTA_IMAGE}
              alt={resolveImageAlt(
                CTA_IMAGE,
                'Ilustración de un equipo revisando gráficas de crecimiento y conversión en una pantalla grande',
              )}
              width={2048}
              height={2048}
              sizes={CTA_ILLUSTRATION_SIZES}
              className="h-auto w-full object-cover"
            />
          </div>
        </div>
        <div className="relative min-h-[360px] overflow-hidden rounded-2xl lg:w-1/2">
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: '#B3FFF3',
              backgroundImage: 'url(/images/background.webp)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="absolute inset-0" style={{ backgroundColor: '#B3FFF340' }} />
          <div className="relative z-10 flex h-full flex-col items-center justify-center p-5 lg:p-12">
            <h2 className="mb-6 text-center text-3xl font-normal leading-tight text-[#453A53] md:text-4xl">
              {title}
            </h2>
            <p className="mb-8 text-center text-lg text-[#453A53]">{body}</p>
            <a
              href={SERVICE_BOOKING_HREF}
              data-cta="lp-meta-final"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#440099] px-8 py-3 text-center text-sm font-semibold text-white no-underline hover:bg-[#5B21B6] focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#440099] md:text-base"
            >
              {button}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
