import {
  CASE_STUDY_SHOPIFY_HREF,
  CASE_STUDY_SHOPIFY_LABEL,
} from '@/utils/case-study-shopify-link';

export { isShopifyCaseStudySlug } from '@/utils/case-study-shopify-link';

/** Compact body link. Raw <a> so curl sees href (no Next.js Link / RSC). */
export default function ShopifyServiceLink() {
  return (
    <p className="text-base sm:text-lg text-[#4A4453] mt-3">
      <a href={CASE_STUDY_SHOPIFY_HREF}>{CASE_STUDY_SHOPIFY_LABEL}</a>
    </p>
  );
}
