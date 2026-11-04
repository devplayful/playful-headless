import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Production-only unsigned-copy gate. Previews and local builds skip the
 * assert so Vercel preview deploys keep building while CI stays red.
 */
export function shouldAssertUnsignedCopy(env = process.env) {
  return env.VERCEL_ENV === 'production';
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (fileURLToPath(import.meta.url) === invokedPath) {
  if (shouldAssertUnsignedCopy()) {
    const { assertNoUnsignedCopyOrExit } = await import('./assert-no-unsigned-copy.mjs');
    assertNoUnsignedCopyOrExit();
  }
  const { runGuardedBuild } = await import('./build-with-budget.mjs');
  process.exitCode = await runGuardedBuild();
}
