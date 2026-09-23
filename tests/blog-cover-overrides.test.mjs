import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const {
  BLOG_COVER_OVERRIDES,
  BLOG_COVER_SIZE,
  blogCoverForSlug,
  resolveBlogCoverUrl,
} = await import('../lib/blog-cover-image.ts');

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const LOTE_1 = [
  ['actualizar-tu-e-commerce', '/images/blog/01-actualizar-magnific-mELf0NZhJQ.png'],
  ['crear-un-e-commerce', '/images/blog/02-crear-magnific-YMaV8MXWeC.png'],
  ['google-y-su-inteligencia-artificial', '/images/blog/03-google-ia-magnific-IfxaU6ntvE.png'],
  ['optimizacion-multimedia', '/images/blog/04-multimedia-magnific-jUZSVwWLD0.png'],
  ['contenido-duplicado', '/images/blog/05-duplicado-magnific-jUZSmGGLD0.png'],
  ['diseno-web-de-paginas-web', '/images/blog/06-diseno-magnific-O6TNLxdynm.png'],
  ['que-es-una-agencia-de-sem', '/images/blog/07-sem-magnific-YMaXoMhWeC.png'],
];

function functionBody(source, name) {
  const start = source.indexOf(`export async function ${name}`);
  assert.notEqual(start, -1, `missing ${name}`);
  const nextExport = source.indexOf('\nexport ', start + 1);
  return nextExport === -1 ? source.slice(start) : source.slice(start, nextExport);
}

test('lote 1 maps exactly 7 slugs to Magnific PNG covers', () => {
  assert.equal(Object.keys(BLOG_COVER_OVERRIDES).length, 7);
  assert.equal(BLOG_COVER_SIZE.width, 2560);
  assert.equal(BLOG_COVER_SIZE.height, 1440);
  for (const [slug, path] of LOTE_1) {
    assert.equal(BLOG_COVER_OVERRIDES[slug], path);
    assert.equal(blogCoverForSlug(slug), path);
    assert.equal(resolveBlogCoverUrl(slug, 'https://endpoint.example/old.jpg'), path);
    assert.ok(existsSync(join(root, 'public', path.replace(/^\//, ''))));
  }
});

test('unknown slugs keep the WordPress featured fallback', () => {
  assert.equal(blogCoverForSlug('cintillos-de-promocion'), '');
  assert.equal(blogCoverForSlug(''), '');
  assert.equal(blogCoverForSlug(undefined), '');
  assert.equal(
    resolveBlogCoverUrl('cintillos-de-promocion', 'https://endpoint.example/old.jpg'),
    'https://endpoint.example/old.jpg',
  );
});

test('listing, latest and by-slug pipelines apply resolveBlogCoverUrl', async () => {
  const source = await readFile(new URL('../services/wordpress.ts', import.meta.url), 'utf8');
  assert.match(source, /resolveBlogCoverUrl/);
  assert.match(functionBody(source, 'getBlogPosts'), /resolveBlogCoverUrl\(/);
  assert.match(functionBody(source, 'getLatestBlogPosts'), /resolveBlogCoverUrl\(/);
  assert.match(functionBody(source, 'getBlogPostBySlug'), /resolveBlogCoverUrl\(/);
});

test('blog post generateMetadata points OG and Twitter at the cover override', async () => {
  const source = await readFile(new URL('../app/blog/[...slug]/page.tsx', import.meta.url), 'utf8');
  assert.match(source, /blogCoverForSlug/);
  assert.match(source, /BLOG_COVER_SIZE/);
  const meta = functionBody(source, 'generateMetadata');
  assert.match(meta, /coverOverride \|\| post\.featured_media_url/);
  assert.match(meta, /twitter:\s*\{/);
  assert.match(meta, /images:\s*\[imageUrl\]/);
  assert.doesNotMatch(source, /tCjfdhqmZJ|1lis1ttr4r|8aruUnFIrU|Bhkm4lIoQR|ks6LT5H16B|iGX2L9R3uK/);
});
