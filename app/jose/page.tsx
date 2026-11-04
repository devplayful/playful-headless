import Image from 'next/image';
import Link from 'next/link';
import { JOSE_CONTACT, isJosePhonePlaceholder } from '@/lib/jose-contact';
import styles from './jose-contact.module.css';

export default function JoseContactPage() {
  const showPhone = !isJosePhonePlaceholder(JOSE_CONTACT.phone);

  return (
    <div className={styles.page} data-jose-contact>
      <div className={styles.inner}>
        <Link href="/" className={styles.logoLink} aria-label="Playful Agency — inicio">
          <Image
            src="/images/logos/playful-logov.svg"
            alt="Playful Agency"
            width={72}
            height={24}
            priority
            className="h-7 w-auto"
          />
        </Link>

        <article className={styles.card}>
          <h1 className={styles.name}>{JOSE_CONTACT.fullName}</h1>
          <p className={styles.role}>{JOSE_CONTACT.title}</p>
          <p className={styles.org}>{JOSE_CONTACT.organization}</p>

          <ul className={styles.list}>
            {showPhone ? (
              <li>
                <span className={styles.itemLabel}>Teléfono</span>
                <a className={styles.itemLink} href={`tel:${JOSE_CONTACT.phone.replace(/\s/g, '')}`}>
                  {JOSE_CONTACT.phone}
                </a>
              </li>
            ) : (
              <li>
                <span className={styles.itemLabel}>Teléfono</span>
                <span className={styles.itemMuted}>{JOSE_CONTACT.phone}</span>
              </li>
            )}
            <li>
              <span className={styles.itemLabel}>Email</span>
              <a className={styles.itemLink} href={`mailto:${JOSE_CONTACT.email}`}>
                {JOSE_CONTACT.email}
              </a>
            </li>
            <li>
              <span className={styles.itemLabel}>Web</span>
              <a
                className={styles.itemLink}
                href={JOSE_CONTACT.website}
                target="_blank"
                rel="noopener noreferrer"
              >
                playfulagency.com
              </a>
            </li>
          </ul>
        </article>

        <a
          className={styles.saveBtn}
          href="/jose/contacto.vcf"
          download="jose-playful.vcf"
        >
          Guardar contacto
        </a>
      </div>
    </div>
  );
}
