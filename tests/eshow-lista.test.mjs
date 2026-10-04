import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  ESHOW_LISTA_ALLOWED_TAG,
  ESHOW_LISTA_ERRORS,
  assertEshowListaTag,
  buildEshowListaUpsertInput,
  eshowListaConfirmation,
  readEshowListaTag,
  syncEshowListaToHighLevel,
  validateEshowLista,
  withEshowListaAttribution,
} = await import('../lib/eshow-lista.ts');

const {
  ESHOW_LISTA_FORM_ID,
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

test('lista form keeps the signed microcopy, consent and privacy link', () => {
  assert.match(formSource, /Sigue el eShow Madrid 2026 con Playful/);
  assert.match(formSource, /Recibe un resumen al cerrar cada día de feria, el 4 y el 5 de noviembre/);
  assert.match(formSource, /placeholder="Tu nombre"/);
  assert.match(formSource, /placeholder="tu@correo.com"/);
  assert.match(formSource, /Quiero seguir el eShow/);
  assert.match(formSource, /href="\/politica-de-privacidad"/);
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

test('attribution defaults to the lista source and does not invent a pipeline write', async () => {
  const filled = withEshowListaAttribution({});
  assert.equal(filled.source, ESHOW_LISTA_SOURCE);
  assert.equal(filled.landing, ESHOW_MADRID_2026_CANONICAL);
  assert.equal(filled.formId, ESHOW_LISTA_FORM_ID);
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

test('lista upsert is isolated from the inbound contact flow', async () => {
  const payload = buildEshowListaUpsertInput({
    name: 'QA eShow',
    email: 'qa+eshow-lista@playfulagency.com',
    locationId: 'loc',
    consentCapturedAt: '2026-10-04T19:20:00+02:00',
    consentFieldId: 'pca',
  });
  assert.equal(payload.email, 'qa+eshow-lista@playfulagency.com');
  assert.equal(payload.name, 'QA eShow');
  assert.equal(payload.locationId, 'loc');
  assert.equal(payload.assignedTo, undefined);
  assert.equal(payload.source, undefined);
  assert.equal(payload.tags, undefined);
  assert.deepEqual(payload.customFields, [
    { id: 'pca', fieldValue: '2026-10-04T19:20:00+02:00' },
  ]);
  assert.throws(
    () => assertEshowListaTag('website-inbound'),
    /pipeline de la feria o el inbound/,
  );
  assert.throws(
    () => assertEshowListaTag('eshow-2026'),
    /pipeline de la feria o el inbound/,
  );
  assert.equal(assertEshowListaTag(ESHOW_LISTA_ALLOWED_TAG), 'lista-sigue-eshow-2026');
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

test('when the tag is set the sync writes contact + tag and never an opportunity', async () => {
  const calls = [];
  const gateway = {
    async upsertContact(input) {
      calls.push(['upsert', input]);
      return { id: 'c1', isNew: true };
    },
    async getContactCustomFields() {
      calls.push(['get-fields']);
      return [];
    },
    async updateContactCustomFields(id, fields) {
      calls.push(['update-fields', id, fields]);
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

  const env = {
    GHL_TAG_ESHOW_LISTA: 'lista-sigue-eshow-2026',
    HIGHLEVEL_LOCATION_ID: 'loc',
    HIGHLEVEL_CUSTOM_FIELD_IDS_JSON: JSON.stringify({ privacy_consent_at: 'pca' }),
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
  const upsert = calls.find((item) => item[0] === 'upsert')?.[1];
  assert.equal(upsert.assignedTo, undefined);
  assert.equal(upsert.source, undefined);
  assert.deepEqual(calls.find((item) => item[0] === 'tags')?.[2], ['lista-sigue-eshow-2026']);
  assert.equal(calls.some((item) => item[0] === 'get-fields'), false);
  assert.equal(calls.some((item) => item[0] === 'update-fields'), false);
  assert.equal(calls.some((item) => item[0] === 'opportunities'), false);
  assert.equal(calls.some((item) => item[0] === 'create-opportunity'), false);
  assert.equal(calls.some((item) => item[0] === 'create-task'), false);
  assert.doesNotMatch(syncSource, /readHighLevelConfig|PLAYFUL-TSS/);
  assert.match(syncSource, /ESHOW_LISTA_FORBIDDEN_TAGS/);
  assert.match(apiSource, /syncEshowListaToHighLevel/);
  assert.doesNotMatch(apiSource, /sms|sendEmail|mailgun|createOpportunity|website-inbound/i);
});
