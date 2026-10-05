import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  ESHOW_LISTA_ALLOWED_TAG,
  ESHOW_LISTA_ERRORS,
  ESHOW_LISTA_FIELD_IDS,
  assertEshowListaTag,
  buildEshowListaAlwaysFields,
  buildEshowListaFirstTouchFields,
  buildEshowListaUpsertInput,
  eshowListaConfirmation,
  eshowListaMarketingConsent,
  formatMadridOffsetIso,
  readEshowListaLocationId,
  readEshowListaTag,
  readEshowListaToken,
  syncEshowListaToHighLevel,
  validateEshowLista,
  withEshowListaAttribution,
} = await import('../lib/eshow-lista.ts');

const { HighLevelConfigurationError } = await import('../lib/highlevel/config.ts');

const {
  ESHOW_LISTA_FORM_ID,
  ESHOW_LISTA_PRIVACY_URL,
  ESHOW_LISTA_SOURCE,
  ESHOW_MADRID_2026_CANONICAL,
} = await import('../lib/eshow-madrid-2026.ts');

const formSource = readFileSync(
  new URL('../components/blog/EshowListaForm.tsx', import.meta.url),
  'utf8',
);
const apiSource = readFileSync(
  new URL('../app/api/eshow-lista/route.ts', import.meta.url),
  'utf8',
);
const syncSource = readFileSync(
  new URL('../lib/eshow-lista.ts', import.meta.url),
  'utf8',
);

function fieldMap(fields) {
  return new Map(fields.map((item) => [item.id, item.fieldValue]));
}

function mockGateway(existingFields = []) {
  const calls = [];
  const gateway = {
    calls,
    async upsertContact(input) {
      calls.push(['upsert', input]);
      return { id: 'c1', isNew: true };
    },
    async getContactCustomFields() {
      calls.push(['get-fields']);
      return existingFields;
    },
    async updateContactCustomFields(id, fields) {
      calls.push(['update-fields', id, fields]);
    },
    async updateContactLastName(id, lastName) {
      calls.push(['clear-last-name', id, lastName]);
    },
    async addContactNote(id, body) {
      calls.push(['note', id, body]);
    },
    async addContactTags(id, tags) {
      calls.push(['tags', id, tags]);
    },
    async findOpenOpportunities() {
      calls.push(['opportunities']);
      return [];
    },
    async createOpportunity() {
      calls.push(['create-opportunity']);
      return { id: 'opp' };
    },
    async updateOpportunityCustomFields() {
      calls.push(['update-opp']);
    },
    async findTasks() {
      calls.push(['tasks']);
      return [];
    },
    async createTask() {
      calls.push(['create-task']);
      return { id: 'task' };
    },
  };
  return gateway;
}

test('lista form keeps the signed microcopy, consent and absolute privacy link', () => {
  assert.match(formSource, /Sigue el eShow Madrid 2026 con Playful/);
  assert.match(formSource, /Recibe un resumen al cerrar cada día de feria, el 4 y el 5 de noviembre/);
  assert.match(formSource, /placeholder="Tu nombre"/);
  assert.match(formSource, /placeholder="tu@correo.com"/);
  assert.match(formSource, /Quiero seguir el eShow/);
  assert.match(formSource, /href=\{ESHOW_LISTA_PRIVACY_URL\}/);
  assert.doesNotMatch(formSource, /href="\/politica-de-privacidad"/);
  assert.equal(ESHOW_LISTA_PRIVACY_URL, 'https://playfulagency.com/politica-de-privacidad');
  assert.match(formSource, /Acepto recibir los correos de la lista «Sigue el eShow con Playful»/);
  assert.match(formSource, /htmlFor=\{nameId\}/);
  assert.match(formSource, /htmlFor=\{emailId\}/);
  assert.match(formSource, /htmlFor=\{consentId\}/);
  assert.match(formSource, /aria-invalid/);
  assert.match(formSource, /role="alert"/);
});

