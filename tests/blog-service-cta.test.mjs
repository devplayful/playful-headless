import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  getBlogServiceCta,
  applyBlogServiceMentionLink,
} = await import('../utils/blog-service-cta.ts');

const blogPage = readFileSync(
  new URL('../app/blog/[...slug]/page.tsx', import.meta.url),
  'utf8',
);

test('mapped slug produces the Agencia SEM service href', () => {
  const cta = getBlogServiceCta('que-es-una-agencia-de-sem');
  assert.ok(cta, 'expected a CTA for que-es-una-agencia-de-sem');
  assert.equal(cta.href, '/agencia-sem');
  assert.match(cta.label, /Agencia SEM/i);
});

test('other slugs do not add the SEM CTA', () => {
  assert.equal(getBlogServiceCta('actualizar-tu-e-commerce'), null);
  assert.equal(getBlogServiceCta('cintillos-de-promocion'), null);
  assert.equal(getBlogServiceCta('aprende-todo-sobre-el-seo'), null);
  assert.equal(getBlogServiceCta('agencia-sem'), null);
});

test('blog post page renders the mapped CTA after article HTML', () => {
  assert.match(blogPage, /getBlogServiceCta\(postSlug\)/);
  assert.match(blogPage, /serviceCta\.href/);
  assert.match(blogPage, /dangerouslySetInnerHTML=\{\{ __html: contentWithIds \}\}/);
  const contentIdx = blogPage.indexOf('dangerouslySetInnerHTML={{ __html: contentWithIds }}');
  const ctaIdx = blogPage.indexOf('serviceCta.href');
  const tagsIdx = blogPage.indexOf('{/* Tags */}');
  assert.ok(contentIdx > 0 && ctaIdx > contentIdx, 'CTA must come after article HTML');
  assert.ok(tagsIdx > ctaIdx, 'CTA must come before tags');
});

test('post canonical stays on the blog post, not /agencia-sem', () => {
  assert.match(blogPage, /canonicalForPath\(blogPostPath\(post\)\)/);
  const metadataFn = blogPage.slice(blogPage.indexOf('export async function generateMetadata'));
  assert.doesNotMatch(metadataFn, /agencia-sem/);
  assert.doesNotMatch(metadataFn, /BLOG_SERVICE_CTAS|getBlogServiceCta/);
});

test('wraps the first unlinked agencia SEM mention', () => {
  const html = applyBlogServiceMentionLink(
    '<p>Una agencia SEM gestiona anuncios de pago.</p>',
    'que-es-una-agencia-de-sem',
  );
  assert.match(html, /<a href="\/agencia-sem">agencia SEM<\/a>/);
});

test('wraps Agencia SEM and agencia de SEM casings', () => {
  const titled = applyBlogServiceMentionLink(
    '<p>Agencia SEM con resultados.</p>',
    'que-es-una-agencia-de-sem',
  );
  assert.match(titled, /<a href="\/agencia-sem">Agencia SEM<\/a>/);

  const deForm = applyBlogServiceMentionLink(
    '<p>Contrata una agencia de SEM hoy.</p>',
    'que-es-una-agencia-de-sem',
  );
  assert.match(deForm, /<a href="\/agencia-sem">agencia de SEM<\/a>/);
});

test('does not wrap when a link to /agencia-sem already exists', () => {
  const input =
    '<p>Ver <a href="/agencia-sem">nuestro servicio</a>. Somos agencia SEM.</p>';
  const html = applyBlogServiceMentionLink(input, 'que-es-una-agencia-de-sem');
  assert.equal((html.match(/href="\/agencia-sem"/g) || []).length, 1);
  assert.match(html, /Somos agencia SEM/);
  assert.doesNotMatch(html, /<a href="\/agencia-sem">agencia SEM<\/a>/);
});

test('does not wrap a mention already inside an anchor', () => {
  const input = '<p><a href="/blog/otro">agencia SEM</a> en el texto.</p>';
  const html = applyBlogServiceMentionLink(input, 'que-es-una-agencia-de-sem');
  assert.doesNotMatch(html, /href="\/agencia-sem"/);
});

test('other slugs do not wrap SEM mentions', () => {
  const input = '<p>Una agencia SEM gestiona anuncios.</p>';
  assert.equal(applyBlogServiceMentionLink(input, 'otro-articulo'), input);
});
