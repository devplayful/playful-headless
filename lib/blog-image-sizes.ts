/**
 * `sizes` for next/image in the real slot of each breakpoint.
 * Without this, next/image defaults to 100vw and serves 1920–2048
 * for a 360–560 px hole.
 */
export const BLOG_POST_FEATURED_SIZES =
  '(max-width: 1023px) calc(100vw - 2rem), 560px';

export const BLOG_CARD_SIZES =
  '(max-width: 767px) calc(100vw - 2rem), (max-width: 1023px) calc(50vw - 2rem), 360px';

export const BLOG_LISTING_HERO_SIZES =
  '(max-width: 767px) calc(100vw - 2rem), 1120px';

export const BLOG_LISTING_CARD_SIZES =
  '(max-width: 767px) calc(100vw - 2rem), (max-width: 1023px) calc(50vw - 3rem), 360px';

export const BLOG_MOST_VIEWED_SIZES =
  '(max-width: 767px) calc(100vw - 2rem), (max-width: 1023px) calc(50vw - 2rem), 280px';

/** 3-up hub grid (~360px card at 1200px). */
export const CASE_LISTING_CARD_SIZES =
  '(max-width: 767px) calc(100vw - 2rem), (max-width: 1023px) calc(50vw - 2rem), 360px';

/** Home carousel: 3 slides on desktop, 2 on tablet, 1 on mobile. */
export const CASE_CAROUSEL_CARD_SIZES =
  '(min-width: 1024px) 360px, (min-width: 768px) 45vw, 90vw';

/**
 * 2-col social-proof cards (Shopify landing): ~544–560px at max-w-[1200px].
 * The carousel 360px sizes were reused here and next/image served ~384–750w
 * for a 560 CSS-px hole (1120px at DPR 2).
 */
export const CASE_FEATURE_CARD_SIZES =
  '(max-width: 767px) calc(100vw - 3rem), (max-width: 1023px) calc(50vw - 2.5rem), 560px';

/** Graphic tapas (logos/product art) look mushy at the default q=75. */
export const CASE_CARD_IMAGE_QUALITY = 90;

export const CTA_ILLUSTRATION_SIZES =
  '(min-width: 1024px) 560px, calc(100vw - 2rem)';

export const CASE_CTA_ILLUSTRATION_SIZES =
  '(max-width: 1023px) 90vw, 450px';

export const CONTACT_HERO_SIZES = '(max-width: 1023px) 90vw, 620px';

export const PRIVACY_HERO_SIZES = '(max-width: 1023px) 90vw, 500px';

/** /links featured card: full column (~350px at 390, 448px at max-w-md). */
export const LINKS_BIO_FEATURED_SIZES =
  '(max-width: 639px) calc(100vw - 2.5rem), 448px';

/** /links row thumbs: 80px (h-20) on mobile, 96px (h-24) from sm up. */
export const LINKS_BIO_THUMB_SIZES = '(max-width: 639px) 80px, 96px';

/** Three-up collage inside the row thumb. */
export const LINKS_BIO_COLLAGE_SIZES = '(max-width: 639px) 27px, 32px';
