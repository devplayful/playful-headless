import {
  CIMA_BREAKER_ALTS,
  CIMA_PREMIOS_URL,
  CIMA_SHIELD_PATHS,
  cimaShieldDisplayHeight,
  type CimaCelebrationVariant,
} from '@/lib/cima-breaker';
import styles from './CimaBreaker.module.css';

const SHIELD_DESKTOP = 256;

type CelebrationProps = {
  variant: CimaCelebrationVariant;
};

export function CimaCelebrationBreaker({ variant }: CelebrationProps) {
  const isEcommerce = variant === 'ecommerce';
  const shieldH = cimaShieldDisplayHeight(SHIELD_DESKTOP);

  return (
    <section
      className={`${styles.celebration} ${isEcommerce ? styles.celebrationEcommerce : styles.celebrationHome}`}
      aria-labelledby={`cima-celebration-title-${variant}`}
    >
      <a
        href={CIMA_PREMIOS_URL}
        target="_blank"
        rel="noopener"
        className={styles.celebrationLink}
      >
        <div className={styles.celebrationInner}>
          <div className={styles.celebrationCard} aria-hidden="true">
            <div className={styles.celebrationRays} />
            <div className={styles.celebrationConfetti} />
          </div>
          <div className={styles.celebrationGrid}>
            <div className={styles.shieldWrap}>
              <img
                src={CIMA_SHIELD_PATHS.playful}
                alt={CIMA_BREAKER_ALTS.celebrationAgency}
                width={SHIELD_DESKTOP}
                height={shieldH}
                className={styles.shieldImg}
                decoding="async"
                loading="lazy"
              />
            </div>
            <div className={styles.celebrationCopy}>
              <span className={styles.pill}>PREMIOS CIMA 2026</span>
              <h2 id={`cima-celebration-title-${variant}`} className={styles.celebrationTitle}>
                Reconocidos en los
                <br />
                Premios CIMA 2026
              </h2>
              <p className={styles.celebrationCategory}>Categoría · Plataforma de E-commerce</p>
              <span className={styles.celebrationCta}>premioscima.com →</span>
            </div>
          </div>
        </div>
      </a>
    </section>
  );
}

export function CimaSoytechnoRibbonBreaker() {
  const shieldH = cimaShieldDisplayHeight(SHIELD_DESKTOP);

  return (
    <section className={styles.ribbonSection} aria-labelledby="cima-soytechno-title">
      <div className={styles.ribbonMint} aria-hidden="true">
        <div className={styles.ribbonTrack}>
          <span>E-commerce · E-commerce · E-commerce · E-commerce · E-commerce · </span>
          <span>E-commerce · E-commerce · E-commerce · E-commerce · E-commerce · </span>
        </div>
      </div>
      <div className={styles.ribbonPurple} aria-hidden="true">
        <div className={styles.ribbonTrackReverse}>
          <span>Premios CIMA 2026 · Premios CIMA 2026 · Premios CIMA 2026 · </span>
          <span>Premios CIMA 2026 · Premios CIMA 2026 · Premios CIMA 2026 · </span>
        </div>
      </div>
      <a
        href={CIMA_PREMIOS_URL}
        target="_blank"
        rel="noopener"
        className={styles.ribbonLink}
      >
        <div className={styles.medallion} aria-hidden="true">
          <div className={styles.medallionRing} />
          <div className={styles.medallionConfetti} />
        </div>
        <div className={styles.ribbonShield}>
          <img
            src={CIMA_SHIELD_PATHS.soytechno}
            alt={CIMA_BREAKER_ALTS.soytechno}
            width={SHIELD_DESKTOP}
            height={shieldH}
            className={styles.shieldImg}
            decoding="async"
            loading="lazy"
          />
        </div>
        <h2 id="cima-soytechno-title" className={styles.ribbonTitle}>
          <span className={styles.ribbonTitleDesktop}>
            SoyTechno, reconocido en los Premios CIMA 2026
          </span>
          <span className={styles.ribbonTitleMobile}>
            SoyTechno, reconocido
            <br />
            en los Premios CIMA 2026
          </span>
        </h2>
        <p className={styles.ribbonCategoryMobile}>E-commerce</p>
        <span className={styles.ribbonCta}>premioscima.com →</span>
      </a>
    </section>
  );
}
