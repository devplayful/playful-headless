import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const clientSource = readFileSync(
  new URL('../../app/contactar-agencia-de-marketing-digital/ContactPageClient.tsx', import.meta.url),
  'utf8',
);

test('resets a consumed reCAPTCHA token after a deterministic rejection', () => {
  const deterministicBranch = clientSource.indexOf('} else {\n        setSubmitStatus({');
  const resetAfterRejection = clientSource.indexOf(
    'recaptchaRef.current?.reset();',
    deterministicBranch,
  );

  assert(deterministicBranch >= 0, 'the contact client must retain a deterministic rejection branch');
  assert(
    resetAfterRejection > deterministicBranch,
    'a deterministic rejection must provide a fresh reCAPTCHA challenge',
  );
});

test('does not reset or retry automatically while delivery confirmation is pending', () => {
  const pendingBranch = clientSource.indexOf(
    'if (response.status === 202 && data.pendingConfirmation === true)',
  );
  const successBranch = clientSource.indexOf('} else if (response.ok && data.success)', pendingBranch);
  const pendingSource = clientSource.slice(pendingBranch, successBranch);

  assert(pendingBranch >= 0, 'the contact client must retain a pending-confirmation branch');
  assert(successBranch > pendingBranch, 'the pending-confirmation branch must be bounded');
  assert(!pendingSource.includes('recaptchaRef.current?.reset();'));
  assert(!pendingSource.includes("fetch('/api/contact'"));
});

test('also resets reCAPTCHA when the response cannot be obtained or parsed', () => {
  const catchBranch = clientSource.indexOf('} catch (error) {');
  const catchReset = clientSource.indexOf('recaptchaRef.current?.reset();', catchBranch);

  assert(catchBranch >= 0, 'the contact request must retain a catch branch');
  assert(catchReset > catchBranch, 'transport and parse failures must reset reCAPTCHA');
});
