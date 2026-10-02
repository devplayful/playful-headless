import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../app/gracias/page.tsx', import.meta.url), 'utf8');
test('thank-you page has one safe booking CTA, noindex and navigation intact', () => {
  assert.equal(page.split('href="/reunion-playful"').length - 1, 1);
  assert.doesNotMatch(page, /api\.playfulagency\.com\/widget\/bookings/);
  assert.match(page, /index: false/);
  assert.doesNotMatch(page, /display: none|<form|fetch\(/);
  assert(page.indexOf('href="/reunion-playful"') < page.indexOf('Una conversación para evaluar'));
  assert.match(page, /sesión es gratuita/);
});
for (const file of ['app/contactar-agencia-de-marketing-digital/ContactPageClient.tsx', 'components/ContactLeadForm.tsx']) {
  test(`${file}: navigate only within successful receipt branch, after generate_lead flush`, () => {
    const code = readFileSync(new URL('../' + file, import.meta.url), 'utf8');
    const success = code.indexOf('else if (response.ok && data.success)');
    const navigation = code.indexOf("window.location.assign('/gracias?conv=Lead')");
    const pending = code.indexOf('if (response.status === 202 && data.pendingConfirmation === true)');
    assert(success > 0 && navigation > success);
    assert(pending >= 0 && pending < success);
    assert(code.slice(success, navigation).includes('resetConfirmedForm();'));
    assert(code.slice(success, navigation).includes('await pushGenerateLead'));
    assert(!code.slice(pending, success).includes("window.location.assign('/gracias?conv=Lead')"));
    assert(!code.slice(0, pending).includes("window.location.assign('/gracias?conv=Lead')"));
  });
}
