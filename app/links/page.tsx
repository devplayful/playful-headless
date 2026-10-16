import Image from 'next/image';
import Link from 'next/link';
import { LINKS_BIO_ENTRIES, buildLinksBioHref } from '@/lib/links-bio';

export default function LinksBioPage() {
  return (
    <div className="min-h-screen flex flex-col items-center px-5 py-10 sm:py-14">
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

        <nav
          className="w-full flex flex-col gap-3"
          aria-label="Enlaces de Instagram"
        >
          {LINKS_BIO_ENTRIES.map((entry) => (
            <Link
              key={entry.href}
              href={buildLinksBioHref(entry.href)}
              className="playful-boton w-full text-base sm:text-lg px-6 py-4 shadow-sm hover:shadow-md"
            >
              {entry.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
