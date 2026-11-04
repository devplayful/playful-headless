import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import {
  JOSE_CONTACT,
  buildJoseVCard,
  escapeVCardValue,
  isJosePhonePlaceholder,
  josePhoneTelValue,
} from '../lib/jose-contact.ts';
import {
  SITEMAP_STATIC_PATHS,
  getSitemapLocs,
  getSitemapPaths,
  buildSitemapXml,
} from '../utils/apex-sitemap.ts';

const APEX = 'https://playfulagency.com';
const layout = readFileSync(new URL('../app/jose/layout.tsx', import.meta.url), 'utf8');
const page = readFileSync(new URL('../app/jose/page.tsx', import.meta.url), 'utf8');
const route = readFileSync(new URL('../app/jose/contacto.vcf/route.ts', import.meta.url), 'utf8');
const manifest = JSON.parse(
  readFileSync(new URL('../config/expected-routes.json', import.meta.url), 'utf8'),
);

test('JOSE_CONTACT carries production contact data', () => {
  assert.equal(JOSE_CONTACT.fullName, 'José Reyes Labrador');
  assert.equal(JOSE_CONTACT.givenName, 'José');
  assert.equal(JOSE_CONTACT.familyName, 'Reyes Labrador');
  assert.equal(JOSE_CONTACT.title, 'Socio y CMO');
  assert.equal(JOSE_CONTACT.phone, '+34 658 09 35 80');
  assert.equal(JOSE_CONTACT.email, 'josemiguel@playfulagency.com'); // pragma: allowlist secret
  assert.equal(JOSE_CONTACT.website, 'https://playfulagency.com');
  assert.equal(JOSE_CONTACT.linkedin, 'https://www.linkedin.com/company/playful-agency/');
  assert.equal(JOSE_CONTACT.instagram, 'https://www.instagram.com/somosplayful');
  assert.equal(isJosePhonePlaceholder(), false);
  assert.equal(josePhoneTelValue(), '+34658093580');
});

test('vCard 3.0 uses CRLF, N/FN, TEL, URL and social profiles', () => {
  const vcf = buildJoseVCard();
  assert.match(vcf, /^BEGIN:VCARD\r\n/);
  assert.match(vcf, /\r\nVERSION:3.0\r\n/);
  assert.match(vcf, /\r\nN:Reyes Labrador;José;;;\r\n/);
  assert.match(vcf, /\r\nFN:José Reyes Labrador\r\n/);
  assert.match(vcf, /\r\nORG:Playful Agency\r\n/);
  assert.match(vcf, /\r\nTITLE:Socio y CMO\r\n/);
  assert.match(vcf, /\r\nTEL;TYPE=CELL:\+34658093580\r\n/);
  assert.match(vcf, new RegExp(`\\r\\nEMAIL;TYPE=INTERNET:${JOSE_CONTACT.email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\r\\n`));
  assert.match(vcf, /\r\nURL:https:\/\/playfulagency.com\r\n/);
  assert.match(
    vcf,
    /\r\nX-SOCIALPROFILE;type=linkedin:https:\/\/www\.linkedin\.com\/company\/playful-agency\/\r\n/,
  );
  assert.match(
    vcf,
    /\r\nX-SOCIALPROFILE;type=instagram:https:\/\/www\.instagram\.com\/somosplayful\r\n/,
  );
  assert.match(vcf, /\r\nEND:VCARD\r\n$/);
  assert.doesNotMatch(vcf, /[^\r]\n/);
});

test('escapeVCardValue escapes semicolon, comma and backslash', () => {
  assert.equal(escapeVCardValue('a;b'), 'a\\;b');
  assert.equal(escapeVCardValue('a,b'), 'a\\,b');
  assert.equal(escapeVCardValue('a\\b'), 'a\\\\b');
});

test('/jose is noindex and stays out of the sitemap', () => {
  assert.match(layout, /index:\s*false/);
  assert.match(layout, /follow:\s*false/);
  assert.equal(SITEMAP_STATIC_PATHS.includes('/jose'), false);
  assert.equal(getSitemapPaths().includes('/jose'), false);
  assert.equal(getSitemapLocs().includes(`${APEX}/jose`), false);
  assert.doesNotMatch(buildSitemapXml(), /playfulagency\.com\/jose</);
});

test('vcf route sets attachment headers and robots tag', () => {
  assert.match(route, /text\/vcard; charset=utf-8/);
  assert.match(route, /filename="jose-playful\.vcf"/);
  assert.match(route, /X-Robots-Tag.*noindex/);
  assert.match(route, /buildJoseVCard/);
});

test('page wires tel, mailto, web, social and vCard download from JOSE_CONTACT', () => {
  assert.match(page, /JOSE_CONTACT/);
  assert.match(page, /josePhoneTelValue/);
  assert.match(page, /mailto:\$\{JOSE_CONTACT\.email\}/);
  assert.match(page, /JOSE_CONTACT\.linkedin/);
  assert.match(page, /JOSE_CONTACT\.instagram/);
  assert.match(page, /\/jose\/contacto\.vcf/);
  assert.match(page, /Guardar contacto/);
});

test('expected-routes lists /jose and /jose/contacto.vcf', () => {
  assert.ok(manifest.sourceRoutes.includes('/jose'));
  assert.ok(manifest.sourceRoutes.includes('/jose/contacto.vcf'));
});
