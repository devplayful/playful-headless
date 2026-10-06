type AgencyIllustrationSlotSize = 'hero' | 'card';

type AgencyIllustrationSlotProps = {
  id: string;
  alt: string;
  size?: AgencyIllustrationSlotSize;
  /** Intended @1x path for Diseño. Not rendered until the asset exists. */
  src1x: string;
  /** Intended @2x path for Diseño. Not rendered until the asset exists. */
  src2x: string;
};

/**
 * Same slot as /agencia-shopify IllustrationSlot: hero 552×360 rounded-[32px],
 * card 560×240 full-bleed inside BleedIllustrationCard.
 *
 * PLACEHOLDER: fills with the site og image until Diseño drops the @1x/@2x files.
 */
const PLACEHOLDER_ART = 'https://playfulagency.com/og.jpg';

export const AGENCY_HERO_SLOT_SIZE = { width: 552, height: 360 } as const;
export const AGENCY_CARD_SLOT_SIZE = { width: 560, height: 240 } as const;

export default function AgencyIllustrationSlot({
  id,
  alt,
  size = 'card',
  src1x,
  src2x,
}: AgencyIllustrationSlotProps) {
  if (size === 'hero') {
    return (
      <div
        data-illustration-slot={id}
        data-illustration-src-1x={src1x}
        data-illustration-src-2x={src2x}
        data-placeholder="PLACEHOLDER"
        className="relative w-full min-h-[280px] md:min-h-[360px] overflow-hidden rounded-[32px]"
      >
        {/* PLACEHOLDER: Diseño sustituye por src1x / src2x (552×360 / 1104×720). */}
        <img
          src={PLACEHOLDER_ART}
          alt={alt}
          width={AGENCY_HERO_SLOT_SIZE.width}
          height={AGENCY_HERO_SLOT_SIZE.height}
          decoding="async"
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      data-illustration-slot={id}
      data-illustration-src-1x={src1x}
      data-illustration-src-2x={src2x}
      data-placeholder="PLACEHOLDER"
      className="absolute inset-0 overflow-hidden"
    >
      {/* PLACEHOLDER: Diseño sustituye por src1x / src2x (560×240 / 1120×480). */}
      <img
        src={PLACEHOLDER_ART}
        alt={alt}
        width={AGENCY_CARD_SLOT_SIZE.width}
        height={AGENCY_CARD_SLOT_SIZE.height}
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
    </div>
  );
}
