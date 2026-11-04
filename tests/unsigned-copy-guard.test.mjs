import test from 'node:test';
import assert from 'node:assert/strict';
import {
  UNSIGNED_COPY_MARKERS,
  assertNoUnsignedCopy,
  findUnsignedCopyInText,
} from '../scripts/assert-no-unsigned-copy.mjs';
import { shouldAssertUnsignedCopy } from '../scripts/build-with-unsigned-copy-guard.mjs';

async function collectRenderedHtml() {
  const chunks = [];

  try {
    const ecom = await import('../utils/ecommerce-aeo-2810.ts');
    const sample = [
      typeof ecom.ECOM_INTRO_LIVE_HTML === 'string' ? ecom.ECOM_INTRO_LIVE_HTML : '',
      typeof ecom.ECOM_VE_FAQ_LIVE_Q === 'string' ? ecom.ECOM_VE_FAQ_LIVE_Q : '',
    ].join('\n');
    if (typeof ecom.rewriteEcommerceAeo2810 === 'function') {
      chunks.push(ecom.rewriteEcommerceAeo2810(sample || ecom.ECOM_INTRO_HTML_380 || ''));
    }
    if (typeof ecom.ECOM_INTRO_HTML_380 === 'string') chunks.push(ecom.ECOM_INTRO_HTML_380);
    if (typeof ecom.ECOM_VE_FAQ_ANSWER_HTML === 'string') chunks.push(ecom.ECOM_VE_FAQ_ANSWER_HTML);
    if (typeof ecom.ECOM_VE_FAQ_ANSWER_JSONLD === 'string') chunks.push(ecom.ECOM_VE_FAQ_ANSWER_JSONLD);
  } catch {
    // Branch without the e-commerce #380 rewriter.
  }

  try {
    const appends = await import('../utils/blog-seo-380-appends.ts');
    if (typeof appends.rewriteBlogSeo380Appends === 'function') {
      chunks.push(appends.rewriteBlogSeo380Appends('<p>Shopify seed</p>'));
    }
    if (Array.isArray(appends.BLOG_SEO_380_APPENDS)) {
      chunks.push(appends.BLOG_SEO_380_APPENDS.map((item) => item.replace).join('\n'));
    }
  } catch {
    // Branch without blog #380 wraps.
  }

  try {
    const cashea = await import('../lib/blog-body-overrides.ts');
    if (typeof cashea.CASHEA_P1_CURRENT_HTML === 'string') chunks.push(cashea.CASHEA_P1_CURRENT_HTML);
    if (typeof cashea.CASHEA_SITEF_P4_HTML === 'string') chunks.push(cashea.CASHEA_SITEF_P4_HTML);
    if (typeof cashea.CASHEA_COMERCIOS_BLOG_BODY_HTML === 'string') {
      chunks.push(cashea.CASHEA_COMERCIOS_BLOG_BODY_HTML);
    }
  } catch {
    // Branch without Cashea #380 body.
  }

  try {
    const links = await import('../lib/links-bio.ts');
    if (Array.isArray(links.LINKS_BIO_ENTRIES)) {
      chunks.push(JSON.stringify(links.LINKS_BIO_ENTRIES));
    }
  } catch {
    // Branch without /links entries.
  }

  return chunks.filter(Boolean);
}

test('scanner reports both unsigned-copy markers with file and line', () => {
  const hits = findUnsignedCopyInText(
    'alpha\nPENDIENTE_FIRMA_JOSE_380\nCOPY SIN FIRMAR\n',
    'sample.html',
  );
  assert.deepEqual(
    hits.map((hit) => [hit.file, hit.line, hit.marker]),
    [
      ['sample.html', 2, 'PENDIENTE_FIRMA_JOSE_380'],
      ['sample.html', 3, 'COPY SIN FIRMAR'],
    ],
  );
  assert.deepEqual(UNSIGNED_COPY_MARKERS, [
    'PENDIENTE_FIRMA_JOSE_380',
    'COPY SIN FIRMAR',
  ]);
});

test('production build asserts unsigned copy only when VERCEL_ENV=production', () => {
  assert.equal(shouldAssertUnsignedCopy({ VERCEL_ENV: 'production' }), true);
  assert.equal(shouldAssertUnsignedCopy({ VERCEL_ENV: 'preview' }), false);
  assert.equal(shouldAssertUnsignedCopy({ VERCEL_ENV: 'development' }), false);
  assert.equal(shouldAssertUnsignedCopy({}), false);
});

test('unsigned copy must not appear in source or rendered HTML', async () => {
  const extraHtml = await collectRenderedHtml();
  const result = assertNoUnsignedCopy({ extraHtml });
  assert.equal(result.ok, true, result.message);
});
