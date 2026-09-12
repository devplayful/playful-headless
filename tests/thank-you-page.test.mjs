import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../app/gracias/page.tsx', import.meta.url), 'utf8');
test('thank-you page has one safe booking CTA, noindex and navigation intact', () => {
  assert.equal(page.split('href="https://playfulagency.com/reunion-playful"').length - 1, 1);
  assert.match(page, /target="_blank" rel="noopener noreferrer"/);
  assert.match(page, /index: false/);
  assert.doesNotMatch(page, /display: none|<form|fetch\(/);
  assert(page.indexOf('https://playfulagency.com/reunion-playful') < page.indexOf('Una conversación para evaluar'));
  assert.match(page, /sesión es gratuita/);
});
for (const file of ['app/contactar-agencia-de-marketing-digital/ContactPageClient.tsx', 'components/ContactLeadForm.tsx']) {
  test(`${file}: navigate only within successful receipt branch, not simulator or pending`, () => {
    const code = readFileSync(new URL('../' + file, import.meta.url), 'utf8');
    const success = code.indexOf('else if (response.ok && data.success)');
    const navigation = code.indexOf("window.location.assign('/gracias?conv=Lead')");
    assert(success > 0 && navigation > success);
    assert(code.slice(success, navigation).includes('resetConfirmedForm();'));
    assert.match(code.slice(success, navigation), /data.simulated !== true && !previewSimulation/);
    assert(!code.slice(0, success).includes("window.location.assign('/gracias?conv=Lead')"));
  });
}
