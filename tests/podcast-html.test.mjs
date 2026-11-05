import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripHijackedPodcastAnchors } from '../utils/podcast-html.ts';
import { rewriteInSitePageHrefs } from '../services/rewrite-in-site-hrefs.mjs';

test('hijacked short link is unlinked and its text stays', () => {
  const html = '<p>Lee <a href="https://bit.ly/3cMK03N">esta nota</a> y <a href="https://playfulagency.com/blog">el blog</a>.</p>';
  const out = stripHijackedPodcastAnchors(html);
  assert.match(out, /Lee esta nota/);
  assert.doesNotMatch(out, /bit\.ly\/3cMK03N/);
  assert.match(out, /href="https:\/\/playfulagency\.com\/blog"/);
});

test('podcast episode HTML rewrites endpoint page hrefs to apex paths', () => {
  const html = '<a href="https://endpoint.playfulagency.com/blog/pautas-digitales/guia-para-hacer-marketing-digital/">guía</a>';
  const out = rewriteInSitePageHrefs(html, '/podcast/episodio-2-el-metaverso-que-es-cuales-son-sus-caracteristicas');
  assert.match(out, /href="\/blog\/pautas-digitales\/guia-para-hacer-marketing-digital"/);
  assert.doesNotMatch(out, /endpoint\.playfulagency\.com\/blog/);
});

test('getPodcastEpisodeBySlug runs both rewrites', () => {
  const source = readFileSync(new URL('../services/wordpress.ts', import.meta.url), 'utf8');
  const fn = source.slice(source.indexOf('export async function getPodcastEpisodeBySlug'));
  assert.match(fn, /rewriteInSitePageHrefs/);
  assert.match(fn, /stripHijackedPodcastAnchors/);
  assert.match(fn, /\/podcast\/\$\{slug\}/);
});
