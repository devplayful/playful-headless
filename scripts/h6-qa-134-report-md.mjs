/**
 * Genera docs/payload/h6-qa-134.md desde h6-qa-134.json
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const jsonPath = join(root, '..', 'docs', 'payload', 'h6-qa-134.json');
const report = JSON.parse(readFileSync(jsonPath, 'utf8'));

const cmsPaths = report.rows.filter((r) => r.cmsRewrite);
const lines = [
  '# H6 · QA 134 URLs (Payload preview `?cms=1` vs producción)',
  '',
  `Generado: ${report.generatedAt}`,
  '',
  '## Alcance de las 134 URLs',
  '',
  '| Fuente | Conteo | Notas |',
  '|--------|--------|-------|',
  '| `buildSitemapXml()` en repo (rama integración) | 124 | Incluye 1 post staging (`/blog/otros/eshow-madrid-2026`) no presente en el sitemap live de producción |',
  '| Sitemap live `https://playfulagency.com/sitemap.xml` | 118 | Verdad SEO en producción hoy |',
  '| Extras QA fuera de sitemap | 10 | `/links`, `/reunion-playful`, `/gracias`, `/blog/q`, `/podcast`, `/marketing-internacional`, `/seo-expertos`, `/seo-vigo`, `/firma/alejandra-da-costa`, `/test-blog` |',
  '| **Total QA** | **134** | `124 + 10 = 134` (`scripts/h6-qa-url-set.mjs`) |',
  '',
  '## Entorno',
  '',
  '| | URL |',
  '|--|-----|',
  '| Producción (referencia) | https://playfulagency.com (`?qa=1`, UA `PlayfulQA/1.0`) |',
  '| Preview PR #396 | https://playful-headless-git-cursor-pay-cbb685-playful-agencys-projects.vercel.app |',
  '| Flag Payload en Preview | `?cms=1` (solo si `VERCEL_ENV=preview`; ver `middleware.ts`) |',
  '',
  '## Resumen',
  '',
  '```json',
  JSON.stringify(report.summary, null, 2),
  '```',
  '',
  '### Bloqueo Preview',
  '',
  report.previewAccess.blocked
    ? `**No se pudo comparar HTML preview vs prod.** ${report.previewAccess.error}`
    : 'Preview accesible.',
  '',
  'Comparación completa: `PREVIEW_BASE=… VERCEL_AUTOMATION_BYPASS_SECRET=… node scripts/h6-qa-134-compare.mjs`',
  '',
  '### Producción (sanidad previa al corte CMS)',
  '',
  `- URLs con HTTP ≠ 200 en prod: **${report.summary.prodError}** (excl. /test-blog noindex interno).`,
  `- Todas las demás rutas del set respondieron **200** en la pasada del ${report.generatedAt.split('T')[0]}.`,
  '',
  '### Rollback parcial verificado en producción',
  '',
  '`?cms=1` en **producción no activa rewrites** (middleware exige `VERCEL_ENV=preview`). Muestras:',
  '',
  '| Ruta | Sin cms | Con `cms=1` en prod | Mismo cuerpo (500 chars) |',
  '|------|---------|---------------------|---------------------------|',
  ...report.rollback.prodIgnoresCmsFlag.map(
    (s) =>
      `| ${s.path} | ${s.prodPlainStatus} | ${s.prodCms1Status} | ${s.bodySame ? 'Sí' : 'No'} |`,
  ),
  '',
  'Prueba preview sin flag: **pendiente** (Deployment Protection). Ver `docs/payload/h6-rollback.md`.',
  '',
  '## Rutas con rewrite Payload esperado en Preview (`?cms=1`)',
  '',
  '| Ruta pública | Origen preview |',
  '|--------------|----------------|',
  ...cmsPaths.map((r) => `| ${r.path} | ${r.cmsRewrite} |`),
  '',
  'Blog, podcast y slugs WP no listados arriba **no** cambian con `?cms=1` (siguen WordPress/código actual).',
  '',
  '## Detalle por URL',
  '',
  'CSV machine-readable: [`h6-qa-134.csv`](./h6-qa-134.csv). JSON con metadatos prod: [`h6-qa-134.json`](./h6-qa-134.json).',
  '',
  '| path | prod | preview | estado | notas |',
  '|------|------|---------|--------|-------|',
  ...report.rows.map((r) => {
    const note = r.diffs[0]?.slice(0, 120) || '';
    return `| ${r.path} | ${r.prodStatus} | ${r.previewStatus ?? '—'} | ${r.status} | ${note.replace(/\|/g, '/')} |`;
  }),
  '',
  '## Captura / diff visual',
  '',
  'No ejecutado: requiere Preview sin pantalla de login. Referencia previa casos: `docs/paridad-h4.md` y capturas en `docs/qa/`.',
  '',
  '## Home / chrome congelado',
  '',
  'Si tras desbloquear Preview aparecen diffs en `/`, header, footer o CSS global, **documentar aquí sin corregir** (alcance H6).',
  '',
];

writeFileSync(join(root, '..', 'docs', 'payload', 'h6-qa-134.md'), `${lines.join('\n')}\n`);
