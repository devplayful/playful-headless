# QA visual SoyTechno — Figma 3798:11672 vs preview

**Veredicto: PASS** (ronda 6, SHA `8aa553a`) — 25/25. FAIL-14 cerrado.

Agente: solo QA (sin rediseño, sin merge, sin implementar).  
Implementer: CA `bc-a0a75e4a` · PR #70 draft.  
Canon: 6 crops de José (IZQ = Figma). DER = capturas **live** de este agente.

Target: https://playful-headless-git-cursor-soytechno-7e59aa-playfuls-projects.vercel.app/casos-de-exito/soytechno-ecommerce-venezuela  
Share ronda 6: `_vercel_share=Bl7WYT4yUPye5X4s6JJa5qaFxS646tLr`  
SHA: **`8aa553a4c2cd48ea987cb32af04d9b8359726b7b`**  
Deploy: READY `dpl_3SLZ1RCeEwiLG9nz3GKgrJCXdJEY`  
Viewports: **1440 × 900** (FAIL-14) + ronda 5 a 375.

---

## Score FAIL-01…25

| ID | Ticket | Veredicto | Evidencia |
|---|---|---|---|
| **01** | Paytone One en Feature h3 | **PASS** | Desktop `#soytechno-desafio h3` / `#soytechno-section-b h3` / `#soytechno-logistics h3`: `font-family: "Paytone One"`, 20 px. Mobile: mismos títulos 17 px Paytone. Clase `font-paytone-lock` (sin fallback a DM Sans). |
| **02** | Mobile compuesto, no stack | **PASS** | 375: hero collage con overlaps; desafío = card blanca + 2×2 (logo/phone/laptop/electrodomésticos); B = grid 2 col cromas + phone LG superpuesto. `scrollWidth` 360. No es `space-y-12` ingenuo. |
| **03** | Orla púrpura + patrón | **PASS** | Hero `section` `background-color: rgb(68, 0, 153)` (`#440099`) + `background-texture.png`. Orla visible a 1440 y 375. Residual: los puntos se leen poco (`opacity-20`). |
| **04** | Collage apretado | **PASS** | Cashea sobre la foto; foto pisa la navy; WP + sello en el borde inferior. Un bloque, no explota. `qa_r5_1440_hero.png`. |
| **05** | Icono sobre la navy | **PASS** | Teléfono blanco a la izquierda de la navy + camioneta amarilla en la esquina superior derecha de la card. |
| **06** | Kerning h1 | **PASS** | `#soytechno-hero h1` Paytone 47 px, `letter-spacing: -0.94px` (`tracking-[-0.02em]`). |
| **07** | Card blanca del desafío | **PASS** | Panel blanco `rounded-[28px]` con los 3 features. `qa_r5_1440_desafio.png`. |
| **08** | 2×2 unido | **PASS** | Card blanca + tira azul logo + phone sobre laptop crema + navy electrodomésticos en **un** board lavanda. |
| **09** | H3 desafío Paytone | **PASS** | Hijo de 01. `PRIORIDAD…` / `FILTROS…` / `DISEÑO…` = Paytone 20 px. |
| **10** | Phone escala / overlap / screen | **PASS** | Phone pisa el laptop. Primera fila del catálogo = monitor + TV (como Figma). Residual: se ven 2 tiles más (Hogar / Laptops). |
| **11** | Tira azul + círculo logo | **PASS** | Barra `#0063FC` + círculo logo centrado sobre el phone. |
| **12** | Laptop + phone + electrodomésticos | **PASS** | Una pieza: laptop crema a la izq., navy a la der., phone solapado. `qa_r5_1440_desafio_lower.png`. |
| **13** | Phone no descolgado | **PASS** | El phone pertenece al 2×2 (se ve el overlap). El peek superior es recorte de scroll, no un asset suelto sobre Ingeniería. |
| **14** | Aire antes de Ingeniería | **PASS** | `8aa553a`: board 1152 (sin banda lavanda), `pt-[64px]` fuera. Gap medido **32 px** (`pt-8`) entre bottom del 2×2 y h2. `qa_r6_1440_fail14.png`. |
| **15** | Phone B = banner LG | **PASS** | `section-b-phone.png`: header amarillo + **LG SoyTechno / Zona LG**. Ya no es `iphone-mockup.gif` de cámaras. `qa_r5_1440_section_b.png`. |
| **16** | Proporciones 3 col | **PASS** | Croma \| phone \| logo+copy. Residual: cromas más bajos (300×280 vs Figma ~408). |
| **17** | Texto vs logo | **PASS** | `CROMÁTICA CONTROLADA` arranca justo bajo la card logo, no a media altura del phone. |
| **18** | Escala cards vs phone | **PASS** | Phone 340×624 con still LG completo; logo barra superior. Residual: cromas más compactos que Figma. |
| **19** | H3 B Paytone | **PASS** | Hijo de 01. `CROMÁTICA…` / `ELEMENTOS…` / `BOTONES…` = Paytone 20 px. |
| **20** | Sin escalera | **PASS** | Cadmium y Circuito comparten baseline. `qa_r5_1440_section_b_lower.png`. |
| **21** | Phone B sin nav/FAB | **PASS** | Still estático LG. No hamburger, no FAB WhatsApp. |
| **22** | Circuito bajo el phone | **PASS** | Misma columna que el phone, alineado con Cadmium. |
| **23** | iMac+mapa escala | **PASS** | Mapa 220×136 + iMac 440×396. Mucho aire a la derecha. `qa_r5_1440_logistics.png`. |
| **24** | H3 logística Paytone | **PASS** | Hijo de 01. `ALGORITMO…` / `APLICACIÓN…` = Paytone 20 px. |
| **25** | Spacing logística | **PASS** | Lead / features / mapa / iMac con aire; el mapa ya no come el iMac. |

