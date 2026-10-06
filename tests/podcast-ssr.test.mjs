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

test('podcast hub fetches episodes on the server and keeps the existing H1', () => {
  assert.doesNotMatch(hubPage, /^['"]use client['"]/m);
  assert.match(hubPage, /export default async function PodcastPage/);
  assert.match(hubPage, /loadPodcastEpisodesState/);
  assert.match(hubPage, /getPodcastEpisodes/);
  assert.match(hubPage, /initialState=\{initialState\}/);
  assert.doesNotMatch(hubPage, /<Suspense/);
  assert.doesNotMatch(hubPage, /generateMetadata/);
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
  assert.doesNotMatch(hubContent, /if \(!metadata\)/);
  assert.doesNotMatch(hubContent, /from 'next\/head'/);
});

test('podcast episode page stays client-only and is annotated as out of this change', () => {
  assert.match(episodePage, /^['"]use client['"]/m);
  assert.match(episodePage, /Out of this change/);
  assert.match(episodePage, /app\/not-found\.tsx/);
  assert.match(episodePage, /getPodcastEpisodeBySlug/);
});
