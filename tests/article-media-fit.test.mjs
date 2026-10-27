import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../components/article-media.module.css', import.meta.url), 'utf8');
const blog = readFileSync(new URL('../app/blog/[...slug]/page.tsx', import.meta.url), 'utf8');
const podcast = readFileSync(new URL('../app/podcast/[slug]/page.tsx', import.meta.url), 'utf8');
const chip = readFileSync(new URL('../components/blog/BlogBylineChip.tsx', import.meta.url), 'utf8');

test('article media fit caps WordPress captions and embeds', () => {
  assert.match(css, /figure\.wp-caption/);
  assert.match(css, /width: auto !important/);
  assert.match(css, /max-width: 100%/);
  assert.match(css, /iframe/);
  assert.match(blog, /article-media\.module\.css/);
  assert.match(blog, /articleMediaStyles\.fit/);
  assert.match(podcast, /articleMediaStyles\.fit/);
});

test('author chip can wrap a long name; the date row stays nowrap', () => {
  assert.match(chip, /whitespace-nowrap/);
  assert.doesNotMatch(
    chip,
    /inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-white/,
  );
});