---

## Spot-check mandatos José

**Paytone One (h3 Feature)** — PASS en 1440 y 375. Computado `"Paytone One"` en desafío, B y logística. No hay `font-sans font-bold` en esos h3.

**Mobile compuesto** — PASS. Hero: collage superpuesto dentro de orla púrpura. Desafío: card blanca + 2×2. B: grid 2×2 cromas/Circuito + phone LG. A/C/Cashea/Wizard: `sm:grid-cols-2` donde cabe.

---

## Residual (no reabre tickets)

1. ~~FAIL-14~~ — **cerrado** en `8aa553a` (gap 32 px, sin banda lavanda / sin `pt-[64px]`).
2. Phone del desafío muestra 4 tiles; Figma recorta 2.
3. Widget LeadConnector tapa copy. Sticky ~144 px.
4. Breadcrumb en `#FEF7FF` encima de la orla (Figma lo pone sobre el púrpura).

---

## Preview

https://playful-headless-git-cursor-soytechno-7e59aa-playfuls-projects.vercel.app/casos-de-exito/soytechno-ecommerce-venezuela?_vercel_share=8B1FeeUuMl9f5oeaqDCTwTYQ3jC4ylLo

---

## Método

1. `list_deployments` sha `4be3dcdc…` → READY.
2. Share nuevo (el de José redirigió a `/login`).
3. Playwright 1440: scroll a hero / desafío / 2×2 inferior / B / B inferior / logística. Capturas `qa_r5_1440_*.png`.
4. `getComputedStyle` de h1 y h3 Feature (Paytone, tamaños, tracking).
5. Playwright 375: hero collage, desafío 2×2, B grid. `scrollWidth` 360.
6. Cruce con `SoyTechnoFigmaBody.tsx` / `SoyTechnoMobile.tsx` @ `4be3dcd`.
7. Sin cambios de página. Sin merge.

---

## Artefactos (`4be3dcd`)

| Archivo | Qué prueba |
|---|---|
| `/opt/cursor/artifacts/qa_r5_1440_hero.png` | Orla púrpura + collage apretado + iconos en navy |
| `/opt/cursor/artifacts/qa_r5_1440_desafio.png` | Card blanca + Paytone + 2×2 |
| `/opt/cursor/artifacts/qa_r5_1440_desafio_lower.png` | Laptop+navy + **FAIL-14** aire → Ingeniería |
| `/opt/cursor/artifacts/qa_r5_1440_section_b.png` | Phone Zona LG + 3 col + Paytone |
| `/opt/cursor/artifacts/qa_r5_1440_section_b_lower.png` | Cadmium + Circuito alineados, sin FAB |
| `/opt/cursor/artifacts/qa_r5_1440_logistics.png` | iMac contenido + Paytone logística |
| `/opt/cursor/artifacts/qa_r5_375_hero.png` | Orla púrpura mobile |
| `/opt/cursor/artifacts/qa_r5_375_hero_collage.png` | Collage superpuesto 375 |
| `/opt/cursor/artifacts/qa_r5_375_desafio.png` | 2×2 mobile + Paytone |
| `/opt/cursor/artifacts/qa_r5_375_section_b.png` | Grid B + phone LG |
| `/opt/cursor/artifacts/qa_r6_1440_fail14.png` | 2×2 + Ingeniería pegados (`8aa553a`) |

---

## Histórico

| Ronda | SHA | Criterio | Veredicto |
|---|---|---|---|
| 1 | `ad05086` | 1440 + “se ve todo” | FAIL (`hidden lg:block`) |
| 2 | `fb1c43e` | 375/768 no artboard 1200 | FAIL (`transform: none`) |
| 3 | `1b63fb8` | stack mobile legible | PASS (ese criterio) |
| 4 | `1b63fb8` + crops José | pixel + Paytone h3 + mobile compuesto | FAIL (01–25) |
| 5 | `4be3dcd` | re-QA 01–25 vs crops + live | PASS (14 residual) |
| 6 | `8aa553a` | FAIL-14 tight vs 2×2 | **PASS** (25/25) |
| 7 | plan B grouped 2× | HTML copy + export shell; Block B HTML grid | preview only |

No merge.

---

## Plan B (José) — grouped 2× exports

Stop rebuilding overlapping collages in HTML. Copy stays in HTML. Graphics:

| Slot | Expected drop-in | Temporary fallback |
|---|---|---|
| Hero right art | `soytechno-hero-art@2x.png\|.webp` | `lifestyle-f.jpg` |
| Desafío visual | `soytechno-desafio-art@2x.png\|.webp` | `rectangle-147-catalog.png` |
| Logística banner+iMac | `soytechno-logistica-art@2x.png\|.webp` | `rectangle-148.png` |
| Phones strip | `soytechno-phones-strip@2x.png\|.webp` | clipped row / 78vw snap carousel |

Block B is HTML (`1196` / `p-40` / `350 / 350 / 1fr` / icons `120` / phone `340`). Overlay-at-1440 of hero/desafío/logística/phones **waits on Diseño exports**.
