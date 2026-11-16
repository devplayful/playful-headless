import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  ESHOW_LANDING_CANONICAL,
  ESHOW_LANDING_DEFAULT_TAG,
  ESHOW_LANDING_DEFAULT_UTM,
  ESHOW_LANDING_FORM_ID,
  ESHOW_LANDING_SOURCE,
  ESHOW_LANDING_TAG_ENV,
  assertEshowLandingTag,
  buildEshowLandingAlwaysFields,
  buildEshowLandingFirstTouchFields,
  buildEshowLandingUpsertInput,
  readEshowLandingTag,
  syncEshowLandingToHighLevel,
  validateEshowLanding,
  withEshowLandingAttribution,
} = await import('../lib/eshow-landing.ts');

const { ESHOW_LISTA_FIELD_IDS } = await import('../lib/eshow-lista.ts');

const {
  ESHOW_LANDING_FORM,
  ESHOW_LANDING_H1,
  ESHOW_LANDING_META_DESCRIPTION,
  ESHOW_LANDING_TITLE,
} = await import('../lib/eshow-landing-copy.ts');

const pageSource = readFileSync(
  new URL('../app/(frontend)/eshow/page.tsx', import.meta.url),
  'utf8',
);
const formSource = readFileSync(
  new URL('../app/(frontend)/eshow/EshowLandingForm.tsx', import.meta.url),
  'utf8',
);
const apiSource = readFileSync(
  new URL('../app/api/eshow/route.ts', import.meta.url),
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
      return { id: 'c-eshow-landing', isNew: true };
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
    async addContactTags(id, tags) {
      calls.push(['tags', id, tags]);
    },
  };
  return gateway;
}

test('landing copy literals match landing-eshow-v4', () => {
  assert.equal(ESHOW_LANDING_TITLE, 'Vamos de visita al eShow Madrid y te contamos.');
  assert.equal(ESHOW_LANDING_H1, ESHOW_LANDING_TITLE);
  assert.equal(
    ESHOW_LANDING_META_DESCRIPTION,
    'El miércoles 4 y el jueves 5 de noviembre vamos al eShow Madrid, en IFEMA. A la vuelta te escribimos con lo que hayamos visto y aprendido en esos dos días.',
  );
  assert.equal(ESHOW_LANDING_FORM.submit, 'Quiero seguir recibiendo novedades del E-SHOW');
  assert.equal(
    ESHOW_LANDING_FORM.emailValidationError,
    'Este email no tiene un formato válido, así que revísalo antes de enviarlo.',
  );
  assert.equal(
    ESHOW_LANDING_FORM.submitError,
    'No hemos podido enviar tu nombre y tu email. Vuelve a intentarlo en un momento.',
  );
});

test('page metadata uses noindex follow and canonical /eshow', () => {
  assert.match(pageSource, /robots:\s*\{\s*index:\s*false,\s*follow:\s*true\s*\}/);
  assert.match(pageSource, /canonicalForPath\('\/eshow'\)/);
  assert.match(pageSource, /ESHOW_LANDING_TITLE/);
  assert.match(pageSource, /ESHOW_LANDING_H1/);
});

test('form UI uses exact labels from copy', () => {
  assert.match(formSource, /ESHOW_LANDING_FORM\.nameLabel/);
  assert.match(formSource, /ESHOW_LANDING_FORM\.namePlaceholder/);
  assert.match(formSource, /ESHOW_LANDING_FORM\.emailLabel/);
  assert.match(formSource, /ESHOW_LANDING_FORM\.emailPlaceholder/);
  assert.match(formSource, /ESHOW_LANDING_FORM\.consentBeforeLink/);
  assert.match(formSource, /ESHOW_LANDING_FORM\.privacyLine/);
  assert.match(formSource, /ESHOW_LANDING_FORM\.submit/);
  assert.doesNotMatch(formSource, /Enviando/);
});

