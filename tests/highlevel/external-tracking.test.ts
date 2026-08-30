import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CONTACT_FORM_PATH,
  HIGHLEVEL_CHAT_WIDGET_ID,
  HIGHLEVEL_CHAT_WIDGET_LOADER,
  shouldLoadHighLevelExternalTracking,
} from '../../lib/highlevel/external-tracking.ts';

test('keeps HighLevel external tracking off the contact form route', () => {
  assert.equal(shouldLoadHighLevelExternalTracking(CONTACT_FORM_PATH), false);
  assert.equal(shouldLoadHighLevelExternalTracking(`${CONTACT_FORM_PATH}/`), false);
  assert.equal(HIGHLEVEL_CHAT_WIDGET_LOADER, 'https://widgets.leadconnectorhq.com/loader.js');
  assert.equal(HIGHLEVEL_CHAT_WIDGET_ID, '67ac6d90a81d1c5969d763e7');
});

test('preserves HighLevel external tracking on the rest of the site', () => {
  for (const pathname of ['/', '/blog', '/nosotros', '/casos-de-exito-agencia-de-marketing-digital']) {
    assert.equal(shouldLoadHighLevelExternalTracking(pathname), true);
  }
});
