import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const pageSource = readFileSync(
  new URL('../app/blog/[...slug]/page.tsx', import.meta.url),
  'utf8',
);
const quoteCss = readFileSync(
  new URL('../app/blog/article-body.module.css', import.meta.url),
  'utf8',
);
const globalsCss = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
const layoutSource = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
const headerSource = readFileSync(new URL('../components/Header.tsx', import.meta.url), 'utf8');
const footerSource = readFileSync(new URL('../components/Footer.tsx', import.meta.url), 'utf8');
const packageJson = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
);

test('blog article wrappers use prose-quoteless and the article-body CSS module', () => {
  assert.match(pageSource, /from '\.\.\/article-body\.module\.css'/);
  assert.match(pageSource, /BLOG_ARTICLE_PROSE_CLASS/);
  assert.match(pageSource, /prose-quoteless/);
  assert.match(pageSource, /articleBodyStyles\.body/);
  assert.equal(
    (pageSource.match(/className=\{BLOG_ARTICLE_PROSE_CLASS\}/g) || []).length,
    3,
  );
});

test('article-body CSS kills prose quotes and styles WP blockquotes + cite', () => {
  assert.match(quoteCss, /quotes:\s*none/);
  assert.match(quoteCss, /blockquote p::before/);
  assert.match(quoteCss, /content:\s*none/);
  assert.match(quoteCss, /border-left:\s*4px solid #440099/);
  assert.match(quoteCss, /font-style:\s*italic/);
  assert.match(quoteCss, /blockquote cite/);
  assert.match(quoteCss, /display:\s*block/);
  assert.match(quoteCss, /font-style:\s*normal/);
  assert.match(quoteCss, /font-size:\s*0\.8125rem/);
  assert.match(quoteCss, /content:\s*"— "/);
  assert.match(quoteCss, /p:has\(cite\)/);
});

test('blockquote quote styles stay off globals, layout, header and footer', () => {
  assert.doesNotMatch(globalsCss, /blockquote/);
  assert.doesNotMatch(layoutSource, /blockquote/);
  assert.doesNotMatch(layoutSource, /article-body\.module\.css/);
  assert.doesNotMatch(headerSource, /blockquote/);
  assert.doesNotMatch(footerSource, /blockquote/);
});

test('test:canonical includes this file so CI can run it with the rest of the suite', () => {
  assert.match(
    packageJson.scripts['test:canonical'] || '',
    /tests\/blog-article-quotes\.test\.mjs/,
  );
});
