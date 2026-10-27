import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const notFound = readFileSync(new URL('../app/not-found.tsx', import.meta.url), 'utf8');
const middleware = readFileSync(new URL('../middleware.ts', import.meta.url), 'utf8');

test('404 buttons point at live service pages and keep their labels', () => {
  assert.match(notFound, /href="\/agencia-seo"[\s\S]*Posicionamiento SEO/);
  assert.match(notFound, /href="\/agencia-sem"[\s\S]*Publicidad para vender/);
  assert.match(notFound, /href="\/agencia-diseno-web"[\s\S]*Diseño E-commerce/);
  assert.doesNotMatch(notFound, /href="\/posicionamiento-seo"/);
  assert.doesNotMatch(notFound, /href="\/publicidad-para-vender"/);
  assert.doesNotMatch(notFound, /href="\/diseno-e-commerce"/);
});

test('/contactar joins the existing contact 301s', () => {
  assert.match(
    middleware,
    /'\/contactar': '\/contactar-agencia-de-marketing-digital'/,
  );
});

test('migration canonical rewrites internally to the generated slug', () => {
  assert.match(middleware, /path === '\/blog\/seo\/migracion-seo-cambiar-de-plataforma'/);
  assert.match(middleware, /migracion-seo-cambiar-de-plataforma-alternativa/);
  assert.match(middleware, /NextResponse\.rewrite\(target\)/);
});
