import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  countEndpointInPodcastHubState,
  sanitizePodcastEpisodeForHubClient,
} from '../lib/podcast-client-payload.ts';

const PREVIEW = { CMS_BLOB_IMAGES: '1' };
const PROD = { VERCEL_ENV: 'production' };

describe('sanitizePodcastEpisodeForHubClient', () => {
  const fatEpisode = {
    id: 1,
    date: '2024-01-01T00:00:00',
    slug: 'episodio-test',
    title: { rendered: 'Título' },
    excerpt: { rendered: '<p><a href="https://endpoint.playfulagency.com/blog/foo">link</a></p>' },
    content: { rendered: '<p>https://endpoint.playfulagency.com/wp-json/wp/v2/podcast/1</p>' },
    yoast_head: '<link rel="canonical" href="https://endpoint.playfulagency.com/podcast/episodio-test/" />',
    yoast_head_json: { canonical: 'https://endpoint.playfulagency.com/podcast/episodio-test/' },
    _links: { self: [{ href: 'https://endpoint.playfulagency.com/wp-json/wp/v2/podcast/1' }] },
    _embedded: { 'wp:featuredmedia': [{ source_url: 'https://endpoint.playfulagency.com/wp-content/uploads/2025/10/Avata-Playful.png' }] },
    featured_media_url: 'https://endpoint.playfulagency.com/wp-content/uploads/2025/10/Avata-Playful.png',
    featured_media_alt: 'alt',
  };

  it('prod: no recorta el objeto', () => {
    const out = sanitizePodcastEpisodeForHubClient(fatEpisode, PROD);
    assert.equal(out.yoast_head, fatEpisode.yoast_head);
    assert.match(JSON.stringify(out), /endpoint\.playfulagency\.com/);
  });

  it('preview: recorta yoast, links, embedded y content', () => {
    const out = sanitizePodcastEpisodeForHubClient(fatEpisode, PREVIEW);
    assert.equal(out.yoast_head, undefined);
    assert.equal(out._links, undefined);
    assert.equal(out._embedded, undefined);
    assert.equal(out.content.rendered, '');
    assert.doesNotMatch(JSON.stringify(out), /endpoint\.playfulagency\.com/);
    assert.equal(out.excerpt.rendered.includes('/blog/foo'), true);
  });
});

describe('countEndpointInPodcastHubState', () => {
  it('preview hub state sin endpoint', () => {
    const n = countEndpointInPodcastHubState({
      status: 'ready',
      episodes: [
        {
          id: 2,
          date: '2024-01-02',
          slug: 's',
          title: { rendered: 'A' },
          excerpt: { rendered: 'B' },
          content: { rendered: '' },
          featured_media_url: '/wp-static/wp-content/uploads/a.png',
        },
      ],
    });
    assert.equal(n, 0);
  });
});
