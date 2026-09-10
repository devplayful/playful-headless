import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  blogAmpJunkDecision,
  isAmpJunkParam,
  isBlogPath,
  searchFromParams,
  stripAmpJunkParams,
} = await import('../utils/amp-junk-query.ts');

const middlewareSource = readFileSync(new URL('../middleware.ts', import.meta.url), 'utf8');

function decide(pathWithQuery) {
  const url = new URL(pathWithQuery, 'https://playfulagency.com');
  return blogAmpJunkDecision(url.pathname, url.searchParams);
}

test('amp junk keys are case-insensitive', () => {
  assert.equal(isAmpJunkParam('noamp'), true);
  assert.equal(isAmpJunkParam('NoAmp'), true);
  assert.equal(isAmpJunkParam('AMP'), true);
  assert.equal(isAmpJunkParam('amp'), true);
  assert.equal(isAmpJunkParam('utm_source'), false);
  assert.equal(isAmpJunkParam('gclid'), false);
  assert.equal(isAmpJunkParam('page'), false);
});

test('only /blog paths are in scope', () => {
  assert.equal(isBlogPath('/blog'), true);
  assert.equal(isBlogPath('/blog/'), true);
  assert.equal(isBlogPath('/blog/mas-vistos/que-es-una-agencia-de-sem'), true);
  assert.equal(isBlogPath('/'), false);
  assert.equal(isBlogPath('/agencia-sem'), false);
});

test('strip noamp=mobile leaves a clean search string', () => {
  const { stripped, params } = stripAmpJunkParams(new URLSearchParams('noamp=mobile'));
  assert.equal(stripped, true);
  assert.equal(searchFromParams(params), '');
});

test('strip keeps utm and ads tracking', () => {
  const input = new URLSearchParams(
    'noamp=mobile&utm_source=x&utm_medium=cpc&gclid=abc&fbclid=1&gbraid=2&wbraid=3',
  );
  const { stripped, params } = stripAmpJunkParams(input);
  assert.equal(stripped, true);
  assert.equal(
    searchFromParams(params),
    '?utm_source=x&utm_medium=cpc&gclid=abc&fbclid=1&gbraid=2&wbraid=3',
  );
});

test('no junk means no strip', () => {
  const { stripped, params } = stripAmpJunkParams(new URLSearchParams('utm_source=x&page=2'));
  assert.equal(stripped, false);
  assert.equal(searchFromParams(params), '?utm_source=x&page=2');
});

test('?noamp=mobile → 301 Location without noamp', () => {
  const decision = decide('/blog/mas-vistos/que-es-una-agencia-de-sem?noamp=mobile');
  assert.deepEqual(decision, {
    type: 'redirect',
    pathname: '/blog/mas-vistos/que-es-una-agencia-de-sem',
    search: '',
    status: 301,
  });
});

test('?noamp=mobile&utm_source=x → 301 Location with utm_source, without noamp', () => {
  const decision = decide('/blog/mas-vistos/que-es-una-agencia-de-sem?noamp=mobile&utm_source=x');
  assert.equal(decision.type, 'redirect');
  assert.equal(decision.status, 301);
  assert.equal(decision.pathname, '/blog/mas-vistos/que-es-una-agencia-de-sem');
  assert.equal(decision.search, '?utm_source=x');
  assert.doesNotMatch(decision.search, /noamp/i);
});

test('sin junk → next() without redirect', () => {
  assert.deepEqual(
    decide('/blog/mas-vistos/que-es-una-agencia-de-sem?utm_source=x'),
    { type: 'next' },
  );
  assert.deepEqual(decide('/blog'), { type: 'next' });
  assert.deepEqual(decide('/blog?page=2'), { type: 'next' });
  assert.deepEqual(decide('/agencia-sem?noamp=mobile'), { type: 'next' });
});

test('/blog?noamp=mobile → /blog', () => {
  assert.deepEqual(decide('/blog?noamp=mobile'), {
    type: 'redirect',
    pathname: '/blog',
    search: '',
    status: 301,
  });
});

test('also strips amp=1 and mixed-case AMP keys, keeps gclid', () => {
  const decision = decide(
    '/blog/mas-vistos/que-es-una-agencia-de-sem?AMP=1&NoAmp=mobile&gclid=xyz',
  );
  assert.equal(decision.type, 'redirect');
  assert.equal(decision.search, '?gclid=xyz');
});

test('middleware wires the helper and matches /blog plus /blog/:path*', () => {
  assert.match(middlewareSource, /blogAmpJunkDecision/);
  assert.match(middlewareSource, /NextResponse\.redirect\(target, ampJunk\.status\)/);
  assert.match(middlewareSource, /'\/blog'/);
  assert.match(middlewareSource, /'\/blog\/'/);
  assert.match(middlewareSource, /'\/blog\/:path\*'/);
  assert.match(middlewareSource, /'\/reunion-playful'/);
});
