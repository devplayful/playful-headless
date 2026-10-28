import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

/**
 * La marca vive en el código fuente, no en el HTML renderizado.
 * La guardia de CI/producción escanea el fuente.
 */
const {
  ECOM_INTRO_HTML_380,
  ECOM_VE_FAQ_ANSWER_HTML,
  ECOM_VE_FAQ_ANSWER_JSONLD,
  PENDIENTE_FIRMA_JOSE_380,
  rewriteEcommerceAeo2810,
} = await import('../utils/ecommerce-aeo-2810.ts');
const { BLOG_SEO_380_APPENDS, rewriteBlogSeo380Appends } = await import(
  '../utils/blog-seo-380-appends.ts'
);

const SOURCE_FILES = [
  'utils/pendiente-firma-jose-380.ts',
  'utils/ecommerce-aeo-2810.ts',
  'utils/blog-seo-380-appends.ts',
];

test('prerelease: #380 copy is in; marca solo en código fuente', () => {
  for (const rel of SOURCE_FILES) {
    const source = readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');
    assert.match(source, /PENDIENTE_FIRMA_JOSE_380/, rel);
  }
  assert.equal(PENDIENTE_FIRMA_JOSE_380, 'PENDIENTE_FIRMA_JOSE_380');

  const rewritten = rewriteEcommerceAeo2810(
    `${typeof ECOM_INTRO_HTML_380 === 'string' ? ECOM_INTRO_HTML_380 : ''}`,
    'agencia-e-commerce',
  );
  assert.match(ECOM_INTRO_HTML_380, /SoyTechno/);
  assert.doesNotMatch(rewritten, /COPY SIN FIRMAR/);
  assert.doesNotMatch(rewritten, /data-pendiente-firma/);
  assert.doesNotMatch(rewritten, /PENDIENTE_FIRMA_JOSE_380/);
  assert.doesNotMatch(ECOM_INTRO_HTML_380, /COPY SIN FIRMAR/);
  assert.doesNotMatch(ECOM_VE_FAQ_ANSWER_HTML, /COPY SIN FIRMAR/);
  assert.doesNotMatch(ECOM_VE_FAQ_ANSWER_JSONLD, /COPY SIN FIRMAR/);
  assert.equal(
    BLOG_SEO_380_APPENDS.every((item) => !item.replace.includes(PENDIENTE_FIRMA_JOSE_380)),
    true,
  );
  const e1 = rewriteBlogSeo380Appends(
    `<p>${BLOG_SEO_380_APPENDS[0].find}</p>`,
    BLOG_SEO_380_APPENDS[0].slug,
  );
  assert.doesNotMatch(e1, /data-pendiente-firma/);
  assert.doesNotMatch(e1, /PENDIENTE_FIRMA_JOSE_380/);
});
