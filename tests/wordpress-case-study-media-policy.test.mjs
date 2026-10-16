import assert from 'node:assert/strict';
import test from 'node:test';
import {
  isAllowedCaseStudyMediaUrl,
  largestAllowedCaseStudyMediaUrl,
  preserveFeaturedMediaUrl,
  selectCaseStudyCardMediaUrl,
} from '../services/case-study-media-policy.mjs';

const allowedUrl = 'https://endpoint.playfulagency.com/wp-content/uploads/2026/09/jumex.png';

test('preserves only an allowlisted featured-media URL for carousel consumers', () => {
  const result = preserveFeaturedMediaUrl(
    { _embedded: { 'wp:featuredmedia': [{ source_url: allowedUrl }] } },
    { slug: 'jumex-shopify-dtc-ecommerce' }
  );

  assert.deepEqual(result, {
    slug: 'jumex-shopify-dtc-ecommerce',
    featured_media_url: allowedUrl,
  });
});

test('rejects media URLs outside the HTTPS WordPress uploads allowlist', () => {
  const rejectedUrls = [
    'http://endpoint.playfulagency.com/wp-content/uploads/case.png',
    'https://endpoint.playfulagency.com:444/wp-content/uploads/case.png',
    'https://endpoint.playfulagency.com/wp-admin/case.png',
    'https://evil.example/wp-content/uploads/case.png',
    'https://user:pass@endpoint.playfulagency.com/wp-content/uploads/case.png',
  ];

  for (const url of rejectedUrls) {
    assert.equal(isAllowedCaseStudyMediaUrl(url), false);
    assert.deepEqual(
      preserveFeaturedMediaUrl(
        { _embedded: { 'wp:featuredmedia': [{ source_url: url }] } },
        { slug: 'case' }
      ),
      { slug: 'case' }
    );
  }
});

test('picks the largest allowlisted WP derivative, not thumbnail/medium', () => {
  const full = 'https://endpoint.playfulagency.com/wp-content/uploads/2025/12/Tapa-Caso-de-exito-JUMEX-US.png';
  const medium = 'https://endpoint.playfulagency.com/wp-content/uploads/2025/12/Tapa-Caso-de-exito-JUMEX-US-300x300.png';
  const thumb = 'https://endpoint.playfulagency.com/wp-content/uploads/2025/12/Tapa-Caso-de-exito-JUMEX-US-150x150.png';
  const media = {
    source_url: full,
    media_details: {
      width: 500,
      sizes: {
        thumbnail: { source_url: thumb, width: 150 },
        medium: { source_url: medium, width: 300 },
        full: { source_url: full, width: 500 },
      },
    },
  };

  assert.equal(largestAllowedCaseStudyMediaUrl(media), full);
  assert.equal(
    preserveFeaturedMediaUrl({ _embedded: { 'wp:featuredmedia': [media] } }, { slug: 'jumex' }).featured_media_url,
    full,
  );
});

test('carousel selection ignores unsafe legacy media fallbacks', () => {
  const externalUrl = 'https://evil.example/wp-content/uploads/case.png';
  const payload = {
    featured_media_url: externalUrl,
    _embedded: { 'wp:featuredmedia': [{ source_url: externalUrl }] },
    acf: { imagen_destacada: externalUrl },
  };

  assert.equal(selectCaseStudyCardMediaUrl(payload), '');
  assert.equal(
    selectCaseStudyCardMediaUrl({ featured_media_url: allowedUrl }),
    allowedUrl
  );
});
