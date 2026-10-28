import Image from 'next/image';
import Link from 'next/link';
import { LINKS_BIO_ENTRIES, buildLinksBioHref } from '@/lib/links-bio';
import {
  resolveLinksBioThumbnails,
  type LinksBioThumb,
} from '@/lib/links-bio-thumbs';
import {
  LINKS_BIO_COLLAGE_SIZES,
  LINKS_BIO_FEATURED_SIZES,
  LINKS_BIO_THUMB_SIZES,
} from '@/lib/blog-image-sizes';

const CARD_SHADOW =
  'shadow-[0px_4px_8px_3px_rgba(0,0,0,0.08),0px_1px_3px_rgba(0,0,0,0.12)]';
const CARD_HOVER =
  'transition duration-300 hover:-translate-y-0.5 hover:shadow-[0px_8px_16px_4px_rgba(68,0,153,0.12),0px_2px_6px_rgba(0,0,0,0.12)] active:scale-[0.99]';

function ThumbMedia({
  thumb,
  sizes,
  priority = false,
}: {
  thumb: LinksBioThumb;
  sizes: string;
  priority?: boolean;
}) {
  if (thumb.collage && thumb.collage.length > 1) {
    return (
      <span className="absolute inset-0 flex">
        {thumb.collage.map((src) => (
          <span key={src} className="relative h-full flex-1 overflow-hidden">
            <Image
              src={src}
              alt=""
              fill
              sizes={LINKS_BIO_COLLAGE_SIZES}
              className="object-cover object-center"
            />
          </span>
        ))}
      </span>
    );
  }

  return (
    <Image
      src={thumb.src}
      alt={thumb.alt}
      fill
      sizes={sizes}
      priority={priority}
      className={
        thumb.objectFit === 'contain'
          ? 'object-contain p-2'
          : 'object-cover object-center'
      }
      unoptimized={thumb.isFallback}
    />
  );
}

export default async function LinksBioPage() {
  const thumbs = await resolveLinksBioThumbnails(LINKS_BIO_ENTRIES);
  const [featured, ...rest] = LINKS_BIO_ENTRIES;
  const featuredThumb = thumbs[0];
  const restThumbs = thumbs.slice(1);

  return (
    <div
      data-instagram-bio
      data-cta-section="instagram-bio"
      className="relative min-h-screen overflow-hidden bg-[#E9D7FF]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[url('/images/background.webp')] bg-cover bg-center bg-no-repeat opacity-50" />
      <div className="absolute top-16 left-6 h-3 w-3 rounded-full bg-purple-300 opacity-60 animate-bounce" />
      <div
        className="absolute top-36 right-8 h-4 w-4 rounded-full bg-pink-300 opacity-60 animate-bounce"
        style={{ animationDelay: '0.5s' }}
      />
      <div
        className="absolute bottom-40 left-10 h-2.5 w-2.5 rounded-full bg-teal-300 opacity-60 animate-bounce"
        style={{ animationDelay: '1s' }}
      />
      <div
        className="absolute bottom-24 right-14 h-3.5 w-3.5 rounded-full bg-yellow-300 opacity-60 animate-bounce"
        style={{ animationDelay: '1.5s' }}
      />

      <div className="relative z-10 flex min-h-screen flex-col items-center px-5 py-10 sm:py-14">
        <div className="flex w-full max-w-md flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <Link
              href="/"
              className={`flex h-[88px] w-[88px] items-center justify-center rounded-full bg-white ${CARD_SHADOW} transition duration-300 hover:scale-105`}
              aria-label="Playful Agency — inicio"
            >
              <Image
                src="/images/logos/playful-logov.svg"
                alt="Playful Agency"
                width={64}
                height={22}
                priority
                className="h-7 w-auto"
              />
            </Link>
            <div className="space-y-1">
              <h1 className="font-paytone text-2xl leading-tight text-[#440099] sm:text-3xl">
                Playful Agency
              </h1>
              <p className="font-dm-sans text-sm text-[#4A4453] sm:text-base">
                Agencia de e-commerce
              </p>
            </div>
          </div>

          <nav className="flex w-full flex-col gap-4" aria-label="Enlaces de Instagram">
            <Link
              href={buildLinksBioHref(featured)}
              data-links-fixed-href=""
              className={`group block w-full overflow-hidden rounded-[28px] bg-white ${CARD_SHADOW} ${CARD_HOVER}`}
            >
              <span className="relative block aspect-[16/10] w-full bg-[#F3E5F5]">
                <ThumbMedia
                  thumb={featuredThumb}
                  sizes={LINKS_BIO_FEATURED_SIZES}
                  priority
                />
              </span>
              <span className="flex items-center justify-between gap-3 px-5 py-4">
                <span className="flex-1 text-left font-paytone text-lg leading-snug text-[#2A0064] sm:text-xl">
                  {featured.label}
                </span>
                <span
                  aria-hidden
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#39DDCB] text-lg font-semibold text-[#2A0064] transition duration-300 group-hover:scale-105 group-hover:bg-[#2ec4b6]"
                >
                  →
                </span>
              </span>
            </Link>

            {rest.map((entry, index) => {
              const thumb = restThumbs[index];
              return (
                <Link
                  key={entry.path}
                  href={buildLinksBioHref(entry)}
                  data-links-fixed-href=""
                  className={`group flex w-full items-center gap-4 rounded-[24px] bg-white p-3 pr-4 ${CARD_SHADOW} ${CARD_HOVER}`}
                >
                  <span className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#F3E5F5] sm:h-24 sm:w-24">
                    <ThumbMedia thumb={thumb} sizes={LINKS_BIO_THUMB_SIZES} />
                  </span>
                  <span className="flex-1 text-left font-paytone text-base leading-snug text-[#2A0064] sm:text-lg">
                    {entry.label}
                  </span>
                  <span
                    aria-hidden
                    className="text-lg text-[#440099] transition duration-300 group-hover:translate-x-0.5"
                  >
                    →
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
