import { test } from 'node:test';
import assert from 'node:assert/strict';

test('CMS_SOURCE por defecto es wp', async () => {
  const prev = process.env.CMS_SOURCE;
  delete process.env.CMS_SOURCE;
  const { getCmsSource, useNewCmsSource } = await import('../lib/cms-source.ts');
  assert.equal(getCmsSource(), 'wp');
  assert.equal(useNewCmsSource(), false);
  if (prev !== undefined) process.env.CMS_SOURCE = prev;
});

test('CMS_SOURCE=new activa snapshot', async () => {
  process.env.CMS_SOURCE = 'new';
  const { useNewCmsSource } = await import('../lib/cms-source.ts');
  assert.equal(useNewCmsSource(), true);
  delete process.env.CMS_SOURCE;
});
