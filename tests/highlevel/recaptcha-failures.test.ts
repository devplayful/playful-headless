import assert from 'node:assert/strict';
import test from 'node:test';
import { ContactDeliveryError, verifyRecaptcha } from '../../lib/contact/delivery.ts';

function configuredRecaptcha(fetchImpl: typeof fetch) {
  const previousSecret = process.env.RECAPTCHA_SECRET_KEY;
  const previousFetch = globalThis.fetch;
  process.env.RECAPTCHA_SECRET_KEY = 'test-secret';
  globalThis.fetch = fetchImpl;
  return () => {
    if (previousSecret === undefined) delete process.env.RECAPTCHA_SECRET_KEY;
    else process.env.RECAPTCHA_SECRET_KEY = previousSecret;
    globalThis.fetch = previousFetch;
  };
}

test('classifies a reCAPTCHA transport timeout as pre-delivery and never claims processing', async () => {
  const restore = configuredRecaptcha(async () => {
    const error = new Error('timeout');
    error.name = 'TimeoutError';
    throw error;
  });
  try {
    await assert.rejects(() => verifyRecaptcha('test-token'), (error) => (
      error instanceof ContactDeliveryError
      && error.status === 503
      && /No se ha enviado/i.test(error.message)
      && !/procesad/i.test(error.message)
    ));
  } finally {
    restore();
  }
});

test('classifies malformed reCAPTCHA JSON as pre-delivery', async () => {
  const restore = configuredRecaptcha(async () => new Response('not-json', { status: 200 }));
  try {
    await assert.rejects(() => verifyRecaptcha('test-token'), (error) => (
      error instanceof ContactDeliveryError
      && error.status === 502
      && /No se ha enviado/i.test(error.message)
    ));
  } finally {
    restore();
  }
});