test('validation uses the signed error copy', () => {
  assert.deepEqual(validateEshowLista({}), {
    ok: false,
    errors: {
      name: ESHOW_LISTA_ERRORS.name,
      email: ESHOW_LISTA_ERRORS.email,
      consent: ESHOW_LISTA_ERRORS.consent,
    },
  });
  assert.deepEqual(validateEshowLista({ name: 'Ana', email: 'mal', consent: true }), {
    ok: false,
    errors: { email: ESHOW_LISTA_ERRORS.email },
  });
  assert.deepEqual(validateEshowLista({ name: 'Ana', email: 'ana@correo.com', consent: true }), {
    ok: true,
    name: 'Ana',
    email: 'ana@correo.com',
    consent: true,
  });
  assert.match(
    eshowListaConfirmation('Ana'),
    /Ya estás en la lista, Ana\. Te acabamos de enviar un correo de bienvenida/,
  );
});

test('attribution defaults to the lista source and form id from Email', async () => {
  const filled = withEshowListaAttribution({});
  assert.equal(filled.source, ESHOW_LISTA_SOURCE);
  assert.equal(filled.landing, ESHOW_MADRID_2026_CANONICAL);
  assert.equal(filled.formId, 'web-eshow-madrid-2026');
  assert.equal(ESHOW_LISTA_FORM_ID, 'web-eshow-madrid-2026');
  assert.equal(filled.utm_source, 'blog');
  assert.equal(filled.utm_medium, 'form');
  assert.equal(filled.utm_campaign, 'eshow-madrid-2026');

  assert.equal(readEshowListaTag({}), '');
  const skipped = await syncEshowListaToHighLevel({
    name: 'Ana',
    email: 'ana@correo.com',
    originalAttribution: filled,
    recentAttribution: filled,
    consentCapturedAt: '2026-10-04T18:00:00+02:00',
    env: {},
  });
  assert.deepEqual(skipped, { wrote: false, reason: 'tag-unset' });
});

test('lista upsert writes firstName, Email fields and never inbound tags', () => {
  const attribution = withEshowListaAttribution({});
  const always = buildEshowListaAlwaysFields({
    recentAttribution: attribution,
    consentCapturedAt: '2026-10-04T19:20:00+02:00',
  });
  const payload = buildEshowListaUpsertInput({
    name: 'QA eShow',
    email: 'qa+eshow-lista@playfulagency.com',
    locationId: 'loc',
    customFields: always,
  });
  assert.equal(payload.email, 'qa+eshow-lista@playfulagency.com');
  assert.equal(payload.firstName, 'QA eShow');
  assert.equal(payload.name, undefined);
  assert.equal(payload.lastName, undefined);
  assert.equal('lastName' in payload, false);
  assert.equal(payload.locationId, 'loc');
  assert.equal(payload.assignedTo, undefined);
  assert.equal(payload.source, undefined);
  assert.equal(payload.tags, undefined);

  const alwaysById = fieldMap(always);
  assert.equal(alwaysById.get(ESHOW_LISTA_FIELD_IDS.fuente_reciente), 'Lista Sigue el eShow');
  assert.equal(alwaysById.get(ESHOW_LISTA_FIELD_IDS.landing_reciente), ESHOW_MADRID_2026_CANONICAL);
  assert.equal(alwaysById.get(ESHOW_LISTA_FIELD_IDS.id_de_formulario), 'web-eshow-madrid-2026');
  assert.equal(
    alwaysById.get(ESHOW_LISTA_FIELD_IDS.consentimiento_privacidad),
    '2026-10-04T19:20:00+02:00',
  );
  assert.equal(
    alwaysById.get(ESHOW_LISTA_FIELD_IDS.consentimiento_marketing),
    'Sí — https://playfulagency.com/politica-de-privacidad',
  );
  assert.equal(alwaysById.get(ESHOW_LISTA_FIELD_IDS.lt_utm_source), 'blog');
  assert.equal(alwaysById.get(ESHOW_LISTA_FIELD_IDS.lt_utm_medium), 'form');
  assert.equal(alwaysById.get(ESHOW_LISTA_FIELD_IDS.lt_utm_campaign), 'eshow-madrid-2026');
  assert.equal(alwaysById.has(ESHOW_LISTA_FIELD_IDS.fuente_original), false);
  assert.equal(alwaysById.has(ESHOW_LISTA_FIELD_IDS.ft_utm_source), false);

  const firstTouch = fieldMap(buildEshowListaFirstTouchFields({
    originalAttribution: attribution,
    existing: new Map(),
  }));
  assert.equal(firstTouch.get(ESHOW_LISTA_FIELD_IDS.fuente_original), 'Lista Sigue el eShow');
  assert.equal(firstTouch.get(ESHOW_LISTA_FIELD_IDS.ft_utm_source), 'blog');
  assert.equal(firstTouch.get(ESHOW_LISTA_FIELD_IDS.ft_utm_medium), 'form');
  assert.equal(firstTouch.get(ESHOW_LISTA_FIELD_IDS.ft_utm_campaign), 'eshow-madrid-2026');

  const skippedOriginal = buildEshowListaFirstTouchFields({
    originalAttribution: attribution,
    existing: new Map([
      [ESHOW_LISTA_FIELD_IDS.fuente_original, 'Google Ads'],
      [ESHOW_LISTA_FIELD_IDS.ft_utm_source, 'google'],
    ]),
  });
  const skippedById = fieldMap(skippedOriginal);
  assert.equal(skippedById.has(ESHOW_LISTA_FIELD_IDS.fuente_original), false);
  assert.equal(skippedById.has(ESHOW_LISTA_FIELD_IDS.ft_utm_source), false);
  assert.equal(skippedById.get(ESHOW_LISTA_FIELD_IDS.ft_utm_medium), 'form');

  assert.throws(
    () => assertEshowListaTag('website-inbound'),
    /pipeline de la feria o el inbound/,
  );
  assert.throws(
    () => assertEshowListaTag('eshow-2026'),
    /pipeline de la feria o el inbound/,
  );
  assert.equal(assertEshowListaTag(ESHOW_LISTA_ALLOWED_TAG), 'lista-sigue-eshow-2026');
});

