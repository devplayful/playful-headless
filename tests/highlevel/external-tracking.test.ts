import assert from 'node:assert/strict';
import test from 'node:test';
import {
  HIGHLEVEL_CHAT_WIDGET_ID,
  HIGHLEVEL_CHAT_WIDGET_LOADER,
  HIGHLEVEL_FORM_EMBED_SCRIPT,
  HIGHLEVEL_FORM_WIDGET_ORIGIN,
  highLevelFormWidgetSrc,
  highLevelScriptPolicy,
} from '../../lib/highlevel/external-tracking.ts';

test('keeps external tracking globally off while preserving the chat widget', () => {
  assert.deepEqual(highLevelScriptPolicy(false), {
    externalTracking: false,
    chatWidget: true,
  });
  assert.equal(HIGHLEVEL_CHAT_WIDGET_LOADER, 'https://widgets.leadconnectorhq.com/loader.js');
  assert.equal(HIGHLEVEL_CHAT_WIDGET_ID, '67ac6d90a81d1c5969d763e7');
});

test('allows page-view tracking only after an explicit global enablement', () => {
  assert.deepEqual(highLevelScriptPolicy(true), {
    externalTracking: true,
    chatWidget: true,
  });
});

test('GHL inline form embed uses the official widget origin and form_embed.js', () => {
  assert.equal(HIGHLEVEL_FORM_WIDGET_ORIGIN, 'https://api.leadconnectorhq.com');
  assert.equal(HIGHLEVEL_FORM_EMBED_SCRIPT, 'https://link.msgsndr.com/js/form_embed.js');
  assert.equal(
    highLevelFormWidgetSrc('dFgOGgLMEaiJUHW8UrBF'),
    'https://api.leadconnectorhq.com/widget/form/dFgOGgLMEaiJUHW8UrBF',
  );
});
