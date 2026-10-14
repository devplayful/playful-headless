/** Keep in sync with `images.deviceSizes` / default `imageSizes` in next.config.js */
export const NEXT_IMAGE_DEVICE_SIZES = Object.freeze([
  640, 750, 828, 1080, 1200, 1920, 2048, 3840,
]);

export const NEXT_IMAGE_IMAGE_SIZES = Object.freeze([
  16, 32, 48, 64, 96, 128, 256, 384,
]);

const ALLOWED = Object.freeze(
  [...NEXT_IMAGE_IMAGE_SIZES, ...NEXT_IMAGE_DEVICE_SIZES].sort((a, b) => a - b),
);

/** Smallest allowed width that is >= requested (caps at max configured width). */
export function snapNextImageWidth(requested: number): number {
  const w = Math.max(1, Math.round(requested));
  for (const allowed of ALLOWED) {
    if (allowed >= w) return allowed;
  }
  return ALLOWED[ALLOWED.length - 1];
}

export function isAllowedNextImageWidth(width: number): boolean {
  const w = Math.round(width);
  return ALLOWED.includes(w);
}

/** Srcset candidates for Elementor service heroes (mobile + desktop). */
export const ELEMENTOR_HERO_SRCSET_WIDTHS = Object.freeze([384, 640, 750, 828]);