test('when the tag is set the sync writes fields first and the tag after', async () => {
  const gateway = mockGateway();
  const env = {
    GHL_TAG_ESHOW_LISTA: 'lista-sigue-eshow-2026',
    HIGHLEVEL_LOCATION_ID: 'loc',
  };
  const attribution = withEshowListaAttribution({});
  const result = await syncEshowListaToHighLevel({
    name: 'Ana',
    email: 'ana@correo.com',
    originalAttribution: attribution,
    recentAttribution: attribution,
    consentCapturedAt: '2026-10-04T18:00:00+02:00',
    env,
    gateway,
  });

  assert.deepEqual(result, {
    wrote: true,
    contactId: 'c1',
    isNew: true,
    tag: 'lista-sigue-eshow-2026',
  });

  const names = gateway.calls.map((item) => item[0]);
  assert.deepEqual(names, ['upsert', 'clear-last-name', 'get-fields', 'update-fields', 'tags']);
  assert.ok(names.indexOf('upsert') < names.indexOf('tags'));
  assert.ok(names.indexOf('update-fields') < names.indexOf('tags'));

  const upsert = gateway.calls.find((item) => item[0] === 'upsert')?.[1];
  assert.equal(upsert.firstName, 'Ana');
  assert.equal(upsert.name, undefined);
  assert.equal(upsert.lastName, undefined);
  assert.deepEqual(gateway.calls.find((item) => item[0] === 'clear-last-name'), ['clear-last-name', 'c1', null]);
  assert.equal(upsert.assignedTo, undefined);
  assert.equal(upsert.source, undefined);
  assert.equal(upsert.tags, undefined);
  const upsertFields = fieldMap(upsert.customFields);
  assert.equal(upsertFields.get(ESHOW_LISTA_FIELD_IDS.fuente_reciente), 'Lista Sigue el eShow');
  assert.equal(upsertFields.get(ESHOW_LISTA_FIELD_IDS.id_de_formulario), 'web-eshow-madrid-2026');
  assert.equal(
    upsertFields.get(ESHOW_LISTA_FIELD_IDS.consentimiento_privacidad),
    '2026-10-04T18:00:00+02:00',
  );
  assert.equal(
    upsertFields.get(ESHOW_LISTA_FIELD_IDS.consentimiento_marketing),
    'Sí — https://playfulagency.com/politica-de-privacidad',
  );
  assert.equal(upsertFields.get(ESHOW_LISTA_FIELD_IDS.lt_utm_source), 'blog');
  assert.equal(upsertFields.has(ESHOW_LISTA_FIELD_IDS.fuente_original), false);

  const patched = fieldMap(gateway.calls.find((item) => item[0] === 'update-fields')?.[2] || []);
  assert.equal(patched.get(ESHOW_LISTA_FIELD_IDS.fuente_original), 'Lista Sigue el eShow');
  assert.equal(patched.get(ESHOW_LISTA_FIELD_IDS.ft_utm_source), 'blog');
  assert.deepEqual(gateway.calls.find((item) => item[0] === 'tags')?.[2], ['lista-sigue-eshow-2026']);
  assert.equal(gateway.calls.some((item) => item[0] === 'note'), false);
  assert.equal(gateway.calls.some((item) => item[0] === 'opportunities'), false);
  assert.equal(gateway.calls.some((item) => item[0] === 'create-opportunity'), false);
  assert.equal(gateway.calls.some((item) => item[0] === 'create-task'), false);
  assert.doesNotMatch(syncSource, /readHighLevelConfig|PLAYFUL-TSS/);
  assert.doesNotMatch(syncSource, /split\(\s*['\"]\\s/);
  assert.match(syncSource, /ESHOW_LISTA_FORBIDDEN_TAGS/);
  assert.match(apiSource, /syncEshowListaToHighLevel/);
  assert.match(apiSource, /formatMadridOffsetIso/);
  assert.doesNotMatch(apiSource, /sms|sendEmail|mailgun|createOpportunity|website-inbound/i);
});

test('first-touch fields stay put when the contact already has them', async () => {
  const gateway = mockGateway([
    { id: ESHOW_LISTA_FIELD_IDS.fuente_original, fieldValue: 'Google Ads' },
    { id: ESHOW_LISTA_FIELD_IDS.ft_utm_source, fieldValue: 'google' },
    { id: ESHOW_LISTA_FIELD_IDS.ft_utm_medium, fieldValue: 'cpc' },
    { id: ESHOW_LISTA_FIELD_IDS.ft_utm_campaign, fieldValue: 'brand' },
  ]);
  const incoming = withEshowListaAttribution({
    utm_source: 'linkedin',
    utm_medium: 'social',
    utm_campaign: 'eshow-madrid-2026',
  });
  await syncEshowListaToHighLevel({
    name: 'Ana',
    email: 'ana@correo.com',
    originalAttribution: incoming,
    recentAttribution: incoming,
    consentCapturedAt: '2026-10-04T18:00:00+02:00',
    env: {
      GHL_TAG_ESHOW_LISTA: 'lista-sigue-eshow-2026',
      HIGHLEVEL_LOCATION_ID: 'loc',
    },
    gateway,
  });

  const upsertFields = fieldMap(gateway.calls.find((item) => item[0] === 'upsert')?.[1].customFields);
  assert.equal(upsertFields.get(ESHOW_LISTA_FIELD_IDS.lt_utm_source), 'linkedin');
  assert.equal(upsertFields.get(ESHOW_LISTA_FIELD_IDS.lt_utm_medium), 'social');
  assert.equal(gateway.calls.some((item) => item[0] === 'update-fields'), false);
});

test('consent writes both existing GHL fields and never a note', () => {
  assert.equal(
    eshowListaMarketingConsent(),
    'Sí — https://playfulagency.com/politica-de-privacidad',
  );
  const stamped = formatMadridOffsetIso(new Date('2026-10-04T17:00:00.000Z'));
  assert.match(stamped, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
  assert.match(stamped, /\+02:00$/);
  assert.doesNotMatch(syncSource, /addContactNote|eshowListaConsentNote/);
});

test('forbidden inbound tag still rejects before any write', async () => {
  await assert.rejects(
    () => syncEshowListaToHighLevel({
      name: 'Ana',
      email: 'ana@correo.com',
      originalAttribution: withEshowListaAttribution({}),
      recentAttribution: withEshowListaAttribution({}),
      consentCapturedAt: '2026-10-04T18:00:00+02:00',
      env: { GHL_TAG_ESHOW_LISTA: 'website-inbound', HIGHLEVEL_LOCATION_ID: 'loc' },
      gateway: { async upsertContact() { return { id: 'x', isNew: true }; } },
    }),
    /inbound web/,
  );
});

test('token and location prefer HIGHLEVEL_* and fall back to GHL_*', () => {
  assert.equal(readEshowListaToken({}), '');
  assert.equal(readEshowListaLocationId({}), '');
  assert.equal(readEshowListaToken({
    HIGHLEVEL_PRIVATE_INTEGRATION_TOKEN: ' high-token ',
    GHL_PRIVATE_INTEGRATION_TOKEN: 'ghl-token',
  }), 'high-token');
  assert.equal(readEshowListaToken({
    GHL_PRIVATE_INTEGRATION_TOKEN: ' ghl-token ',
  }), 'ghl-token');
  assert.equal(readEshowListaLocationId({
    HIGHLEVEL_LOCATION_ID: ' high-loc ',
    GHL_LOCATION_ID: 'ghl-loc',
  }), 'high-loc');
  assert.equal(readEshowListaLocationId({
    GHL_LOCATION_ID: ' ghl-loc ',
  }), 'ghl-loc');
  assert.match(syncSource, /HIGHLEVEL_PRIVATE_INTEGRATION_TOKEN/);
  assert.match(syncSource, /GHL_PRIVATE_INTEGRATION_TOKEN/);
  assert.match(syncSource, /HIGHLEVEL_LOCATION_ID/);
  assert.match(syncSource, /GHL_LOCATION_ID/);
  assert.doesNotMatch(syncSource, /readHighLevelConfig\(/);
});

test('sync uses HIGHLEVEL location first and GHL location as fallback', async () => {
  const attribution = withEshowListaAttribution({});
  const preferred = mockGateway();
  await syncEshowListaToHighLevel({
    name: 'Ana',
    email: 'ana@correo.com',
    originalAttribution: attribution,
    recentAttribution: attribution,
    consentCapturedAt: '2026-10-04T18:00:00+02:00',
    env: {
      GHL_TAG_ESHOW_LISTA: 'lista-sigue-eshow-2026',
      HIGHLEVEL_LOCATION_ID: 'high-loc',
      GHL_LOCATION_ID: 'ghl-loc',
    },
    gateway: preferred,
  });
  assert.equal(preferred.calls.find((item) => item[0] === 'upsert')?.[1].locationId, 'high-loc');

  const fallback = mockGateway();
  await syncEshowListaToHighLevel({
    name: 'Ana',
    email: 'ana@correo.com',
    originalAttribution: attribution,
    recentAttribution: attribution,
    consentCapturedAt: '2026-10-04T18:00:00+02:00',
    env: {
      GHL_TAG_ESHOW_LISTA: 'lista-sigue-eshow-2026',
      GHL_LOCATION_ID: 'ghl-loc',
    },
    gateway: fallback,
  });
  assert.equal(fallback.calls.find((item) => item[0] === 'upsert')?.[1].locationId, 'ghl-loc');
});

test('missing location or token throws HighLevelConfigurationError', async () => {
  const attribution = withEshowListaAttribution({});
  await assert.rejects(
    () => syncEshowListaToHighLevel({
      name: 'Ana',
      email: 'ana@correo.com',
      originalAttribution: attribution,
      recentAttribution: attribution,
      consentCapturedAt: '2026-10-04T18:00:00+02:00',
      env: { GHL_TAG_ESHOW_LISTA: 'lista-sigue-eshow-2026' },
    }),
    (error) => {
      assert.equal(error instanceof HighLevelConfigurationError, true);
      assert.match(error.message, /HIGHLEVEL_LOCATION_ID o GHL_LOCATION_ID/);
      return true;
    },
  );

  await assert.rejects(
    () => syncEshowListaToHighLevel({
      name: 'Ana',
      email: 'ana@correo.com',
      originalAttribution: attribution,
      recentAttribution: attribution,
      consentCapturedAt: '2026-10-04T18:00:00+02:00',
      env: {
        GHL_TAG_ESHOW_LISTA: 'lista-sigue-eshow-2026',
        HIGHLEVEL_LOCATION_ID: 'loc',
      },
    }),
    (error) => {
      assert.equal(error instanceof HighLevelConfigurationError, true);
      assert.match(error.message, /HIGHLEVEL_PRIVATE_INTEGRATION_TOKEN o GHL_PRIVATE_INTEGRATION_TOKEN/);
      return true;
    },
  );
});
