import type { ReactNode } from 'react';
import { resolveGroupedArt, type GroupedArtSlot } from '@/utils/soytechno-grouped-art';

/**
 * Single grouped export (or one-file fallback). Never an absolute collage.
 * Diseño drop-in: soytechno-*-art@2x.png|.webp in public/images/casos/soytechno/.
 */
export default function SoyTechnoGroupedArt({
  slot,
  alt,
  className,
  fallback,
}: {
  slot: GroupedArtSlot;
  alt: string;
  className?: string;
  fallback?: ReactNode;
}) {
  const art = resolveGroupedArt(slot);
  if (art.isExport && art.src) {
    return (
      <img
        src={art.src}
        alt={alt}
        width="100%"
        height="auto"
        className={`w-full h-auto object-contain ${className || ''}`}
        data-grouped-art={slot}
        data-grouped-source="export"
      />
    );
  }
  if (fallback) {
    return <>{fallback}</>;
  }
  if (art.src) {
    return (
      <img
        src={art.src}
        alt={alt}
        width="100%"
        height="auto"
        className={`w-full h-auto object-contain ${className || ''}`}
        data-grouped-art={slot}
        data-grouped-source="fallback"
      />
    );
  }
  return null;
}
