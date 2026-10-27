import Image from 'next/image';
import Link from 'next/link';
import type { CaseStudy } from '@/components/CarouselResultados';
import { CASE_CARD_IMAGE_QUALITY, CASE_FEATURE_CARD_SIZES } from '@/lib/blog-image-sizes';

/** LP-owned case card: one link, no nested button (axe target-size / nested-interactive). */
export default function AdsCaseCard({
  caseStudy,
  href: hrefOverride,
  dataCta,
}: {
  caseStudy: CaseStudy;
  href?: string;
  dataCta?: string;
}) {
  const href = hrefOverride || `/casos-de-exito/${caseStudy.slug}`;
  const alt = caseStudy.title?.trim() || caseStudy.slug;

  return (
    <article className="h-full">
      <Link
        href={href}
        {...(dataCta ? { 'data-cta': dataCta } : {})}
        className="flex h-full min-h-[48px] flex-col overflow-hidden rounded-2xl bg-white shadow-lg transition-shadow hover:shadow-2xl focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#440099]"
      >
        <div className="relative h-48 flex-shrink-0 overflow-hidden bg-gray-100">
          {caseStudy.image ? (
            <Image
              src={caseStudy.image}
              alt={alt}
              width={560}
              height={192}
              sizes={CASE_FEATURE_CARD_SIZES}
              quality={CASE_CARD_IMAGE_QUALITY}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full items-center justify-center text-sm text-gray-500">Sin imagen</span>
          )}
        </div>
        <div className="flex flex-1 flex-col p-6">
          <h3 className="mb-4 text-xl font-normal leading-tight text-gray-900">{caseStudy.title}</h3>
          {caseStudy.categories.length > 0 ? (
            <div className="mb-4 flex flex-wrap gap-2">
              {caseStudy.categories.slice(0, 2).map((category) => (
                <span
                  key={category}
                  className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700"
                >
                  {category}
                </span>
              ))}
            </div>
          ) : null}
          <p className="mb-6 flex-1 text-sm leading-5 text-gray-600">{caseStudy.description}</p>
          <span className="mt-auto inline-flex min-h-12 items-center self-end rounded-full bg-[#2563EB] px-6 py-3 text-sm font-semibold text-white">
            {caseStudy.buttonText || 'Ver más'}
          </span>
        </div>
      </Link>
    </article>
  );
}
