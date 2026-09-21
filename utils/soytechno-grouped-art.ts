/**
 * José plan B — grouped 2× Figma exports.
 * Drop any of these into public/images/casos/soytechno/ and the <img> lights up:
 *   soytechno-hero-art@2x.png|.webp
 *   soytechno-desafio-art@2x.png|.webp
 *   soytechno-logistica-art@2x.png|.webp
 *   soytechno-phones-strip@2x.png|.webp
 * Bare names (no @2x) are also accepted. Files are opaque RGB crops from the
 * 1440 Figma frame (no chroma-key). DOM: width 100% / height auto / contain.
 */

import { existsSync } from 'node:fs';
import path from 'node:path';

const DIR = path.join(process.cwd(), 'public/images/casos/soytechno');
const HREF = '/images/casos/soytechno';

export const GROUPED_ART_SLOTS = {
  hero: {
    stems: ['soytechno-hero-art@2x', 'soytechno-hero-art'],
    fallback: 'lifestyle-f.jpg',
  },
  desafio: {
    stems: ['soytechno-desafio-art@2x', 'soytechno-desafio-art'],
    fallback: 'rectangle-147-catalog.png',
  },
  logistica: {
    stems: ['soytechno-logistica-art@2x', 'soytechno-logistica-art'],
    fallback: 'rectangle-148.png',
  },
  phones: {
    stems: ['soytechno-phones-strip@2x', 'soytechno-phones-strip'],
    fallback: null,
  },
} as const;

export type GroupedArtSlot = keyof typeof GROUPED_ART_SLOTS;

export type GroupedArtRef = {
  src: string | null;
  isExport: boolean;
  file: string | null;
};

const EXTS = ['webp', 'png'] as const;

function fileExists(name: string) {
  return existsSync(path.join(DIR, name));
}

export function resolveGroupedArt(slot: GroupedArtSlot): GroupedArtRef {
  const spec = GROUPED_ART_SLOTS[slot];
  for (const stem of spec.stems) {
    for (const ext of EXTS) {
      const file = `${stem}.${ext}`;
      if (fileExists(file)) {
        return { src: `${HREF}/${file}`, isExport: true, file };
      }
    }
  }
  if (spec.fallback) {
    return { src: `${HREF}/${spec.fallback}`, isExport: false, file: spec.fallback };
  }
  return { src: null, isExport: false, file: null };
}
