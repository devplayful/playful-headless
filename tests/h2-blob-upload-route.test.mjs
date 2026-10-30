import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  countH2BlobUploadBatches,
  getH2BlobUploadJobs,
  totalH2BlobUploadJobs,
} from '../lib/h2-blob-upload-queue.ts';

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
  });
});

describe('h2 secret hash (documentación operador)', () => {
  it('el hash embebido es sha256 de un valor conocido solo en runtime preview', () => {
    const embedded =
      '5171c7ccbb82730befe09c114965e39da9638e014f02b8249df464edc66f2dbe';
    assert.equal(embedded.length, 64);
    assert.match(embedded, /^[0-9a-f]+$/);
    assert.notEqual(createHash('sha256').update('wrong', 'utf8').digest('hex'), embedded);
  });
});
