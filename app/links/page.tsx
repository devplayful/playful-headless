import Image from 'next/image';
import Link from 'next/link';
import { LINKS_BIO_ENTRIES, buildLinksBioHref } from '@/lib/links-bio';
import { resolveLinksBioThumbnails } from '@/lib/links-bio-thumbs';
import { LINKS_BIO_THUMB_SIZES } from '@/lib/blog-image-sizes';

export default async function LinksBioPage() {
  const thumbs = await resolveLinksBioThumbnails(LINKS_BIO_ENTRIES);

  return (
    <div
      data-instagram-bio
      data-cta-section="instagram-bio"
      className="min-h-screen flex flex-col items-center px-5 py-10 sm:py-14"
    >
      <div className="w-full max-w-md flex flex-col items-center gap-8">
        <Link href="/" className="flex-shrink-0" aria-label="Playful Agency — inicio">
          <Image
            src="/images/logos/playful-logov.svg"
            alt="Playful Agency"
            width={160}
            height={56}
            priority
            className="h-12 w-auto"
          />
        </Link>

        <div className="text-center space-y-1">
          <h1 className="font-paytone text-2xl sm:text-3xl text-[#440099] leading-tight">
            Playful Agency
          </h1>
          <p className="font-dm-sans text-sm sm:text-base text-[#4A4453]">
            Agencia de e-commerce
          </p>
        </div>

        <nav className="w-full flex flex-col gap-3" aria-label="Enlaces de Instagram">
          {LINKS_BIO_ENTRIES.map((entry, index) => {
            const thumb = thumbs[index];
            return (
              <Link
                key={entry.path}
                href={buildLinksBioHref(entry.path)}
                className="playful-boton w-full !justify-start gap-3 !text-base sm:!text-lg px-6 py-4 shadow-sm hover:shadow-md"
              >
                <span className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-xl bg-white">
                  <Image
                    src={thumb.src}
                    alt=""
                    fill
                    sizes={LINKS_BIO_THUMB_SIZES}
                    className={
                      thumb.isFallback
                        ? 'object-contain p-1.5'
                        : 'object-cover object-center'
                    }
                    unoptimized={thumb.isFallback}
                  />
                </span>
                <span className="flex-1 text-left">{entry.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
