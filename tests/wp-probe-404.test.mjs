import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const { isWpProbePath, WP_PROBE_PATHS } = await import('../utils/wp-probe-paths.ts');
const middleware = readFileSync(new URL('../middleware.ts', import.meta.url), 'utf8');

test('wp-login, xmlrpc and wp-admin are probe paths', () => {
  assert.deepEqual([...WP_PROBE_PATHS], [
    '/wp-login.php',
    '/xmlrpc.php',
    '/wp-admin',
  ]);
  for (const path of WP_PROBE_PATHS) {
    assert.equal(isWpProbePath(path), true, path);
    assert.equal(isWpProbePath(`${path}/`), true, `${path}/`);
  }
  assert.equal(isWpProbePath('/wp-admin/install.php'), true);
  assert.equal(isWpProbePath('/nosotros'), false);
  assert.equal(isWpProbePath('/wp-content/uploads/x.jpg'), false);
  assert.equal(isWpProbePath('/wp-json/wp/v2/posts'), false);
});

test('middleware rewrites WordPress probes to the prerendered 404, not 410', () => {
  const body = middleware.slice(middleware.indexOf('export function middleware'));
  const probeIdx = body.indexOf('isWpProbePath');
  const notFoundIdx = body.indexOf("pathname = '/_not-found'");
  const goneIdx = body.indexOf("status: 410");
  assert.ok(probeIdx !== -1 && notFoundIdx !== -1 && probeIdx < notFoundIdx);
  assert.ok(goneIdx === -1 || probeIdx < goneIdx);
  assert.match(middleware, /from '\.\/utils\/wp-probe-paths'/);
});

test('middleware matcher includes dotted WP probes the catch-all would skip', () => {
  for (const source of ['/wp-login.php', '/xmlrpc.php', '/wp-admin']) {
    assert.match(middleware, new RegExp(`'${source.replaceAll('/', '\\/')}'`));
    assert.match(middleware, new RegExp(`'${source.replaceAll('/', '\\/')}\\/'`));
  }
  assert.match(middleware, /'\/wp-admin\/:path\*'/);
});
