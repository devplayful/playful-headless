// Only public identity verified against the production header/footer.
// Social links disagree between components, so sameAs is intentionally omitted.
export const ORGANIZATION_SCHEMA = Object.freeze({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://playfulagency.com/#organization',
  name: 'Playful Agency',
  url: 'https://playfulagency.com/',
  logo: 'https://playfulagency.com/images/logos/playful-logo-schema.png',
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
