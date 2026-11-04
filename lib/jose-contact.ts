/**
 * Tarjeta de contacto de José (/jose). Edita solo este objeto antes del eShow.
 */
export const JOSE_CONTACT = {
  /** TODO: confirmar nombre tal como debe verse en la tarjeta */
  fullName: 'José Miguel Reyes',
  givenName: 'José Miguel',
  familyName: 'Reyes',
  /** TODO: cargo definitivo (p. ej. CEO, Fundador) */
  title: 'PENDIENTE',
  organization: 'Playful Agency',
  /** TODO: móvil con prefijo internacional (+34…) */
  phone: '+34 PENDIENTE',
  email: 'josemiguel@playfulagency.com', // pragma: allowlist secret
  website: 'https://playfulagency.com',
} as const;

export function isJosePhonePlaceholder(phone: string = JOSE_CONTACT.phone): boolean {
  return /PENDIENTE/i.test(phone);
}

/** Escapado vCard 3.0 (RFC 2426): \, ;, , y saltos de línea */
export function escapeVCardValue(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r\n/g, '\n')
    .replace(/\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,');
}

/** vCard 3.0 con finales de línea CRLF */
export function buildJoseVCard(): string {
  const c = JOSE_CONTACT;
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${escapeVCardValue(c.familyName)};${escapeVCardValue(c.givenName)};;;`,
    `FN:${escapeVCardValue(c.fullName)}`,
    `ORG:${escapeVCardValue(c.organization)}`,
    `TITLE:${escapeVCardValue(c.title)}`,
  ];

  if (!isJosePhonePlaceholder(c.phone)) {
    lines.push(`TEL;TYPE=CELL:${escapeVCardValue(c.phone)}`);
  }

  lines.push(
    `EMAIL;TYPE=INTERNET:${escapeVCardValue(c.email)}`,
    `URL:${escapeVCardValue(c.website)}`,
    'END:VCARD',
  );

  return `${lines.join('\r\n')}\r\n`;
}
