export const ORGANIZATION_LOGO_URL =
  'https://playfulagency.com/images/logos/playful-logo-schema.png';

// Solo perfiles oficiales comprobados en vivo (curl PlayfulQA/1.0, 21 oct 2026).
// LinkedIn fuera: responde 999 a bots, no verificable. X/@playfulagency es otra marca.
export const ORGANIZATION_SAME_AS = Object.freeze([
  'https://www.facebook.com/somosplayful',
  'https://www.instagram.com/somosplayful',
  'https://www.youtube.com/channel/UCT_NSpYZCqu7oW0nANwfnEw',
]);

export const ORGANIZATION_SCHEMA = Object.freeze({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://playfulagency.com/#organization',
  name: 'Playful Agency',
  url: 'https://playfulagency.com/',
  logo: Object.freeze({
    '@type': 'ImageObject',
    url: ORGANIZATION_LOGO_URL,
  }),
  sameAs: ORGANIZATION_SAME_AS,
  contactPoint: Object.freeze([
    Object.freeze({
      '@type': 'ContactPoint',
      contactType: 'sales',
      url: 'https://playfulagency.com/reunion-playful',
      availableLanguage: Object.freeze(['es']),
    }),
    Object.freeze({
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: 'https://playfulagency.com/contactar-agencia-de-marketing-digital',
      availableLanguage: Object.freeze(['es']),
    }),
  ]),
  areaServed: Object.freeze([
    Object.freeze({ '@type': 'Country', name: 'Venezuela' }),
    Object.freeze({ '@type': 'Country', name: 'Spain' }),
    Object.freeze({ '@type': 'Country', name: 'Mexico' }),
  ]),
});

export const ORGANIZATION_JSON_LD = JSON.stringify(ORGANIZATION_SCHEMA)
  .replace(/</g, '\\u003c');

export const WEBSITE_SCHEMA = Object.freeze({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://playfulagency.com/#website',
  name: ORGANIZATION_SCHEMA.name,
  url: ORGANIZATION_SCHEMA.url,
  inLanguage: 'es',
  publisher: {
    '@id': ORGANIZATION_SCHEMA['@id'],
  },
});

export const WEBSITE_JSON_LD = JSON.stringify(WEBSITE_SCHEMA)
  .replace(/</g, '\\u003c');
