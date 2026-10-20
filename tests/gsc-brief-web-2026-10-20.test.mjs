import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const {
  SITEMAP_STATIC_PATHS,
  SITEMAP_BLOG_PATHS,
  buildSitemapXml,
  getSitemapLocs,
} = await import('../utils/apex-sitemap.ts');
const { BLOG_INBOUND_COVERAGE_PATHS } = await import('../lib/blog-related-posts.ts');
const { CLOSED_BLOG_PATHS } = await import('../utils/blog-closed-paths.ts');

const ONG_PATH = '/blog/seo/marketing-social-la-estrategia-ganadora-de-las-ong';

const GSC_UNKNOWN_BLOG_PATHS = [
  '/blog/email-marketing/como-promocionar-en-black-friday-implementa-estas-estrategias',
  '/blog/pautas-digitales/conoce-como-impulsar-tu-marca-online',
  '/blog/pautas-digitales/el-sms-marketing',
  '/blog/pautas-digitales/necesitas-realizar-un-informe-seo-nosotros-lo-hacemos-por-ti',
  '/blog/seo/aprende-todo-sobre-el-seo',
];

const header = readFileSync(new URL('../components/HeaderClient.tsx', import.meta.url), 'utf8');
const footer = readFileSync(new URL('../components/Footer.tsx', import.meta.url), 'utf8');
const hubContent = readFileSync(
  new URL('../app/(frontend)/casos-de-exito/CaseStudiesContent.tsx', import.meta.url),
  'utf8',
);
const shopifyCases = readFileSync(
  new URL('../app/(frontend)/agencia-shopify/shopify-cases.ts', import.meta.url),
  'utf8',
);

test('1) llms.txt routes stay served but out of sitemap.xml', () => {
  assert.equal(SITEMAP_STATIC_PATHS.includes('/llms.txt'), false);
  assert.equal(SITEMAP_STATIC_PATHS.includes('/llms-full.txt'), false);
  const xml = buildSitemapXml();
  assert.doesNotMatch(xml, /\/llms\.txt</);
  assert.doesNotMatch(xml, /\/llms-full\.txt</);
});

test('2) GSC-unknown blog URLs stay in sitemap and inbound coverage list', () => {
  const locs = getSitemapLocs();
  for (const path of GSC_UNKNOWN_BLOG_PATHS) {
    assert.equal(locs.includes(`https://playfulagency.com${path}`), true, path);
    assert.equal(BLOG_INBOUND_COVERAGE_PATHS.includes(path), true, path);
  }
});

test('3) casos de éxito hub and cases are linked from nav blocks and Shopify cases', () => {
  assert.match(header, /href="\/casos-de-exito"/);
  assert.match(footer, /href="\/casos-de-exito"/);
  assert.match(header, /href=\{`\/casos-de-exito\/\$\{caseStudy\.slug\}`\}/);
  assert.match(hubContent, /href=\{`\/casos-de-exito\/\$\{caseStudy\.slug\}`\}/);
  assert.match(shopifyCases, /odwalla-shopify-dtc-ecommerce/);
});

test('4) agencia-ux-ui is in the services menu (header)', () => {
  assert.match(header, /title: 'UX\/UI', url: '\/agencia-ux-ui'/);
});

test('5) ONG closed post is not in sitemap and has no in-repo internal hrefs', () => {
  assert.equal(CLOSED_BLOG_PATHS.includes(ONG_PATH), true);
  assert.equal(SITEMAP_BLOG_PATHS.includes(ONG_PATH), false);
  const xml = buildSitemapXml();
  assert.doesNotMatch(xml, new RegExp(`${ONG_PATH.replaceAll('/', '\\/')}<`));
  const hits = execSync(
    `rg -l '${ONG_PATH}' /workspace --glob '!tests/gsc-brief-web-2026-10-20.test.mjs'`,
    { encoding: 'utf8' },
  )
    .trim()
    .split('\n')
    .filter(Boolean)
    .map((path) => path.replace(/^\/workspace\//, ''));
  assert.deepEqual(
    hits.sort(),
    [
      'config/blog-closed-posts.json',
      'tests/blog-closed-posts.test.mjs',
      'utils/blog-closed-paths.ts',
    ].sort(),
  );
});
