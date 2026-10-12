import assert from 'node:assert/strict';
import test from 'node:test';

import {
  LINKS_BIO_ENTRIES,
  buildLinksBioHref,
  utmCampaignForHref,
} from '../lib/links-bio.ts';

test('links bio order and reunion path', () => {
  assert.equal(LINKS_BIO_ENTRIES.length, 5);
  assert.equal(LINKS_BIO_ENTRIES[0].href.includes('zelle'), true);
  assert.equal(LINKS_BIO_ENTRIES[1].href, '/reunion-playful');
});

test('buildLinksBioHref adds Instagram UTMs and preserves existing query', () => {
  assert.equal(utmCampaignForHref('/'), 'home');
  assert.equal(
    utmCampaignForHref('/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce'),
    'zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce',
  );

  const home = buildLinksBioHref('/');
  assert.match(home, /^\/\?/);
  assert.match(home, /utm_source=instagram/);
  assert.match(home, /utm_medium=social/);
  assert.match(home, /utm_campaign=home/);
  assert.match(home, /utm_content=bio/);

  const reunion = buildLinksBioHref('/reunion-playful?foo=1');
  assert.match(reunion, /^\/reunion-playful\?/);
  assert.match(reunion, /foo=1/);
  assert.match(reunion, /utm_campaign=reunion-playful/);
});
