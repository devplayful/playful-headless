# QA /gracias — 27 oct 2026

Reimplementación sobre `main` del corte de bucle post-reserva (#80 / #117 staging).

| Campo | Valor |
|---|---|
| PR | https://github.com/devplayful/playful-headless/pull/369 (draft) |
| Rama | `cursor/gracias-sin-bucle-main-2710` |
| SHA | `e0c70f8baeeb8cc69801ba2ed280ead22498f6ce` |
| Alias de rama | https://playful-headless-git-cursor-gracias-si-93f950-playfuls-projects.vercel.app |
| Deployment | `dpl_36sb5ejSTdMkvbzqKpSKkfgDaANn` READY |
| Live | https://playfulagency.com/gracias?qa=1 |
| Condiciones | serie, máx 1 req/s, UA `PlayfulQA/1.0`, `?qa=1`. Preview protegida por Vercel SSO (acceso vía share temporal). Cookie `pa_booking_id=qa-test-2710` en Schedule preview. |

## Resultado ítem a ítem

| # | Caso | Resultado |
|---|---|---|
| 1 | Preview `/gracias?conv=Schedule` | **OK.** H1 «¡Reunión confirmada!», CTA única «Volver al inicio» → `/`. Cero CTA a `/reunion-playful` / widget / agendar. `data-thanks-schedule`. |
| 2 | Preview `/gracias` (sin Schedule) | **OK, idéntico a live.** H1 «¡Recibimos tu caso!», CTA «Cumplo estas condiciones: agendar sesión» → `/reunion-playful`, `data-thanks-v2`, `data-cta-section="gracias"`. |
| 2b | Live `/gracias` y live `/gracias?conv=Schedule` | Live sirve **el mismo HTML** en ambos (el bucle). Case 2 preview = live. Case 1 es el único cambio. |
| 3 | BookAppointmentTracker / atribución / GTM / middleware | **OK.** Tracker sigue montado en la página. `booking-attribution.ts` y middleware 301 no se tocaron. Preview Lead setea `pa_attr_lt`. JSON-LD de Organization (layout) sigue nombrando `/reunion-playful` — no es CTA de la página. No se añadió `/gracias-v2`. |
| 4 | Header / footer / layout / CSS global | **OK.** Sin cambios. |

## Capturas (390 y 1440)

| Archivo | Qué muestra |
|---|---|
| `live-lead-390.png` / `live-lead-1440.png` | Live `/gracias?qa=1` — Recibimos + CTA agendar |
| `live-schedule-390.png` / `live-schedule-1440.png` | Live `/gracias?conv=Schedule&qa=1` — **igual que lead** (bucle) |
| `preview-lead-390.png` / `preview-lead-1440.png` | Preview `/gracias?qa=1` — igual que live |
| `preview-schedule-390.png` / `preview-schedule-1440.png` | Preview `/gracias?conv=Schedule&qa=1` — confirmación + Volver al inicio |

## Checks locales

- `npm run typecheck` OK
- `npm run test:cta-click` 49/49
- `tests/thank-you-page.test.mjs` + booking-attribution + book-appointment + booking-abandon + qa-traffic: pass
- CI unitarios del workflow (route-integrity, 301s, related, quotes, editorial): pass
- `npm run verify:routes:build` OK (`/gracias` queda `ƒ` dynamic por `force-dynamic`)
- `npm run test:canonical`: 511 pass, **1 fail preexistente** en `tests/gsc-brief-web-2026-10-20.test.mjs` («ONG closed post…»): el grep del post cerrado ahora ve `config/blog-sitemap-lastmod.json`, archivo que ya está en `main` @ `120c2f2`. No lo introduce este PR.

## Conflictos #80 vs main y resolución

No se mezcló `cursor/gracias-schedule-booking-cta-b5e2`. Diff leído; solo se reaplicó el branch `conv`.

| Choque | Resolución |
|---|---|
| `app/gracias/page.tsx` | Branch `conv` + `force-dynamic` + tracker. Lead = HTML de main, no el del #80. |
| `utils/booking.ts` vs `booking-attribution.ts` | No se toca. Atribución vive en `booking-attribution.ts`. |
| `middleware.ts` | No se toca. Sin `/gracias-v2`. Mapa 301 de main intacto. |
| `package.json` `test:canonical` | Solo se añade `tests/thank-you-page.test.mjs`. |
| Tests shopify / soytechno / service-booking | No se portan labels ni `BookingLink` del #80. |
| `BookingLink` / `BookingAttribution` / `buildBookingHref` | No se portan. |
| Labels «Solicitar una reunión» / Shopify / Elementor | No se portan. |
| 301 `/gracias-v2` | No se añade. |
| `BookAppointmentTracker` | Sigue en la página (ambas ramas). |
| CTA Lead `BookingLink` + `target=_blank` | Se conserva `href="/reunion-playful"` de main. |
| CI workflow | Se añade el test de `/gracias` a route-integrity. |
