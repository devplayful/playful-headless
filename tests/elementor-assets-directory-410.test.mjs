import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  ELEMENTOR_ASSETS_DIRECTORY_PATH,
  isElementorAssetsDirectoryGone,
} from '../utils/elementor-assets-directory-gone.ts';

const middleware = readFileSync(new URL('../middleware.ts', import.meta.url), 'utf8');

test('gone decision only on exact directory path (trailing slash normalizes away)', () => {
  assert.ok(isElementorAssetsDirectoryGone(ELEMENTOR_ASSETS_DIRECTORY_PATH));
  assert.ok(!isElementorAssetsDirectoryGone(`${ELEMENTOR_ASSETS_DIRECTORY_PATH}/`));
  assert.ok(
    !isElementorAssetsDirectoryGone(
      `${ELEMENTOR_ASSETS_DIRECTORY_PATH}/css/frontend.min.css`,
    ),
  );
  assert.ok(
    !isElementorAssetsDirectoryGone(
      `${ELEMENTOR_ASSETS_DIRECTORY_PATH}/js/webpack.runtime.min.js`,
    ),
  );
});

test('middleware returns 410 before trailing-slash 301 redirect', () => {
  assert.match(middleware, /isElementorAssetsDirectoryGone/);
  const body = middleware.slice(middleware.indexOf('export function middleware'));
  const elementorIdx = body.indexOf('isElementorAssetsDirectoryGone');
  const redirectIdx = body.indexOf('resolveSingleHopRedirect');
  assert.ok(elementorIdx > 0 && elementorIdx < redirectIdx);
  assert.match(body, /status: 410[\s\S]*isElementorAssetsDirectoryGone|isElementorAssetsDirectoryGone[\s\S]*status: 410/);
});

test('matcher lists both directory URL variants explicitly (no wildcards)', () => {
  assert.match(middleware, /'\/wp-static\/wp-content\/plugins\/elementor\/assets',/);
  assert.match(middleware, /'\/wp-static\/wp-content\/plugins\/elementor\/assets\/',/);
  assert.doesNotMatch(
    middleware,
    /elementor\/assets\/:path\*|elementor\/assets\*/,
  );
});