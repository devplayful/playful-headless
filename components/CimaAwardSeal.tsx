import {
  CIMA_SEAL_ASSETS,
  cimaSealDisplayHeight,
  type CimaAwardSealVariant,
} from '@/lib/cima-award-seal';

type CimaAwardSealProps = {
  variant: CimaAwardSealVariant;
  /** Desktop render width (≥768px); compact asset is used below 768px via picture. */
  desktopWidth?: number;
  className?: string;
};

export default function CimaAwardSeal({
  variant,
  desktopWidth = 220,
  className,
}: CimaAwardSealProps) {
  const { full, compact, alt } = CIMA_SEAL_ASSETS[variant];
  const desktopHeight = cimaSealDisplayHeight(desktopWidth);
  const mobileWidth = 160;
  const mobileHeight = cimaSealDisplayHeight(mobileWidth);

  return (
    <div className={className} style={{ display: 'flex', justifyContent: 'center' }}>
      <picture>
        <source media="(max-width: 767px)" srcSet={compact} width={mobileWidth} height={mobileHeight} />
        <img
          src={full}
          alt={alt}
          width={desktopWidth}
          height={desktopHeight}
          loading="lazy"
          decoding="async"
          style={{
            width: 'auto',
            height: 'auto',
            maxWidth: desktopWidth,
          }}
        />
      </picture>
    </div>
  );
}
