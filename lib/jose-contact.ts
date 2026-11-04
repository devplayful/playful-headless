/**
 * Tarjeta de contacto de José (/jose). Edita solo este objeto si cambian los datos.
 */
export const JOSE_CONTACT = {
  fullName: 'José Reyes Labrador',
  givenName: 'José',
  familyName: 'Reyes Labrador',
  title: 'Socio y CMO',
  organization: 'Playful Agency',
  /** Formato legible en pantalla; tel: y vCard usan solo dígitos y + */
  phone: '+34 658 09 35 80',
  email: 'josemiguel@playfulagency.com', // pragma: allowlist secret
  website: 'https://playfulagency.com',
  linkedin: 'https://www.linkedin.com/company/playful-agency/',
  instagram: 'https://www.instagram.com/somosplayful',
} as const;

export function josePhoneTelValue(phone: string = JOSE_CONTACT.phone): string {
  return phone.replace(/\s/g, '');
}

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
    lines.push(`TEL;TYPE=CELL:${escapeVCardValue(josePhoneTelValue(c.phone))}`);
  }

  lines.push(`EMAIL;TYPE=INTERNET:${escapeVCardValue(c.email)}`);
  lines.push(`URL:${escapeVCardValue(c.website)}`);
  lines.push(`X-SOCIALPROFILE;type=linkedin:${escapeVCardValue(c.linkedin)}`);
  lines.push(`X-SOCIALPROFILE;type=instagram:${escapeVCardValue(c.instagram)}`);
  lines.push('END:VCARD');

  return `${lines.join('\r\n')}\r\n`;
}
