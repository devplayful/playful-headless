import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  SEO_SEM_DIFF_SLUG,
  SEO_SEM_NEW_ANCHOR,
  SEO_SEM_OLD_ANCHOR,
  rewriteSeoSemAgenciaSeoAnchor,
} = await import('../utils/blog-seo-sem-agencia-seo-anchor.ts');
const { applyBlogLandingLinkHtml, getBlogLandingLinks } = await import(
  '../utils/blog-landing-links.ts'
);

const blogPage = readFileSync(
  new URL('../app/blog/[...slug]/page.tsx', import.meta.url),
  'utf8',
);

test('seo-y-sem rewrites the live SEO landing anchor and unwraps the image-only href', () => {
  const html = `
<p>visita nuestro <a href="/agencia-seo" target="_blank" rel="noreferrer noopener">${SEO_SEM_OLD_ANCHOR}</a> y seguro encontrarás la respuesta.</p>
<figure><a href="/agencia-seo" target="_blank" rel="noopener noreferrer"><img src="https://endpoint.playfulagency.com/wp-content/uploads/2020/08/Herramienta-SEO-3.png" alt="Banner"></a></figure>
`;
  const rewritten = rewriteSeoSemAgenciaSeoAnchor(html, SEO_SEM_DIFF_SLUG);
  assert.match(
    rewritten,
    new RegExp(`<a href="/agencia-seo"[^>]*>${SEO_SEM_NEW_ANCHOR}</a>`),
  );
  assert.doesNotMatch(rewritten, new RegExp(SEO_SEM_OLD_ANCHOR));
  assert.match(rewritten, /<figure><img src="https:\/\/endpoint\.playfulagency\.com/);
  assert.equal((rewritten.match(/href="\/agencia-seo"/g) || []).length, 1);
  assert.equal(rewriteSeoSemAgenciaSeoAnchor(html, 'otro-slug'), html);
});

test('blog page applies the seo-y-sem rewriter on the post body', () => {
  assert.match(blogPage, /rewriteSeoSemAgenciaSeoAnchor\(/);
  assert.match(blogPage, /rewriteSeoSemAgenciaSeoAnchor\(\s*rewriteInSitePageHrefs\(/);
});

test('28 oct blog body links wrap the live phrases that already exist', () => {
  const cases = [
    {
      slug: 'que-es-una-agencia-de-sem',
      href: '/agencia-seo',
      anchor: 'SEO Avanzado',
      context:
        'SEO Avanzado: Estrategias de optimización para mejorar tu visibilidad orgánica y atraer tráfico de calidad a tu sitio web.',
    },
    {
      slug: 'diseno-web-de-paginas-web',
      href: '/agencia-ux-ui',
      anchor: 'navegación intuitiva',
      context:
        'Esto implica la facilidad de uso, la navegación intuitiva, la accesibilidad y la capacidad de respuesta del diseño.',
    },
    {
      slug: 'desarrollo-de-aplicaciones-web',
      href: '/agencia-ux-ui',
      anchor: 'experiencia de usuario óptima',
      context:
        'optimizando el código, la carga de recursos y la velocidad de respuesta para garantizar una experiencia de usuario óptima.',
    },
  ];

  for (const item of cases) {
    const mapped = getBlogLandingLinks(item.slug).find(
      (link) => link.href === item.href && link.anchor === item.anchor,
    );
    assert.ok(mapped, item.slug);
    const { html, results } = applyBlogLandingLinkHtml(
      `<p>${item.context}</p>` + `<p>${'Más texto de relleno sin repetir la clave. '.repeat(20)}</p>`,
      item.slug,
    );
    const hit = results.find(
      (result) => result.href === item.href && result.wantedAnchor === item.anchor,
    );
    assert.equal(hit.status, 'applied', item.slug);
    assert.match(html, new RegExp(`<a href="${item.href}">${item.anchor}</a>`));
  }
});
