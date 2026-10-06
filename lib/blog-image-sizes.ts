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

export const CASE_LISTING_CARD_SIZES =
  '(max-width: 767px) calc(100vw - 2rem), (max-width: 1023px) calc(50vw - 2rem), 360px';

export const CTA_ILLUSTRATION_SIZES =
  '(min-width: 1024px) 560px, calc(100vw - 2rem)';

export const CASE_CTA_ILLUSTRATION_SIZES =
  '(max-width: 1023px) 90vw, 450px';

export const CONTACT_HERO_SIZES = '(max-width: 1023px) 90vw, 620px';

export const PRIVACY_HERO_SIZES = '(max-width: 1023px) 90vw, 500px';
