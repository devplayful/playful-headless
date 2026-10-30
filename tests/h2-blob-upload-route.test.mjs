import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  countH2BlobUploadBatches,
  getH2BlobUploadJobs,
  totalH2BlobUploadJobs,
} from '../lib/h2-blob-upload-queue.ts';
import {
  H2_MAX_BATCH_INDEX,
  h2HashHex,
  verifyH2BatchToken,
} from '../lib/h2-blob-upload-auth.ts';

describe('h2-blob-upload-queue', () => {
  it('expone jobs deduplicados alineados con el inventario', () => {
    const total = totalH2BlobUploadJobs();
    const jobs = getH2BlobUploadJobs();
    assert.equal(jobs.length, total);
    assert.ok(total > 2800);
    assert.ok(jobs.every((j) => j.blobKey.startsWith('media/')));
  });

  it('calcula lotes de 40', () => {
    const total = totalH2BlobUploadJobs();
    const batches = countH2BlobUploadBatches(40);
    assert.equal(batches, Math.ceil(total / 40));
    assert.equal(H2_MAX_BATCH_INDEX, 72);
  });
});

describe('validación cadena de tokens (semilla de prueba, no producción)', () => {
  const TEST_SEED = 'h2-test-seed-not-production';
  const TEST_STEPS = 5;
  const TEST_MAX_B = 2;

  function buildChain(seed, steps) {
    const chain = [seed];
    for (let i = 0; i < steps; i++) {
      chain.push(h2HashHex(chain[chain.length - 1]));
    }
    return chain;
  }

  const chain = buildChain(TEST_SEED, TEST_STEPS);
  const TEST_ANCHOR = chain[TEST_STEPS];

  function tokenForBatch(b) {
    return chain[TEST_STEPS - 1 - b];
  }

  function verifyTest(b, t) {
    return verifyH2BatchToken(b, t, TEST_ANCHOR, TEST_MAX_B);
  }

  it('b=0 válido con el token de su lote', () => {
    assert.ok(verifyTest(0, tokenForBatch(0)));
  });

  it('b=1 con el token de b=0 debe fallar', () => {
    assert.equal(verifyTest(1, tokenForBatch(0)), false);
  });

  it('token mal formado debe fallar', () => {
    assert.equal(verifyTest(0, 'zzzz'), false);
    assert.equal(verifyTest(0, 'a'.repeat(63)), false);
  });
});
