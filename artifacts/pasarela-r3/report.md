# Pasarela ronda 3 — pixelmatch gate

Preview: http://127.0.0.1:3020/pasarela-de-pagos-venezuela (local post-`npm run build:direct`)
Reference: `figma-handoff/pasarela-pagos/frame@2x.png` (node `4817:41483`)
Threshold: ≤ 3%

## Fixes r3 aplicados (side-by-side José)

- Hero eyebrow: Paytone One 34px, sentence case blanco (`Agencia e-commerce`)
- Hero CTA: solo botón cyan ancho; eliminados subline + link contacto del hero
- Tipografía hero: Paytone 52px / DM Sans 18px w500; spacing Figma HEARO
- FAQ: acordeón apilado estilo frame (header púrpura + body lavender)
- Pipeline PNG-first: `scripts/pasarela-r3-pixelmatch.mjs` + `npm run test:pasarela-r3-visual`

## Deltas estructurales esperados (no PASS realista sin romper reglas)

| sección | motivo |
|---|---|
| banner | Figma trae formulario; implementación usa CTAs (`BOOKING_HREF` / `CONTACT_HREF`) |
| faq h2 | copy firmado «Pagos Online» vs frame «Marketing de Contenido» |
| nav/footer | SKIP canon live (no comparados) |
| robot intro | no presente en node `4817:41483` frame@2x |

## Resultados

| # | sección | PASS/FAIL | mismatch % | diff/total | paths |
|---:|---|---|---:|---|---|
| 1 | hero | FAIL | 21.47% | 498293/2320348 | `artifacts/pasarela-r3/hero/` |
| 2 | intro | FAIL | 11.56% | 110157/953172 | `artifacts/pasarela-r3/intro/` |
| 3 | benefits | FAIL | 13.05% | 568251/4354263 | `artifacts/pasarela-r3/benefits/` |
| 4 | pain | FAIL | 21.22% | 618945/2917284 | `artifacts/pasarela-r3/pain/` |
| 5 | faq | FAIL | 23.37% | 702465/3006343 | `artifacts/pasarela-r3/faq/` |
| 6 | banner | FAIL | 31.59% | 1659723/5254481 | `artifacts/pasarela-r3/banner/` |

**Overall: FAIL** (ninguna región ≤ 3%)

Ejecutar gate: `npm run build:direct && npm run start -- -p 3020 && npm run test:pasarela-r3-visual -- http://127.0.0.1:3020`
