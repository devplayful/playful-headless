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

const LOTE_2 = [
  ['como-elegir-el-mejor-framework-para-tu-web', '/images/blog/01-framework-magnific-5j9Sv3wKxe.png'],
  ['seo-y-sem-que-son-y-en-que-se-diferencian', '/images/blog/02-seo-y-sem-magnific-SyniXs1Ub8.png'],
  ['7-consejos-seo-para-posicionar-tu-pagina', '/images/blog/03-7-consejos-seo-magnific-3zBMZYMREY.png'],
  ['pasos-para-aumentar-clientes-en-tu-negocio', '/images/blog/04-aumentar-clientes-magnific-gOz6HTdSXO.png'],
  ['que-es-data-studio-de-google-y-como-funciona', '/images/blog/06-data-studio-magnific-yiVzbnFPW9.png'],
  ['conoce-los-tipos-de-marketing', '/images/blog/07-tipos-marketing-magnific-w4WZutE7EI.png'],
];

const LOTE_3 = [
  ['como-posicionar-tu-negocio-en-google-ads', '/images/blog/02-posicionar-google-ads-magnific-s7A2J1Kl8e.png'],
  ['publicidad-digital-en-tu-negocio', '/images/blog/03-publicidad-digital-magnific-5j9PO4hKxe.png'],
  ['desarrollo-ui-ux', '/images/blog/04-desarrollo-ui-ux-magnific-jUZ6ijXLD0.png'],
  ['aprende-todo-sobre-el-seo', '/images/blog/05-posicionamiento-web-magnific-N2eMFsC6D9.png'],
  ['como-elegir-tus-palabras-claves', '/images/blog/06-palabras-claves-magnific-1li9dWjr4r.png'],
  ['ecommerce-mi-negocio-online', '/images/blog/07-ecommerce-negocio-online-magnific-s7AzDuWl8e.png'],
];

const LOTE_4 = [
  [
    'blog-corporativo-aumenta-el-trafico-de-tu-sitio-web',
    '/images/blog/08-blog-corporativo-magnific-N2eryB06D9.png',
  ],
  ['rediseno-web', '/images/blog/09-rediseno-web-magnific-VXQNEs8MMU.png'],
  [
    'chat-gpt-puede-mejorar-el-seo-de-una-pagina-web',
    '/images/blog/10-chat-gpt-seo-magnific-iGXlUlf3uK.png',
  ],
];

const LOTE_5 = [
  [
    'auditoria-seo-que-es-como-se-hace',
    '/images/blog/11-auditoria-seo-magnific-s7AQv7dl8e.png',
  ],
  [
    'zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce',
    '/images/blog/12-zelle-venezuela-magnific-JN0rWQjOq4.png',
  ],
];

function functionBody(source, name) {
  const start = source.indexOf(`export async function ${name}`);
  assert.notEqual(start, -1, `missing ${name}`);
  const nextExport = source.indexOf('\nexport ', start + 1);
  return nextExport === -1 ? source.slice(start) : source.slice(start, nextExport);
}

