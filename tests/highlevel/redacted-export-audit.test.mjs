import assert from 'node:assert/strict';
import { execFile as execFileCallback } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { promisify } from 'node:util';

import { auditHighLevelOpportunityExport } from '../../lib/highlevel/redacted-export-audit.mjs';

const execFile = promisify(execFileCallback);

test('emits only aggregate configuration evidence for a quoted export', () => {
  const csv = Buffer.from(
    'Nombre del contacto,correo electrónico,secuencia,fase,estado,Notas\n' +
      '"Persona, Uno",uno@example.invalid,D2C,"Toque 1",open,"nota con\nsalto"\n' +
      'Persona Dos,dos@example.invalid,D2C,"Toque 1",open,"dato ""citado"""\n',
  );

  const result = auditHighLevelOpportunityExport(csv);
  assert.equal(result.rows, 2);
  assert.deepEqual(result.pipelineCounts, { D2C: 2 });
  assert.deepEqual(result.stageCounts, { 'Toque 1': 2 });
  assert.deepEqual(result.statusCounts, { open: 2 });
  assert.equal(JSON.stringify(result).includes('Persona'), false);
  assert.equal(JSON.stringify(result).includes('example.invalid'), false);
  assert.equal(JSON.stringify(result).includes('nota'), false);
});

test('fails closed when safe configuration columns are absent', () => {
  assert.throws(
    () => auditHighLevelOpportunityExport(Buffer.from('Nombre,correo\nUno,uno@example.invalid\n')),
    /Faltan columnas de configuración/,
  );
});

for (const [label, row] of [
  ['pipeline', 'Persona,persona@example.invalid,"Persona persona@example.invalid",Toque 1,open'],
  ['etapa', 'Persona,persona@example.invalid,D2C,"Persona persona@example.invalid",open'],
  ['estado', 'Persona,persona@example.invalid,D2C,Toque 1,"Persona persona@example.invalid"'],
]) {
  test(`fails closed without echoing a non-allowlisted ${label}`, () => {
    const csv = Buffer.from(`Nombre,correo electrónico,secuencia,fase,estado\n${row}\n`);
    assert.throws(
      () => auditHighLevelOpportunityExport(csv),
      (error) =>
        error instanceof Error &&
        error.message.includes('valor no permitido') &&
        !error.message.includes('Persona') &&
        !error.message.includes('example.invalid'),
    );
  });
}

test('the CLI never emits a source filename containing PII', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'playful-highlevel-evidence-'));
  const file = join(directory, 'Persona persona@example.invalid.csv');
  await writeFile(file, 'secuencia,fase,estado\nD2C,Toque 1,open\n');

  try {
    const { stdout } = await execFile(process.execPath, [
      'scripts/highlevel-redacted-export-audit.mjs',
      file,
    ]);
    assert.equal(stdout.includes('Persona'), false);
    assert.equal(stdout.includes('example.invalid'), false);
    assert.equal(JSON.parse(stdout).sourceType, 'HighLevel opportunities CSV');
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('the CLI does not echo a PII filename when filesystem access fails', async () => {
  const file = join(tmpdir(), 'Persona persona@example.invalid no-existe.csv');
  await assert.rejects(
    () =>
      execFile(process.execPath, ['scripts/highlevel-redacted-export-audit.mjs', file]),
    (error) =>
      error instanceof Error &&
      error.code === 1 &&
      typeof error.stderr === 'string' &&
      error.stderr.includes('No se pudo auditar') &&
      !error.stderr.includes('Persona') &&
      !error.stderr.includes('example.invalid'),
  );
});
