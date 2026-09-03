import { readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

import { auditHighLevelOpportunityExport } from '../lib/highlevel/redacted-export-audit.mjs';

const input = process.argv[2];
if (!input) throw new Error('Uso: node scripts/highlevel-redacted-export-audit.mjs <export.csv>');

const file = resolve(input);
try {
  const [buffer, metadata] = await Promise.all([readFile(file), stat(file)]);
  const evidence = auditHighLevelOpportunityExport(buffer);

  console.log(
    JSON.stringify(
      {
        schema: 'playful.highlevel.opportunity-export.redacted.v1',
        sourceType: 'HighLevel opportunities CSV',
        sourceModifiedAt: metadata.mtime.toISOString(),
        ...evidence,
        outputPolicy: 'closed-allowlist-aggregates-only',
      },
      null,
      2,
    ),
  );
} catch {
  console.error('No se pudo auditar el export de HighLevel.');
  process.exitCode = 1;
}