function assertMappedCovers(pairs) {
  for (const [slug, path] of pairs) {
    assert.equal(BLOG_COVER_OVERRIDES[slug], path);
    assert.equal(blogCoverForSlug(slug), path);
    assert.equal(resolveBlogCoverUrl(slug, 'https://endpoint.example/old.jpg'), path);
    assert.ok(existsSync(join(root, 'public', path.replace(/^\//, ''))));
  }
}

function pngSize(buffer) {
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

test('lote 1 maps exactly 7 slugs to Magnific PNG covers', () => {
  assert.equal(BLOG_COVER_SIZE.width, 2560);
  assert.equal(BLOG_COVER_SIZE.height, 1440);
  assertMappedCovers(LOTE_1);
  assert.equal(
    BLOG_COVER_OVERRIDES['que-es-una-agencia-de-sem'],
    '/images/blog/07-sem-magnific-YMaXoMhWeC.png',
  );
});

test('lote 2 maps 6 more slugs without removing lote 1', () => {
  assertMappedCovers(LOTE_2);
  for (const [slug] of LOTE_1) {
    assert.ok(slug in BLOG_COVER_OVERRIDES, `lote 1 slug missing: ${slug}`);
  }
});

test('lote 3 maps 6 slugs without removing lote 1 or lote 2', () => {
  assert.equal(LOTE_3.length, 6);
  assertMappedCovers(LOTE_3);
  for (const [slug] of [...LOTE_1, ...LOTE_2]) {
    assert.ok(slug in BLOG_COVER_OVERRIDES, `prior lote slug missing: ${slug}`);
  }
});

test('lote 4 maps N2eryB06D9, VXQNEs8MMU and iGXlUlf3uK without removing prior lotes', () => {
  assert.equal(LOTE_4.length, 3);
  assertMappedCovers(LOTE_4);
  for (const [slug] of [...LOTE_1, ...LOTE_2, ...LOTE_3]) {
    assert.ok(slug in BLOG_COVER_OVERRIDES, `prior lote slug missing: ${slug}`);
  }
});

test('lote 5 maps s7AQv7dl8e and JN0rWQjOq4 without removing prior lotes', () => {
  assert.equal(Object.keys(BLOG_COVER_OVERRIDES).length, 24);
  assert.equal(LOTE_5.length, 2);
  assertMappedCovers(LOTE_5);
  for (const [slug] of [...LOTE_1, ...LOTE_2, ...LOTE_3, ...LOTE_4]) {
    assert.ok(slug in BLOG_COVER_OVERRIDES, `prior lote slug missing: ${slug}`);
  }
});

test('7 consejos SEO cover is Magnific 3zBMZYMREY and drops iGXTJXm3uK', () => {
  const path = '/images/blog/03-7-consejos-seo-magnific-3zBMZYMREY.png';
  assert.equal(BLOG_COVER_OVERRIDES['7-consejos-seo-para-posicionar-tu-pagina'], path);
  assert.ok(existsSync(join(root, 'public', path.replace(/^\//, ''))));
  assert.equal(
    existsSync(join(root, 'public/images/blog/03-7-consejos-seo-magnific-iGXTJXm3uK.png')),
    false,
  );
  assert.doesNotMatch(JSON.stringify(BLOG_COVER_OVERRIDES), /iGXTJXm3uK/);
});

test('N2eMFsC6D9 is canonical on aprende-todo-sobre-el-seo only', () => {
  const path = '/images/blog/05-posicionamiento-web-magnific-N2eMFsC6D9.png';
  assert.equal(BLOG_COVER_OVERRIDES['aprende-todo-sobre-el-seo'], path);
  assert.equal(blogCoverForSlug('aprende-todo-sobre-el-seo'), path);
  assert.equal(blogCoverForSlug('como-hacer-posicionamiento-web-en-buscadores'), '');
  assert.equal(
    resolveBlogCoverUrl(
      'como-hacer-posicionamiento-web-en-buscadores',
      'https://endpoint.example/wp-featured.jpg',
    ),
    'https://endpoint.example/wp-featured.jpg',
  );
  assert.ok(!('como-hacer-posicionamiento-web-en-buscadores' in BLOG_COVER_OVERRIDES));
  const n2Owners = Object.entries(BLOG_COVER_OVERRIDES)
    .filter(([, cover]) => cover.includes('N2eMFsC6D9'))
    .map(([slug]) => slug);
  assert.deepEqual(n2Owners, ['aprende-todo-sobre-el-seo']);
  const donor3z = Object.entries(BLOG_COVER_OVERRIDES)
    .filter(([, cover]) => cover.includes('3zBMZYMREY'))
    .map(([slug]) => slug);
  assert.deepEqual(donor3z, ['7-consejos-seo-para-posicionar-tu-pagina']);
});

test('VXQNEs8MMU is exclusive to rediseno-web', async () => {
  const path = '/images/blog/09-rediseno-web-magnific-VXQNEs8MMU.png';
  assert.equal(BLOG_COVER_OVERRIDES['rediseno-web'], path);
  assert.equal(blogCoverForSlug('rediseno-web'), path);
  const vxqnOwners = Object.entries(BLOG_COVER_OVERRIDES)
    .filter(([, cover]) => cover.includes('VXQNEs8MMU'))
    .map(([slug]) => slug);
  assert.deepEqual(vxqnOwners, ['rediseno-web']);
  const n2eryOwners = Object.entries(BLOG_COVER_OVERRIDES)
    .filter(([, cover]) => cover.includes('N2eryB06D9'))
    .map(([slug]) => slug);
  assert.deepEqual(n2eryOwners, ['blog-corporativo-aumenta-el-trafico-de-tu-sitio-web']);
  const n2eOwners = Object.entries(BLOG_COVER_OVERRIDES)
    .filter(([, cover]) => cover.includes('N2eMFsC6D9'))
    .map(([slug]) => slug);
  assert.deepEqual(n2eOwners, ['aprende-todo-sobre-el-seo']);
  const donor3z = Object.entries(BLOG_COVER_OVERRIDES)
    .filter(([, cover]) => cover.includes('3zBMZYMREY'))
    .map(([slug]) => slug);
  assert.deepEqual(donor3z, ['7-consejos-seo-para-posicionar-tu-pagina']);
  const file = join(root, 'public', path.replace(/^\//, ''));
  const buffer = await readFile(file);
  assert.deepEqual(pngSize(buffer), { width: 2752, height: 1536 }, path);
  assert.equal(buffer[25], 2, 'PNG should be 8-bit RGB');
});

test('JN0rWQjOq4 is exclusive to zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce', async () => {
  const path = '/images/blog/12-zelle-venezuela-magnific-JN0rWQjOq4.png';
  assert.equal(
    BLOG_COVER_OVERRIDES['zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce'],
    path,
  );
  assert.equal(
    blogCoverForSlug('zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce'),
    path,
  );
  const jn0rOwners = Object.entries(BLOG_COVER_OVERRIDES)
    .filter(([, cover]) => cover.includes('JN0rWQjOq4'))
    .map(([slug]) => slug);
  assert.deepEqual(jn0rOwners, ['zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce']);
  const s7aqOwners = Object.entries(BLOG_COVER_OVERRIDES)
    .filter(([, cover]) => cover.includes('s7AQv7dl8e'))
    .map(([slug]) => slug);
  assert.deepEqual(s7aqOwners, ['auditoria-seo-que-es-como-se-hace']);
  const igxlOwners = Object.entries(BLOG_COVER_OVERRIDES)
    .filter(([, cover]) => cover.includes('iGXlUlf3uK'))
    .map(([slug]) => slug);
  assert.deepEqual(igxlOwners, ['chat-gpt-puede-mejorar-el-seo-de-una-pagina-web']);
  const vxqnOwners = Object.entries(BLOG_COVER_OVERRIDES)
    .filter(([, cover]) => cover.includes('VXQNEs8MMU'))
    .map(([slug]) => slug);
  assert.deepEqual(vxqnOwners, ['rediseno-web']);
  const n2eryOwners = Object.entries(BLOG_COVER_OVERRIDES)
    .filter(([, cover]) => cover.includes('N2eryB06D9'))
    .map(([slug]) => slug);
  assert.deepEqual(n2eryOwners, ['blog-corporativo-aumenta-el-trafico-de-tu-sitio-web']);
  const n2eOwners = Object.entries(BLOG_COVER_OVERRIDES)
    .filter(([, cover]) => cover.includes('N2eMFsC6D9'))
    .map(([slug]) => slug);
  assert.deepEqual(n2eOwners, ['aprende-todo-sobre-el-seo']);
  const donor3z = Object.entries(BLOG_COVER_OVERRIDES)
    .filter(([, cover]) => cover.includes('3zBMZYMREY'))
    .map(([slug]) => slug);
  assert.deepEqual(donor3z, ['7-consejos-seo-para-posicionar-tu-pagina']);
  const file = join(root, 'public', path.replace(/^\//, ''));
  const buffer = await readFile(file);
  assert.deepEqual(pngSize(buffer), { width: 1376, height: 768 }, path);
  assert.equal(buffer[25], 2, 'PNG should be 8-bit RGB');
});

test('s7AQv7dl8e is exclusive to auditoria-seo-que-es-como-se-hace', async () => {
  const path = '/images/blog/11-auditoria-seo-magnific-s7AQv7dl8e.png';
  assert.equal(BLOG_COVER_OVERRIDES['auditoria-seo-que-es-como-se-hace'], path);
  assert.equal(blogCoverForSlug('auditoria-seo-que-es-como-se-hace'), path);
  const s7aqOwners = Object.entries(BLOG_COVER_OVERRIDES)
    .filter(([, cover]) => cover.includes('s7AQv7dl8e'))
    .map(([slug]) => slug);
  assert.deepEqual(s7aqOwners, ['auditoria-seo-que-es-como-se-hace']);
  const igxlOwners = Object.entries(BLOG_COVER_OVERRIDES)
    .filter(([, cover]) => cover.includes('iGXlUlf3uK'))
    .map(([slug]) => slug);
  assert.deepEqual(igxlOwners, ['chat-gpt-puede-mejorar-el-seo-de-una-pagina-web']);
  const vxqnOwners = Object.entries(BLOG_COVER_OVERRIDES)
    .filter(([, cover]) => cover.includes('VXQNEs8MMU'))
    .map(([slug]) => slug);
  assert.deepEqual(vxqnOwners, ['rediseno-web']);
  const n2eryOwners = Object.entries(BLOG_COVER_OVERRIDES)
    .filter(([, cover]) => cover.includes('N2eryB06D9'))
    .map(([slug]) => slug);
  assert.deepEqual(n2eryOwners, ['blog-corporativo-aumenta-el-trafico-de-tu-sitio-web']);
  const n2eOwners = Object.entries(BLOG_COVER_OVERRIDES)
    .filter(([, cover]) => cover.includes('N2eMFsC6D9'))
    .map(([slug]) => slug);
  assert.deepEqual(n2eOwners, ['aprende-todo-sobre-el-seo']);
  const donor3z = Object.entries(BLOG_COVER_OVERRIDES)
    .filter(([, cover]) => cover.includes('3zBMZYMREY'))
    .map(([slug]) => slug);
  assert.deepEqual(donor3z, ['7-consejos-seo-para-posicionar-tu-pagina']);
  const file = join(root, 'public', path.replace(/^\//, ''));
  const buffer = await readFile(file);
  assert.deepEqual(pngSize(buffer), { width: 1376, height: 768 }, path);
  assert.equal(buffer[25], 2, 'PNG should be 8-bit RGB');
});

test('iGXlUlf3uK is exclusive to chat-gpt-puede-mejorar-el-seo-de-una-pagina-web', async () => {
  const path = '/images/blog/10-chat-gpt-seo-magnific-iGXlUlf3uK.png';
  assert.equal(
    BLOG_COVER_OVERRIDES['chat-gpt-puede-mejorar-el-seo-de-una-pagina-web'],
    path,
  );
  assert.equal(
    blogCoverForSlug('chat-gpt-puede-mejorar-el-seo-de-una-pagina-web'),
    path,
  );
  const igxlOwners = Object.entries(BLOG_COVER_OVERRIDES)
    .filter(([, cover]) => cover.includes('iGXlUlf3uK'))
    .map(([slug]) => slug);
  assert.deepEqual(igxlOwners, ['chat-gpt-puede-mejorar-el-seo-de-una-pagina-web']);
  const vxqnOwners = Object.entries(BLOG_COVER_OVERRIDES)
    .filter(([, cover]) => cover.includes('VXQNEs8MMU'))
    .map(([slug]) => slug);
  assert.deepEqual(vxqnOwners, ['rediseno-web']);
  const n2eryOwners = Object.entries(BLOG_COVER_OVERRIDES)
    .filter(([, cover]) => cover.includes('N2eryB06D9'))
    .map(([slug]) => slug);
  assert.deepEqual(n2eryOwners, ['blog-corporativo-aumenta-el-trafico-de-tu-sitio-web']);
  const n2eOwners = Object.entries(BLOG_COVER_OVERRIDES)
    .filter(([, cover]) => cover.includes('N2eMFsC6D9'))
    .map(([slug]) => slug);
  assert.deepEqual(n2eOwners, ['aprende-todo-sobre-el-seo']);
  const donor3z = Object.entries(BLOG_COVER_OVERRIDES)
    .filter(([, cover]) => cover.includes('3zBMZYMREY'))
    .map(([slug]) => slug);
  assert.deepEqual(donor3z, ['7-consejos-seo-para-posicionar-tu-pagina']);
  const file = join(root, 'public', path.replace(/^\//, ''));
  const buffer = await readFile(file);
  assert.deepEqual(pngSize(buffer), { width: 1376, height: 768 }, path);
  assert.equal(buffer[25], 2, 'PNG should be 8-bit RGB');
});

test('N2eryB06D9 is exclusive to blog-corporativo-aumenta-el-trafico-de-tu-sitio-web', async () => {
  const path = '/images/blog/08-blog-corporativo-magnific-N2eryB06D9.png';
  assert.equal(
    BLOG_COVER_OVERRIDES['blog-corporativo-aumenta-el-trafico-de-tu-sitio-web'],
    path,
  );
  assert.equal(
    blogCoverForSlug('blog-corporativo-aumenta-el-trafico-de-tu-sitio-web'),
    path,
  );
  const n2eryOwners = Object.entries(BLOG_COVER_OVERRIDES)
    .filter(([, cover]) => cover.includes('N2eryB06D9'))
    .map(([slug]) => slug);
  assert.deepEqual(n2eryOwners, ['blog-corporativo-aumenta-el-trafico-de-tu-sitio-web']);
  const n2eOwners = Object.entries(BLOG_COVER_OVERRIDES)
    .filter(([, cover]) => cover.includes('N2eMFsC6D9'))
    .map(([slug]) => slug);
  assert.deepEqual(n2eOwners, ['aprende-todo-sobre-el-seo']);
  const donor3z = Object.entries(BLOG_COVER_OVERRIDES)
    .filter(([, cover]) => cover.includes('3zBMZYMREY'))
    .map(([slug]) => slug);
  assert.deepEqual(donor3z, ['7-consejos-seo-para-posicionar-tu-pagina']);
  const file = join(root, 'public', path.replace(/^\//, ''));
  const buffer = await readFile(file);
  assert.deepEqual(pngSize(buffer), { width: 2752, height: 1536 }, path);
  assert.equal(buffer[25], 2, 'PNG should be 8-bit RGB');
});

test('archived google-ads-grants / rg39Phdxtc is not remapped', () => {
  assert.ok(!('google-ads-grants' in BLOG_COVER_OVERRIDES));
  assert.equal(blogCoverForSlug('google-ads-grants'), '');
  assert.doesNotMatch(JSON.stringify(BLOG_COVER_OVERRIDES), /rg39Phdxtc|google-ads-grants/);
  assert.equal(
    existsSync(join(root, 'public/images/blog/01-google-ads-grants-magnific-rg39Phdxtc.png')),
    false,
  );
});

test('override PNGs are 2560×1440', async () => {
  for (const [, path] of [...LOTE_1, ...LOTE_2, ...LOTE_3]) {
    const file = join(root, 'public', path.replace(/^\//, ''));
    const buffer = await readFile(file);
    assert.deepEqual(pngSize(buffer), { width: 2560, height: 1440 }, path);
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
  assert.doesNotMatch(
    source,
    /tCjfdhqmZJ|1lis1ttr4r|8aruUnFIrU|Bhkm4lIoQR|ks6LT5H16B|iGX2L9R3uK|iGXTJXm3uK|WDfo97dcXe|p8qfFVNehw|yiVGtRkPW9|Lw29ezTswO|8arFJtUIrU/,
  );
});
