import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { rewriteInSitePageHrefs, rewriteWpRenderedHtmlFields } from '../services/rewrite-in-site-hrefs.mjs';

const LINKEDIN_POST =
  'https://endpoint.playfulagency.com/blog/pautas-digitales/anuncios-en-linkedin';
const BLACK_FRIDAY_POST =
  'https://endpoint.playfulagency.com/blog/email-marketing/como-promocionar-en-black-friday-implementa-estas-estrategias';
const MEDIA_SRC =
  'https://endpoint.playfulagency.com/wp-content/uploads/2024/11/hero.jpg';
const MEDIA_HREF =
  'https://endpoint.playfulagency.com/wp-content/uploads/2024/11/guia.pdf';

function countHostHrefs(html, host) {
  const re = new RegExp(`href=(["'])https?://${host.replaceAll('.', '\\.')}[^"']*\\1`, 'gi');
  return (html.match(re) || []).length;
}

test('rewrites endpoint, old, www, and apex in-site hrefs to same-path relatives', () => {
  const html = [
    `<a href="${LINKEDIN_POST}">LinkedIn</a>`,
    `<a href="${BLACK_FRIDAY_POST}">Black Friday</a>`,
    `<a href="https://old.playfulagency.com/blog/email-marketing/como-promocionar-en-black-friday-implementa-estas-estrategias">old</a>`,
    `<a href="https://www.playfulagency.com/blog/pautas-digitales/anuncios-en-linkedin">www</a>`,
    `<a href="https://playfulagency.com/blog/pautas-digitales/anuncios-en-linkedin">apex</a>`,
    `<a href="//endpoint.playfulagency.com/blog/pautas-digitales/anuncios-en-linkedin?utm=1#toc">proto</a>`,
  ].join('');

  const rewritten = rewriteInSitePageHrefs(html);

  assert.equal(countHostHrefs(rewritten, 'endpoint.playfulagency.com'), 0);
  assert.equal(countHostHrefs(rewritten, 'old.playfulagency.com'), 0);
  assert.equal(countHostHrefs(rewritten, 'www.playfulagency.com'), 0);
  assert.equal(countHostHrefs(rewritten, 'playfulagency.com'), 0);
  assert.match(rewritten, /href="\/blog\/pautas-digitales\/anuncios-en-linkedin"/);
  assert.match(
    rewritten,
    /href="\/blog\/email-marketing\/como-promocionar-en-black-friday-implementa-estas-estrategias"/,
  );
  assert.match(
    rewritten,
    /href="\/blog\/pautas-digitales\/anuncios-en-linkedin\?utm=1#toc"/,
  );
});

test('leaves /wp-content media srcs and hrefs on the WordPress endpoint', () => {
  const html = [
    `<img src="${MEDIA_SRC}" alt="">`,
    `<a href="${MEDIA_HREF}">PDF</a>`,
    `<a href="${LINKEDIN_POST}">LinkedIn</a>`,
  ].join('');

  const rewritten = rewriteInSitePageHrefs(html);

  assert.match(rewritten, new RegExp(`src="${MEDIA_SRC.replaceAll('/', '\\/')}"`));
  assert.match(rewritten, new RegExp(`href="${MEDIA_HREF.replaceAll('/', '\\/')}"`));
  assert.match(rewritten, /href="\/blog\/pautas-digitales\/anuncios-en-linkedin"/);
  assert.equal(countHostHrefs(rewritten, 'endpoint.playfulagency.com'), 1);
});

test('does not rewrite external or already-relative hrefs', () => {
  const html = [
    `<a href="https://linkedin.com/company/playful">external</a>`,
    `<a href="/blog/already-relative">relative</a>`,
    `<a href="#local">hash</a>`,
  ].join('');

  assert.equal(rewriteInSitePageHrefs(html), html);
});

test('rewriteWpRenderedHtmlFields rewrites excerpt and content hrefs; leaves wp-content', () => {
  const post = rewriteWpRenderedHtmlFields({
    id: 1,
    excerpt: {
      rendered: `<p>Lee <a href="${LINKEDIN_POST}">LinkedIn</a> y <a href="${MEDIA_HREF}">PDF</a>.</p>`,
    },
    content: {
      rendered: `<p><a href="${BLACK_FRIDAY_POST}">Black Friday</a><img src="${MEDIA_SRC}" alt=""></p>`,
    },
  });

  assert.match(post.excerpt.rendered, /href="\/blog\/pautas-digitales\/anuncios-en-linkedin"/);
  assert.match(post.excerpt.rendered, new RegExp(`href="${MEDIA_HREF.replaceAll('/', '\\/')}"`));
  assert.match(post.content.rendered, /href="\/blog\/email-marketing\/como-promocionar-en-black-friday-implementa-estas-estrategias"/);
  assert.match(post.content.rendered, new RegExp(`src="${MEDIA_SRC.replaceAll('/', '\\/')}"`));
  assert.equal(countHostHrefs(post.excerpt.rendered, 'endpoint.playfulagency.com'), 1);
  assert.equal(countHostHrefs(post.content.rendered, 'endpoint.playfulagency.com'), 0);
});

function functionBody(source, name) {
  const start = source.indexOf(`export async function ${name}`);
  assert.notEqual(start, -1, `missing ${name}`);
  const nextExport = source.indexOf('\nexport ', start + 1);
  return nextExport === -1 ? source.slice(start) : source.slice(start, nextExport);
}

test('getBlogPostBySlug maps content.rendered and excerpt.rendered through the rewriter', async () => {
  const source = await readFile(new URL('../services/wordpress.ts', import.meta.url), 'utf8');
  const body = functionBody(source, 'getBlogPostBySlug');
  assert.match(body, /rewriteWpRenderedHtmlFields\(/);
});

test('getBlogPosts rewrites listing excerpt.rendered and content.rendered', async () => {
  const source = await readFile(new URL('../services/wordpress.ts', import.meta.url), 'utf8');
  const body = functionBody(source, 'getBlogPosts');
  assert.match(body, /rewriteWpRenderedHtmlFields\(/);
});

test('getLatestBlogPosts rewrites excerpt HTML before stripping tags', async () => {
  const source = await readFile(new URL('../services/wordpress.ts', import.meta.url), 'utf8');
  const body = functionBody(source, 'getLatestBlogPosts');
  assert.match(body, /rewriteWpRenderedHtmlFields\(/);
});
