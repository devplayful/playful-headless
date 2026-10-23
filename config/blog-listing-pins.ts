/**
 * Pinned posts on /blog (page 1, no category, no search only).
 * `position` is 0-based in the full listing. José, 23 oct 16:14.
 */
export const BLOG_LISTING_PINS: ReadonlyArray<{ slug: string; wpId: number; position: number }> = [
  { slug: 'premios-cima-2026-soytechno-playful', wpId: 86564, position: 0 },
  { slug: 'zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce', wpId: 86152, position: 1 },
];

export function applyBlogListingPins<T extends { slug?: string; id?: number }>(
  posts: readonly T[],
  pins = BLOG_LISTING_PINS,
): T[] {
  const rest = [...posts];
  const pinned: Array<{ post: T; position: number }> = [];
  for (const pin of pins) {
    const index = rest.findIndex((post) => post.slug === pin.slug || post.id === pin.wpId);
    if (index === -1) continue;
    pinned.push({ post: rest.splice(index, 1)[0], position: pin.position });
  }
  pinned.sort((a, b) => a.position - b.position);
  for (const { post, position } of pinned) {
    rest.splice(Math.min(position, rest.length), 0, post);
  }
  return rest;
}
