# QA visual SoyTechno — Figma 3798:11672 vs preview

**Veredicto: FAIL**

Agente: solo QA (sin rediseño, sin merge).  
Fecha: 2026-09-20.  
Canon: handoff `SoyTechno-Figma-Handoff` (frame `1440 × 15800`, render `720 × 7900`) + crop Sección B.  
Target: https://playful-headless-git-cursor-soytechno-7e59aa-playfuls-projects.vercel.app/casos-de-exito/soytechno-ecommerce-venezuela  
Share: `_vercel_share` vigente (SSO no bloqueó).  
SHA en rama / deploy READY: `ad05086b9766c9e61bea2adbd489ecc4489d114c` (PR #70 draft, `dpl_8qrj7ygAD4YyfRReFNTTZz9GrxVk`).  
Viewport de prueba: **1440 × 900** + diagnóstico **1280** y **1019** (`lg` = 1024).

No hay *deploy lag*: el alias de preview sirve el commit esperado.

---

## ¿Es verdad que “no se ve todo el contenido”?

**Sí, pero el motivo principal no es un board de altura 0 en 1440.**

| Hipótesis | ¿Cierto en 1440? | Evidencia |
|---|---|---|
| Deploy viejo / SHA distinto | No | Vercel `githubCommitSha` = `ad05086…`, READY |
| Boards `height: 0` | No | Todas las cajas miden lo lockeado en Figma |
| `overflow: hidden` que se come secciones enteras | No (salvo phones) | Solo `#soytechno-phones` recorta de verdad |
| `hidden lg:block` mal aplicado en 1440 | No | `display: block` / `flex` en 1440 y 1280 |
| **`hidden lg:block` esconde TODO el body visual &lt; 1024** | **Sí — blocker** | A **1019 px** la página cae de **15600 → 4385 px**. Hero, desafío 2×2, A/B/C, Cashea, Wizard, Logística, resultados, 4 phones, testimonial y CTA = `display: none; 0×0`. Solo quedan títulos sueltos + leads. |
| Sticky header + widget de chat tapando mockups | Parcial | `header.sticky` **144 px** + chat LeadConnector pisan el tercio superior/derecho de cada board al hacer scroll |
| Texto/mockup incompleto vs PNG | Parcial | CTA a 3 líneas; 4º phone ~18 px; GIF de desafío en frame de “Contáctanos” |

Conclusión para José: si el preview se abrió en una ventana Mac **&lt; 1024 CSS px** (Inspector, split view, sidebar, zoom), **el caso se ve como un muro de títulos sin collage, sin iPads, sin Sección B, sin phones, sin testimonial, sin CTA**. Eso no es “contenido que no pintó”: es CSS `hidden lg:block` sin fallback. En **1440** el body Figma **sí pinta** y el orden coincide; fallan fidelidad y overlays.

---

## Tabla sección por sección (1440 × 900)

Medidas = `getBoundingClientRect` en el preview. Figma = números del frame 1440 (handoff / locks del implementer). Capturas en `.playwright-mcp/qa-soytechno/` y `/opt/cursor/artifacts/`.

| Sección | ¿Visible 1440? | ¿Copy + mockups completos vs PNG? | Caja live vs Figma | Δ | Screenshot |
|---|---|---|---|---|---|
| Nav live Playful (no Figma chrome) | Sí (sitio) | Chrome del sitio, no el del frame. Permitido. | header sticky 1441×144 | — | `00-top-nav-hero.png` / `qa_1440_hero_nav.png` |
| Hero 3 líneas + collage | Sí | Título 3 líneas OK. Collage presente (Cashea, truck, foto, wordmark, WP, sello). Crop/overlap no pixel-idéntico. Chat tapa esquina. | `#soytechno-hero` **1200×656** | **0** | `01-hero.png` / `qa_1440_hero_board.png` |
| Desafío: UN lavanda 2×2 | Sí (un solo board) | 3 bloques de copy. Icon3 = `lifestyle-f-alt` (circuito) **96×96**. Phone + GIF + electrodomésticos. El GIF a veces muestra form “Contáctanos”, no el catálogo del PNG. No son 3 cards sueltas. | `#soytechno-desafio` **1200×1196** | **0** | `02-desafio.png` / `qa_1440_desafio.png` |
| Marcas (sello / WP / circuito) | Sí | `lifestyle-f-alt` confirmado en DOM. | cluster 448×112 | — | (en flujo bajo el lead) |
| 1ª Ingeniería + UX titles | Sí | Copy literal. | títulos 47 px / 2 líneas | — | — |
| Chapter bars A/B/C/Cashea/Wizard/Logística | Sí | 6 barras **1200×128**, `rounded-[36px]`, no pills finas. | 1200×128 ×6 | **0** | `17-chapter-bar-a.png` / `qa_1440_chapter_bar_a.png` |
| A iPad ~650×892 | Sí | iPad **650×892**. 4 features visibles. Sticky/chat pisan el borde superior. | board 1200×892; iPad **650×892** | **0** | `05-section-a.png` / `qa_1440_section_a.png` |
| B composición cerrada | Sí | 3 cards cromáticas 336×408 + phone 353×856 + Circuito 336×408 + logo 335×200 + 3 textos. Coincide con el crop B. Header sticky tapa el tercio alto al scrollear al board. | `#soytechno-section-b` **1200×1400** | **0** | `06-section-b.png` / `qa_1440_section_b.png` |
| C iPad ~650×892 | Sí | Mismo GIF que A (no empty-states). Copy de vacías/notificaciones sí está. | iPad **650×892** | **0** | `07-section-c.png` |
| Separador + 2ª Ingeniería | Sí | `hr` 1200×1 @ y≈7866 + título/lead repetidos. | presente | — | — |
| Cashea | Sí | Copy + GIF iPhone/iPad. Título “Un Desarrollo…” lo tapa el sticky al alinear el board. | board **1200×900**; GIF 640×878 | escala OK | `08-cashea.png` / `qa_1440_cashea.png` |
| Wizard | Sí | Copy completa. iPad live **650×469** (más bajo que el device del PNG; no se ve el bloque de tiendas del frame). | board 1200×720 | iPad **−** vs iPad A/C 892 | `09-wizard.png` / `qa_1440_wizard.png` |
| Logística | Sí | Copy + bullets + iMac MRW + card “Envíos a nivel nacional”. Sticky tapa el lead. | board **1200×760** | escala OK | `10-logistics.png` / `qa_1440_logistics.png` |
| Resultados 3 cards | Sí | 3 cards lavanda, copy completa. | board **1200×380**; cards 384×380 | **0** | `11-results.png` / `qa_1440_results.png` |
| 4 phones incl. `mobile-screen-04` ~367×756 | Parcial | 4 nodos 367×756. `#soytechno-phones` tiene **`overflow: hidden`**. Screen-04 está en `x: -349` → **solo ~18 px visibles**. PNG: el phone izquierdo se recorta pero se lee Zona Gamer casi entero. Live = **3 phones enteros**. | board 1200×756 | 4º phone **−349 px** (peek 18) | `12-phones.png` / `qa_1440_phones.png` |
| Testimonial 1200×600 | Sí | Eva Luciani + quote completa. Chat pisa la esquina. | **1200×600** | **0** | `13-testimonial.png` / `qa_1440_testimonial.png` |
| CTA 1200×650, título **2** líneas | Parcial | Caja 1200×650 OK. Título en DOM: 3 rects de línea (`listo` / `para el nivel de un` / `Web App?`). PNG es 2 líneas. | **1200×650**; h2 600×169 | wrap **+1 línea** | `14-cta.png` / `qa_1440_cta.png` |
| Footer live | Sí | Footer Playful, no el card Figma 1:1. Permitido. | — | — | — |

Página live `scrollHeight` ≈ **15600** vs frame **15800** (Δ −200). No es una página cortada a la mitad.

---

## Contenido AUSENTE o NO VISIBLE vs referencia

### Crítico (explica la queja de José)

1. **&lt; 1024 px: todo el body Figma está apagado** (`hidden lg:block` / `hidden lg:flex`). Hero (h1 + 2 párrafos van *dentro* del board), collage, 2×2, chapter bars, iPads, Sección B, GIFs, 4 phones, testimonial, CTA. Capturas: `15-below-lg-1019-top.png`, `16-below-lg-1019-mid.png`.
2. **`mobile-screen-04` casi invisible** en 1440 (~18 px) por `left: -349` + `overflow: hidden`.
3. **CTA “Web App?” cae a 3ª línea** (PNG = 2).

### Visible pero incompleto / tapado

4. Sticky header 144 px cubre la franja superior de cada board al hacer `scrollIntoView` / al parar el scroll en el borde del bloque (h1 “SOYTECHNO:…”, “PRIORIDAD MÓVIL”, “FICHA DE PRODUCTO”, cards B, título Cashea, lead Logística).
5. Widget de chat LeadConnector tapa phones / iPads / CTA.
6. Wizard: iPad 650×469 vs device completo del PNG (falta el bloque inferior de tiendas).
7. Sección C reusa `giffycanvas-01.gif` (catálogo), no empty-states/404 del relato.
8. GIF `rectangle-147` del desafío: frame de contacto ≠ laptop-catálogo del PNG.
9. Hero collage: ritmo/overlap no pixel-idéntico (ya anotado en QA previo).
10. Chrome del sitio (header lila, footer) ≠ chrome del frame. Fuera de scope.

### No ausente en 1440

- Orden de secciones del handoff.
- Copy literal (`utils/soytechno-figma-copy.ts`): desafío, A/B/C, Cashea, wizard, MRW, resultados, Eva, CTA.
- Un solo lavanda 2×2 (no 3 cards).
- Chapter bars 1200×128 r36.
- iPads A/C 650×892.
- Sección B cerrada (3 cromáticas + phone + circuito + logo/textos).
- Separador antes de la 2ª Ingeniería.
- Testimonial 1200×600.
- CTA 1200×650 (la caja; no el wrap del título).

---

## Top 10 blockers para el implementer (CA `bc-a0a75e4a…` / PR #70)

1. **Quitar o reemplazar `hidden lg:block` en todos los boards** (`SoyTechnoFigmaBody.tsx`: hero, desafío, BrandMarks, ChapterBar, A/B/C, Cashea, wizard, logistics, results, phones, testimonial, CTA). Bajo `lg` el caso es una página vacía de mockups. Mínimo: que el desktop Figma pinte desde ~1024 **y** que &lt;lg no borre hero/copy/CTA.
2. **Sacar el h1 y los leads del wrapper `hidden`** — hoy el título del caso desaparece juntos con el collage.
3. **Reponer el 4º phone**: `#soytechno-phones` recorta `mobile-screen-04` a ~18 px. El PNG muestra un phone izquierdo *legible*, no un filete.
4. **CTA a 2 líneas** (`47 px` / ancho 600): “¿Tu E-commerce está listo / para el nivel de un Web App?” — live wrappea `Web App?`.
5. **Sticky 144 px + chat**: `scroll-margin` / padding-top en cada section, o apagar el widget en esta ruta de preview. Si no, José “no ve” cabeceras de bloque.
6. **Wizard scale**: iPad del PNG es un device completo con tiendas; live 650×469 recorta.
7. **C empty-states**: no usar el mismo GIF que A si el frame pide pantallas vacías/404.
8. **Desafío GIF**: el frame de “Contáctanos” no es el catálogo del PNG; fijar poster o asset.
9. **Hero collage crop** (foto/wordmark/badges) vs banda 00–01 del PNG — residual, no “contenido faltante”.
10. **No merge a main** hasta que (1) &lt;lg no borre el body y (2) phones + CTA coincidan con el PNG a 1440.

Fuera de blockers: cajas 1200×656 / 1196 / 128 / 892 / 1400 / 600 / 650 ya están lockeadas y miden bien en 1440. No reabrir el layout absoluto salvo para phones/CTA/wizard.

---

## Método y entorno

1. PNG canon `01-reference/soytechno-full-page.png` (720×7900 = ½ de 1440×15800) cortado en bandas `/tmp/soytechno-ref-crops/`.
2. Crop B adjunto = 3 cards + phone + Circuito + logo + textos.
3. Preview Playwright 1440×900, scroll completo, `getBoundingClientRect` + screenshots por `#id`.
4. 0 errores de consola de app (warnings de Meta pixel / CSS preload / chat).
5. Imágenes: 52, 0 failed tras scroll (GIFs lazy; cargan).

---

## Artefactos

| Archivo | Qué prueba |
|---|---|
| `/opt/cursor/artifacts/qa_1440_hero_nav.png` | 1440: hero + título 3 líneas + collage pintan |
| `/opt/cursor/artifacts/qa_1440_desafio.png` | Un board 2×2, no 3 cards |
| `/opt/cursor/artifacts/qa_1440_section_b.png` | Composición B cerrada |
| `/opt/cursor/artifacts/qa_1440_phones.png` | 3 phones visibles; 4º no se lee |
| `/opt/cursor/artifacts/qa_1440_cta.png` | Título a 3 líneas |
| `/opt/cursor/artifacts/qa_1019_hidden_boards_top.png` | **&lt;lg: no hay hero/collage** |
| `/opt/cursor/artifacts/qa_1019_hidden_boards_mid.png` | **&lt;lg: solo títulos, página ~4385 px** |
| `.playwright-mcp/qa-soytechno/*.png` | Resto de secciones 1440 |

No merge. Este archivo es el entregable de QA.
