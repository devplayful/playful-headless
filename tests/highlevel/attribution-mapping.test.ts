import assert from 'node:assert/strict';
import test from 'node:test';
import {
  HIGHLEVEL_CLICK_FIELD_KEYS,
  HIGHLEVEL_KNOWN_CLICK_FIELD_IDS,
} from '../../lib/contact/attribution.ts';
import {
  mapClickAndUtmFields,
  nativeContactAttribution,
} from '../../lib/highlevel/workflow.ts';
import { config, lead } from './fixtures.ts';

test('maps first-touch UTMs to existing custom field IDs and click ids by key', () => {
  const attributed = {
    ...lead,
    originalAttribution: {
      ...lead.originalAttribution,
      utm_source: 'qa',
      utm_medium: 'test',
      utm_campaign: 'atribucion-qa',
      utm_content: 'v1',
      utm_term: 'prueba',
      gclid: 'QA-GCLID-TEST',
      fbclid: 'QA-FBCLID-TEST',
      referrer: 'https://www.google.com/',
    },
  };

  const fields = mapClickAndUtmFields(attributed, config);
  const byId = new Map(fields.filter((item) => item.id).map((item) => [item.id, item.fieldValue]));
  const byKey = new Map(fields.filter((item) => item.key).map((item) => [item.key, item]));

  assert.equal(byId.get(config.customFieldIds.utm_source), 'qa');
  assert.equal(byId.get(config.customFieldIds.utm_medium), 'test');
  assert.equal(byId.get(config.customFieldIds.utm_campaign), 'atribucion-qa');
  assert.equal(byId.get(config.customFieldIds.utm_content), 'v1');
  assert.equal(byId.get(config.customFieldIds.utm_term), 'prueba');

  assert.equal(byKey.get(HIGHLEVEL_CLICK_FIELD_KEYS.gclid_web)?.fieldValue, 'QA-GCLID-TEST');
  assert.equal(byKey.get(HIGHLEVEL_CLICK_FIELD_KEYS.gclid_web)?.id, HIGHLEVEL_KNOWN_CLICK_FIELD_IDS.gclid_web);
  assert.equal(byKey.get(HIGHLEVEL_CLICK_FIELD_KEYS.gclid)?.fieldValue, 'QA-GCLID-TEST');
  assert.equal(byKey.get(HIGHLEVEL_CLICK_FIELD_KEYS.gclid)?.id, undefined);
  assert.equal(byKey.get(HIGHLEVEL_CLICK_FIELD_KEYS.fbclid)?.fieldValue, 'QA-FBCLID-TEST');
  assert.equal(byKey.get(HIGHLEVEL_CLICK_FIELD_KEYS.fbclid)?.id, HIGHLEVEL_KNOWN_CLICK_FIELD_IDS.fbclid);
  assert.equal(byKey.get(HIGHLEVEL_CLICK_FIELD_KEYS.referrer)?.fieldValue, 'https://www.google.com/');
  assert.equal(byKey.get(HIGHLEVEL_CLICK_FIELD_KEYS.referrer)?.id, HIGHLEVEL_KNOWN_CLICK_FIELD_IDS.referrer);
});

test('uses env IDs for click fields when present', () => {
  const withIds = {
    ...config,
    customFieldIds: {
      ...config.customFieldIds,
      gclid_web: 'env-gclid-web',
      gclid: 'env-gclid',
      fbclid: 'env-fbclid',
      referrer: 'env-referrer',
    },
  };
  const fields = mapClickAndUtmFields(lead, withIds);
  assert(fields.some((item) => item.id === 'env-gclid-web' && item.key === 'contact.gclid_web'));
  assert(fields.some((item) => item.id === 'env-gclid' && item.key === 'contact.gclid'));
  assert(fields.some((item) => item.id === 'env-fbclid' && item.key === 'contact.fbclid'));
  assert(fields.some((item) => item.id === 'env-referrer' && item.key === 'contact.referrer'));
});

test('fills native HighLevel attributionSource and lastAttributionSource', () => {
  const native = nativeContactAttribution(lead);
  assert.equal(native.source, 'google');
  assert.equal(native.attributionSource?.utmSource, 'google');
  assert.equal(native.attributionSource?.url, 'https://playfulagency.com/servicios?utm_source=google');
  assert.equal(native.lastAttributionSource?.utmSource, 'linkedin');
  assert.equal(native.lastAttributionSource?.utmContent, 'cta');
});
