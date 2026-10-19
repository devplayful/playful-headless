import Image from 'next/image';
import Link from 'next/link';
import { LINKS_BIO_THUMB_SIZES } from '@/lib/blog-image-sizes';
import {
  LINKS_BIO_ENTRIES,
  buildLinksBioHref,
  linksBioBlogSlug,
  resolveLinksBioThumb,
} from '@/lib/links-bio';
import { getBlogPostBySlug } from '@/services/wordpress';

async function featuredMediaForPath(path: string): Promise<string> {
  const slug = linksBioBlogSlug(path);
  if (!slug) return '';
  try {
    const post = await getBlogPostBySlug(slug);
    return post?.featured_media_url || '';
  } catch {
    return '';
  }
}

export default async function LinksBioPage() {
  const entries = await Promise.all(
    LINKS_BIO_ENTRIES.map(async (entry) => ({
      ...entry,
      thumb: resolveLinksBioThumb(entry.path, await featuredMediaForPath(entry.path)),
    })),
  );

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
          {entries.map((entry) => (
            <Link
              key={entry.path}
              href={buildLinksBioHref(entry.path)}
              className="playful-boton w-full !justify-start gap-3 !text-base sm:!text-lg !px-3 sm:!px-4 py-3 shadow-sm hover:shadow-md"
            >
              <span className="relative shrink-0 w-14 h-14 sm:w-16 sm:h-16 overflow-hidden rounded-xl bg-white">
                <Image
                  src={entry.thumb.src}
                  alt=""
                  fill
                  sizes={LINKS_BIO_THUMB_SIZES}
                  className={entry.thumb.isFallback ? 'object-contain p-1.5' : 'object-cover'}
                />
              </span>
              <span className="flex-1 text-center pr-1">{entry.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
