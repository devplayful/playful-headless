import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const hubPage = readFileSync(new URL('../app/podcast/page.tsx', import.meta.url), 'utf8');
const hubContent = readFileSync(
  new URL('../app/podcast/PodcastHubContent.tsx', import.meta.url),
  'utf8',
);
const episodePage = readFileSync(
  new URL('../app/podcast/[slug]/page.tsx', import.meta.url),
  'utf8',
);
const episodeLayout = readFileSync(
  new URL('../app/podcast/[slug]/layout.tsx', import.meta.url),
  'utf8',
);
const sitemapNav = readFileSync(
  new URL('../app/podcast/PodcastSitemapEpisodeNav.tsx', import.meta.url),
  'utf8',
);

test('podcast hub fetches episodes on the server and keeps the existing H1', () => {
  assert.doesNotMatch(hubPage, /^['"]use client['"]/m);
  assert.match(hubPage, /export default async function PodcastPage/);
  assert.match(hubPage, /loadPodcastEpisodesState<PodcastEpisode>/);
  assert.match(hubPage, /getPodcastEpisodes/);
  assert.match(hubPage, /PodcastSitemapEpisodeNav/);
  assert.doesNotMatch(hubPage, /<Suspense/);
  assert.doesNotMatch(hubPage, /<h1[\s>]/);
});

test('podcast hub still paints Bendita Web Podcast; it does not add another H1', () => {
  const h1Matches = hubContent.match(/<h1\b/g) || [];
  assert.equal(h1Matches.length, 1);
  assert.match(
    hubContent,
    /<h1 className="text-4xl md:text-5xl font-bold mb-4">/,
  );
  assert.match(hubContent, /Bendita Web Podcast/);
  assert.match(hubContent, /<Link[\s\S]*href=\{pageHref/);
});

test('sitemap nav exposes crawlable href for every podcast sitemap path', () => {
  assert.match(sitemapNav, /SITEMAP_PODCAST_PATHS/);
  assert.match(sitemapNav, /<Link[\s\S]*href=\{path\}/);
});

test('podcast episode page is server-rendered with JSON-LD breadcrumb', () => {
  assert.doesNotMatch(episodePage, /^['"]use client['"]/m);
  assert.match(episodePage, /getPodcastEpisodeBySlug/);
  assert.match(episodePage, /episodeBreadcrumbJsonLd/);
  assert.match(episodePage, /BreadcrumbList|episodeBreadcrumbJsonLd/);
  assert.match(episodeLayout, /episodeDocumentTitle/);
  assert.match(episodeLayout, /generateMetadata/);
});
