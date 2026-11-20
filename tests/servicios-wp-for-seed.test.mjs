import test from 'node:test';
import assert from 'node:assert/strict';

import { WP_SERVICIO_SLUGS } from '../cms/data/servicios-wp-slugs.ts';
import {
  fetchServicioPageBySlug,
  fetchServicioPageMetadataBySlug,
} from '../scripts/servicios-wp-for-seed.mjs';

test('servicios seed lee páginas desde snapshot sin fetch HTTP a endpoint', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = () => {
    throw new Error('fetch HTTP prohibido sin WORDPRESS_LIVE_FETCH');
  };
  try {
    for (const slug of WP_SERVICIO_SLUGS) {
      const page = await fetchServicioPageBySlug(slug);
      assert.ok(page, slug);
      assert.equal(page.slug, slug);
      assert.ok(page.html.length > 500, `${slug} html vacío`);
      const meta = await fetchServicioPageMetadataBySlug(slug);
      assert.ok(meta.yoast_wpseo_title.length > 5, `${slug} meta title`);
    }
  } finally {
    globalThis.fetch = original;
  }
});