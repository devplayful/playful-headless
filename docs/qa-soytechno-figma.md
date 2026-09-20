# QA visual SoyTechno — Figma 3798:11672 vs preview

**Veredicto: PASS** (mobile-first, SHA `1b63fb8`)

Agente: solo QA (sin rediseño, sin merge).  
Canon: handoff + crop B. Criterio de José: PASS solo si 375/768 son un **stack legible** (`SoyTechnoMobile`), no un artboard 1200 escalado.  
Target: https://playful-headless-git-cursor-soytechno-7e59aa-playfuls-projects.vercel.app/casos-de-exito/soytechno-ecommerce-venezuela  
Share: regenerado `_vercel_share=s2IatNylWPTukG3fTOI57AA32iwEICPD`.  
SHA: **`1b63fb8140c97ec8dd345b803e1838baa6dff943`** (PR #70 draft, deploy READY `dpl_5EQ33JZzHa8bCUtzCJKE7M8s1PeQ`).  
Viewports: **375 × 812**, **768 × 1024**, **1440 × 900**.

---

## Resumen

| Viewport | Veredicto | Qué pinta | scrollW / scrollH |
|---|---|---|---|
| **375** | **PASS** | `lg:hidden` → `SoyTechnoMobile`. h1 28 px, copy 16–17 px, sin overflow-x. CTA botón 252×48 en viewport. 4 phones en carrusel snap (1 + peek). Wrapper desktop `hidden lg:block` = `display: none`. | **360 / 16693** |
| **768** | **PASS** | Mismo stack. h1 34 px / 2 líneas. Collage + CTA completos. Desktop off. | **752 / 16828** |
| **1440** | **PASS desktop** | Mobile off. Boards Figma lock: hero 1200×656, desafío 1200×1196, A/C 892, B 1400, CTA 650. **4 phones** (04/01/02/03) visibleW=276. **CTA 2 líneas**. | 1425 / 15661 |

No es el FAIL de `fb1c43e` (artboard 1200 con `transform: none` y `scrollWidth` 1220). Tampoco el blank de `ad05086` (solo títulos bajo `lg`).

---

## 375 — stack `SoyTechnoMobile`

| Sección | ¿Visible? | ¿Legible / usable? | Caja | Evidencia |
|---|---|---|---|---|
| Hero | Sí | h1 completo 28 px / 281×129. Párrafos 16 px. Collage debajo (logo + foto + Cashea). | 321×833 | `qa_mf_375_hero.png` |
| Desafío | Sí | Título + lead + 3 iconos + 3 features. No recorte mid-word. | 321×1835 | `qa_mf_375_desafio.png` |
| A / B / C | Sí | Chapter bar + shot + copy apilada. B: 3 cards cromáticas + phone + Circuito. | B 321×2049 | `qa_mf_375_section_b.png` |
| Cashea / Wizard / Logística | Sí | En DOM y en `innerText`. Shots full-width. | — | — |
| Resultados | Sí | 3 cards apiladas. | 321×1025 | — |
| 4 phones | Sí (carrusel) | 4 nodos `mobile-screen-0{4,1,2,3}` 204×436. Viewport: 1 entero + peek. Snap-x, no `visibleW=0` de 3 phones por overflow hidden del board. | 321×479 | `qa_mf_375_phones.png` |
| Testimonial | Sí | Eva + quote. | 321×388 | — |
| CTA | Sí | Título 26 px (3 líneas en 281 px), body, **botón en viewport**. | 321×768 | `qa_mf_375_cta.png` |

Cadena CSS: mobile wrap `lg:hidden` → `display: block`. Desktop wrap `hidden lg:block` → `display: none`.  
`h1` **no** está en `sr-only`.

---

## 768 — mismo stack

| Check | Resultado |
|---|---|
| Mobile on / desktop off | `block` / `none` |
| Hero | Título 2 líneas, ambos leads, collage visible | `qa_mf_768_hero.png` |
| CTA | Título + body + botón | `qa_mf_768_cta.png` |
| Phones peek | visibleW 240 / 240 / 168 / 0 (carrusel; el 4º se alcanza con scroll-x del snap) |
| Overflow-x | `scrollWidth` 752 < 768 |

---

## 1440 — lock Figma + FAILs previos

| Item | Estado |
|---|---|
| `SoyTechnoMobile` apagado | `lg:hidden` = `none` |
| Boards 1200 | hero 656, desafío 1196, A/C 892, B 1400, Cashea 900, wizard 960, logistics 760, results 380, phones 577, testimonial 600, CTA 650 |
| 4 phones incl. `mobile-screen-04` | **PASS** — 4× 276×577, todos visibleW=276. Δ vs PNG 367×756 (más chicos, todos visibles). |
| CTA 2 líneas | **PASS** — `listo` / `para el nivel de un Web App?` |
| Blank bajo `lg` | **Cerrado** — a 375/768 hay stack, no muro de H2 |
| Chat + sticky | Residual — tapa copy al scrollear; no impide leer el stack |

`qa_mf_1440_hero.png`, `qa_mf_1440_phones.png`, `qa_mf_1440_cta.png`.

---

## Residuales (no revierten el PASS)

1. Widget LeadConnector tapa párrafos/CTA en 375 (el botón sigue en viewport).
2. Header sticky ~144 px.
3. Phones 1440 a 276×577 vs Figma 367×756.
4. CTA mobile a 3 líneas (26 px / 281 px); el criterio de 2 líneas es del frame 1440.
5. Carrusel de phones: el 4º no cabe a la vez en 375/768; es swipe, no 4-up.

---

## Top para el implementer (cerrado / leftover)

1. ~~`hidden lg:block` borra el body~~ → `SoyTechnoMobile` bajo `lg`. **Cerrado.**
2. ~~Artboard 1200 con `scale(100cqw)` ilegible~~ → ya no es el path mobile. **Cerrado.**
3. ~~h1 en `sr-only`~~ → h1 visible 28/34 px. **Cerrado.**
4. ~~CTA inútil en 375~~ → botón 48 px + título completo. **Cerrado.**
5. ~~4º phone peek 18 px en 1440~~ → 4 visibles. **Cerrado.**
6. Chat / sticky — leftover.
7. Escala phones 1440 vs PNG — leftover, no “falta contenido”.
8. **No merge a main** (preview-only, como el PR).

---

## Método

1. `list_deployments` SHA `1b63fb8` → READY.
2. Share nuevo. Playwright 375 → 768 → 1440.
3. Comprobar wrap `lg:hidden` / `hidden lg:block`, `scrollWidth`, cajas, CTA, 4 screens.
4. Screenshots viewport + boards desktop.

---

## Artefactos (`1b63fb8`)

| Archivo | Qué prueba |
|---|---|
| `/opt/cursor/artifacts/qa_mf_375_hero.png` | Stack hero 375, h1 legible |
| `/opt/cursor/artifacts/qa_mf_375_desafio.png` | Copy + iconos apilados |
| `/opt/cursor/artifacts/qa_mf_375_section_b.png` | Cards B apiladas |
| `/opt/cursor/artifacts/qa_mf_375_phones.png` | Carrusel phone 04 + peek 01 |
| `/opt/cursor/artifacts/qa_mf_375_cta.png` | CTA usable |
| `/opt/cursor/artifacts/qa_mf_768_hero.png` | Stack 768 |
| `/opt/cursor/artifacts/qa_mf_768_cta.png` | CTA 768 |
| `/opt/cursor/artifacts/qa_mf_1440_hero.png` | Lock Figma 1440 |
| `/opt/cursor/artifacts/qa_mf_1440_phones.png` | 4 phones |
| `/opt/cursor/artifacts/qa_mf_1440_cta.png` | CTA 2 líneas |

Histórico FAIL: `fb1c43e` (scale roto) y `ad05086` (blank &lt;lg) en commits anteriores de este archivo.

No merge.