test('API returns generate_lead analytics with form_id eshow', () => {
  assert.match(apiSource, /formId:\s*ESHOW_LANDING_FORM_ID/);
  assert.match(apiSource, /generateLead:\s*true/);
  assert.equal(ESHOW_LANDING_FORM_ID, 'eshow');
});

test('withEshowLandingAttribution fills defaults and source', () => {
  const filled = withEshowLandingAttribution({});
  assert.equal(filled.source, ESHOW_LANDING_SOURCE);
  assert.equal(filled.landing, ESHOW_LANDING_CANONICAL);
  assert.equal(filled.formId, 'eshow');
  assert.equal(filled.utm_source, ESHOW_LANDING_DEFAULT_UTM.utm_source);
  assert.equal(filled.utm_campaign, ESHOW_LANDING_DEFAULT_UTM.utm_campaign);
});

test('validateEshowLanding uses exact email error only', () => {
  const bad = validateEshowLanding({ name: 'Ana', email: 'bad', consent: true });
  assert.equal(bad.ok, false);
  assert.equal(bad.errors.email, ESHOW_LANDING_FORM.emailValidationError);
  assert.equal(bad.errors.name, undefined);
});

test('assertEshowLandingTag rejects inbound and lista tags', () => {
  assert.equal(assertEshowLandingTag('eshow-quiere-noticias'), 'eshow-quiere-noticias');
  assert.throws(() => assertEshowLandingTag('website-inbound'));
  assert.throws(() => assertEshowLandingTag('lista-sigue-eshow-2026'));
});

test('syncEshowLandingToHighLevel upserts with default tag without GHL_TAG_ESHOW', async () => {
  const attribution = withEshowLandingAttribution({});
  const gateway = mockGateway();
  const result = await syncEshowLandingToHighLevel({
    name: 'QA eShow',
    email: 'qa+eshow-landing@playfulagency.com',
    originalAttribution: attribution,
    recentAttribution: attribution,
    consentCapturedAt: '2026-11-02T16:00:00+01:00',
    env: {
      HIGHLEVEL_LOCATION_ID: 'loc-test',
      HIGHLEVEL_TEST_MODE: 'true',
    },
    gateway,
  });
  assert.equal(result.wrote, true);
  assert.equal(result.tag, ESHOW_LANDING_DEFAULT_TAG);
  assert.deepEqual(
    gateway.calls.find((item) => item[0] === 'tags')?.[2],
    [ESHOW_LANDING_DEFAULT_TAG],
  );
});

test('readEshowLandingTag defaults to eshow-quiere-noticias without env override', () => {
  assert.equal(readEshowLandingTag({}), ESHOW_LANDING_DEFAULT_TAG);
});

test('readEshowLandingTag accepts optional GHL_TAG_ESHOW override', () => {
  assert.equal(
    readEshowLandingTag({ GHL_TAG_ESHOW: 'custom-eshow-tag' }),
    'custom-eshow-tag',
  );
});

test('buildEshowLandingUpsertInput keeps firstName only', () => {
  const input = buildEshowLandingUpsertInput({
    name: 'María López',
    email: 'maria@example.com',
    locationId: 'loc',
    customFields: [],
    tag: 'eshow-quiere-noticias',
  });
  assert.equal(input.firstName, 'María López');
  assert.equal(input.email, 'maria@example.com');
  assert.deepEqual(input.tags, ['eshow-quiere-noticias']);
});

test('first-touch fields include source when empty', () => {
  const attribution = withEshowLandingAttribution({ utm_source: 'newsletter' });
  const fields = buildEshowLandingFirstTouchFields({
    originalAttribution: attribution,
    existing: new Map(),
  });
  const byId = fieldMap(fields);
  assert.equal(byId.get(ESHOW_LISTA_FIELD_IDS.fuente_original), ESHOW_LANDING_SOURCE);
  assert.equal(byId.get(ESHOW_LISTA_FIELD_IDS.ft_utm_source), 'newsletter');
});
