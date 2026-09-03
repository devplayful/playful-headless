import { fileURLToPath } from 'node:url';

import { runGuardedCommand } from '../../scripts/build-with-budget.mjs';

const processTreeFixture = fileURLToPath(new URL('./process-tree.mjs', import.meta.url));

process.exitCode = await runGuardedCommand(process.execPath, [processTreeFixture], {
  budgetMs: 10_000,
  forceKillGraceMs: 75,
});
