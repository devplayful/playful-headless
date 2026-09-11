import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const header = readFileSync(new URL('../components/HeaderClient.tsx', import.meta.url), 'utf8');
const footer = readFileSync(new URL('../components/Footer.tsx', import.meta.url), 'utf8');

function servicesArrayLiteral(source) {
  const start = source.indexOf('const services = [');
  assert.notEqual(start, -1, 'missing services array');
  const end = source.indexOf('\n  ]', start);
  assert.notEqual(end, -1, 'unclosed services array');
  return source.slice(start, end + 4);
}

test('SERVICIOS dropdown lists Shopify next to E-commerce with /agencia-shopify', () => {
  const block = servicesArrayLiteral(header);
  assert.match(block, /title: 'SEO', url: '\/agencia-seo'/);
  assert.match(block, /title: 'SEM', url: '\/agencia-sem'/);
  assert.match(block, /title: 'Diseño Web', url: '\/agencia-diseno-web'/);
  assert.match(block, /title: 'E-commerce', url: '\/agencia-e-commerce'/);
  assert.match(block, /title: 'Shopify', url: '\/agencia-shopify'/);

  const titles = [...block.matchAll(/title: '([^']+)'/g)].map((m) => m[1]);
  assert.deepEqual(titles, ['SEO', 'SEM', 'Diseño Web', 'E-commerce', 'Shopify']);
  assert.equal(titles.indexOf('Shopify'), titles.indexOf('E-commerce') + 1);
});

test('desktop and mobile SERVICIOS both iterate the same services array', () => {
  assert.equal((header.match(/services\.map\(/g) || []).length, 2);
});

test('footer SERVICIOS is unchanged (CEO GO is header only)', () => {
  assert.doesNotMatch(footer, /agencia-shopify/);
  assert.match(footer, /href="\/agencia-seo"/);
  assert.match(footer, /href="\/agencia-sem"/);
  assert.match(footer, /href="\/agencia-diseno-web"/);
});
