# QA visual SoyTechno — Figma 3798:11672 vs preview

**Veredicto: FAIL** (ronda crop-diff José, 6 pares IZQ=Figma / DER=build)

Agente: solo QA (sin rediseño, sin merge, sin implementar).  
Implementer: CA `bc-a0a75e4a` · PR #70 draft.  
Canon: handoff + 6 crops de José (2026-09-20). Criterio **nuevo**: pixel/composición Figma en desktop **y** tipografía Paytone One en encabezados de párrafo **y** mobile compuesto (no stack ingenuo).  
El PASS mobile-first de `1b63fb8` (stack legible vs artboard 1200) **sigue cerrado** como criterio de contenido; **no** cubre esta ronda.

Target: https://playful-headless-git-cursor-soytechno-7e59aa-playfuls-projects.vercel.app/casos-de-exito/soytechno-ecommerce-venezuela  
SHA implementación: **`1b63fb8140c97ec8dd345b803e1838baa6dff943`**  
SHA docs anterior: `419cf12`  
Viewports de los crops: desktop (~1440), lado a lado Figma | build.

Mandatos de José (bloquean PASS):

1. Encabezados de párrafo (`PRIORIDAD MÓVIL…`, `CROMÁTICA CONTROLADA…`, `ALGORITMO DE FILTRADO…`, y el resto de `Feature` h3) **deben ser Paytone One** (él escribió “Payton One”; familia = **Paytone One**). Hoy: `font-sans font-bold` (DM Sans) en `SoyTechnoFigmaBody` y `SoyTechnoMobile`.
2. Mobile **no** puede ser “todo uno debajo del otro”. Hay que componer (cards, overlaps, 2 columnas donde quepa, ritmo intencional). Hoy: `SoyTechnoMobile` = `space-y-12` + features/swatches/shots en columna.

---

## Tickets FAIL (pegar al implementer)

### Mandatos globales

**FAIL-01 — Paytone One en encabezados de párrafo**  
- **Dónde:** `Feature` h3 desktop (`SoyTechnoFigmaBody.tsx` ~L130) y mobile (`SoyTechnoMobile.tsx` ~L77). Títulos en `FIGMA.desafioItems`, `visualItems`, `logisticsItems`, `archItems`, `emptyItems`, `casheaItems`, `wizardItems`, y cards de resultados.  
- **Figma:** Paytone One, tracking cerrado, peso display.  
- **Build:** DM Sans Bold 22/17 px. Se ve “sans-serif de UI”, no display.  
- **Aplica a:** `PRIORIDAD MÓVIL COMO MANDATO`, `FILTROS INEFICACES`, `DISEÑO NO HOMOLOGADO`, `CROMÁTICA CONTROLADA`, `ELEMENTOS GRÁFICOS DE MARCA`, `BOTONES DE ALTA HEURÍSTICA`, `ALGORITMO DE FILTRADO MRW AVANZADO`, `APLICACIÓN DE CONDICIONALES GEOGRÁFICAS`, y el resto de h3 de párrafo.  
- **No confundir:** h1 hero, ChapterBar y títulos de sección ya usan `font-paytone`. El hueco es el **párrafo** (h3 Feature).  
- **Crops:** 2, 4, 5, 6.

**FAIL-02 — Mobile compuesto, no stack ingenuo**  
- **Dónde:** `SoyTechnoMobile.tsx` root `space-y-12`; desafío = copy luego 3 shots en columna; B = 3 swatches + phone + Circuito + 3 features en columna.  
- **Figma / mandato:** cards, overlaps, 2-col donde quepa, ritmo.  
- **Build:** todo apilado. El PASS de `1b63fb8` solo exigía “se lee”; José ahora rechaza la composición.  
- **Criterio de cierre:** en 375/768 el collage hero se solapa; desafío es 2×2 (texto+logo / phone+laptop / electrodomésticos); B es grid (cromas | phone+circuito | logo+copy), no lista.

---

### Crop 1 — Hero (IZQ Figma / DER build)

**FAIL-03 — Margen exterior púrpura con patrón**  
- **Layout / color:** Figma: canvas `#440099` con puntos alrededor de la card lavanda. Build: página `#FEF7FF` a sangre, sin orla ni patrón.  
- **Cierre:** orla púrpura + patrón de puntos del frame 3798:11672 (o el token del handoff), no solo lavanda suelto.

**FAIL-04 — Collage explotado vs apretado**  
- **Layout / scale / alignment:** Figma: badge Cashea C sobre el círculo de foto; foto pisa la card navy; WP + sello 100% originales pisan el borde inferior de la card. Un bloque.  
- **Build:** Cashea aislado arriba-derecha; foto casi no pisa la card; WP + sello abajo-izquierda, fuera de la navy. Collage “reventado”.  
- **Código:** offsets `left-[50%] top-0` (Cashea), `left-[46%] top-[10%]` (foto), navy `left-[8%] top-[30%]`, WP `top-[66%]` / sello `top-[68%]` — no el lock Figma.

**FAIL-05 — Falta icono teléfono/camioneta sobre la card navy**  
- **Asset ausente:** Figma: icono amarillo (truck/phone) **encima** de la card `#00193F` SoyTechno.  
- **Build:** la navy solo tiene wordmark blanco. `delivery-icon-3.png` está en el collage (`left-[74%] top-[4%]`) fuera de la card y **no se ve** en el crop.  
- **Cierre:** el icono debe sentarse en la navy (esquina superior derecha de la card), no flotar en el lavanda.

**FAIL-06 — Kerning Paytone del h1**  
- **Tipo:** Figma: Paytone One más cerrado. Build: mismo face, tracking más abierto (más aire entre glifos).  
- **Cierre:** letter-spacing / métrica del h1 = frame Figma, no el default del webfont.

---

### Crop 2 — Desafío 2×2

**FAIL-07 — Falta la card blanca redondeada del texto**  
- **Card ausente:** Figma: panel blanco radius grande con los 3 bloques (título + body).  
- **Build:** copy crudo sobre lavanda `#EADDFF`. No hay contenedor blanco.  
- **Cierre:** card blanca redondeada, padding interno, 3 features dentro.

**FAIL-08 — 2×2 roto en stack suelto**  
- **Layout:** Figma: **un** tablero lavanda: [card blanca] [tira azul logo] / [phone superpuesto] [laptop amarillo] [grid navy electrodomésticos].  
- **Build:** tira azul y phone más abajo; laptop y electrodomésticos separados; más aire blanco entre piezas.  
- **Cierre:** un board 2×2 con overlaps (phone sobre laptop / junta con electrodomésticos).

**FAIL-09 — Encabezados del desafío no son Paytone**  
- Hijo de **FAIL-01**. Crop 2: `PRIORIDAD MÓVIL…`, `FILTROS INEFICACES:`, `DISEÑO NO HOMOLOGADO:` se leen DM Sans Bold.

**FAIL-10 — Phone: escala, overlap y contenido de pantalla**  
- **Scale / alignment:** Figma: phone más grande, pisa el laptop amarillo. Build: más chico, más abajo, hueco con el laptop.  
- **Screen:** ambos catálogo, pero tiles distintos. Figma: monitor + TV (“Equipos de Computación / Televisores”). Build: speaker + laptop (“Hogar / Laptops”).  
- **Cierre:** frame + screenshot del handoff (`iphone-frame-01` / captura Figma), no un crop distinto del catálogo.

**FAIL-11 — Tira azul + logo circular**  
- **Scale / cards:** Figma: barra azul ancha, círculo logo grande centrado. Build: barra más baja, círculo más chico, más aislada del phone.

---

### Crop 3 — Desafío inferior / transición a Ingeniería de Checkout

**FAIL-12 — Laptop amarillo + phone + electrodomésticos no son un 2×2**  
- **Layout:** Figma: laptop en card crema/amarilla + phone solapado + card navy de electrodomésticos = **una** pieza, luego el título.  
- **Build:** laptop a la izquierda; electrodomésticos lejos a la derecha; phone recortado arriba-derecha; hueco blanco grande.  
- **Cierre:** las tres piezas comparten baseline/overlap del crop IZQ.

**FAIL-13 — Phone “sobrante” en la transición**  
- **Alignment:** Figma: el phone pertenece al 2×2, no flota sobre “Ingeniería de Checkout”. Build: peek del phone (Hogar / Laptops) arriba-derecha, descolgado.

**FAIL-14 — Aire excesivo antes de Ingeniería de Checkout**  
- **Spacing:** Figma: el h2 casi toca el 2×2. Build: banda vacía entre collage y título.  
- **Tipo (menor):** el h2 ya es Paytone; el ritmo vertical no.

---

### Crop 4 — Sección B superior (Coherencia visual)

**FAIL-15 — Pantalla del phone incorrecta (catálogo vs banner LG)**  
- **Phone screen:** Figma: header amarillo SoyTechno + banner rojo **LG SoyTechno / Zona LG** + producto.  
- **Build:** `iphone-mockup.gif` en frame de catálogo (Canon EOS R6, cámaras, “Disponible a crédito”).  
- **Cierre:** still Figma (banner LG), no un frame del GIF de catálogo.

**FAIL-16 — Proporciones de columnas**  
- **Layout:** Figma: croma navy | phone | logo navy corto + copy que **empieza a la altura del logo**.  
- **Build:** logo más bajo/cuadrado; columna de texto más estrecha; `CROMÁTICA CONTROLADA` arranca a media altura del phone.

**FAIL-17 — Alineación texto vs card logo**  
- **Alignment:** Figma: top de `CROMÁTICA…` = top de la card `SOYTECHNO`. Build: el copy cae por debajo del logo; queda un vacío entre logo y primer párrafo.

**FAIL-18 — Tamaños de cards vs phone**  
- **Scale:** Figma: croma navy ~cuadrada, phone más bajo que el bloque logo+CROMÁTICA. Build: phone más alto relativo al logo; cromas y logo no comparten la fila superior del frame.

**FAIL-19 — Encabezados B no son Paytone**  
- Hijo de **FAIL-01**. Crop 4–5: `CROMÁTICA CONTROLADA`, `ELEMENTOS GRÁFICOS DE MARCA`, `BOTONES DE ALTA HEURÍSTICA`.

---

### Crop 5 — Sección B inferior

**FAIL-20 — Alineación en escalera (stair-step)**  
- **Layout / alignment:** Figma: columna cromas (navy → May Green → Cadmium) | phone + Circuito debajo | copy a la derecha, **baselines compartidos**.  
- **Build:** May Green, Cadmium, Circuito y la columna de texto no comparten eje: cada card cae a una Y distinta (escalera).

**FAIL-21 — Phone: menú nav + FABs que no están en Figma**  
- **Phone screen:** Figma: sigue el still LG (o el mismo mock estático).  
- **Build:** GIF en frame de menú (Transferencias, Autenticación, Accesorios, WhatsApp FAB, hamburger).  
- **Cierre:** still estático del handoff. Si el GIF queda, el frame por defecto no puede ser nav/FAB.

**FAIL-22 — Circuito: tamaño y sitio**  
- **Cards:** Figma: Circuito bajo el phone, mismo ancho de columna, label “Circuito” arriba-izquierda. Build: la card existe pero no comparte ancho/baseline con el phone; en el crop inferior queda desfasada respecto a Cadmium y al texto.

---

### Crop 6 — Logística (Sistema Logístico Predictivo)

**FAIL-23 — iMac + mapa demasiado grandes**  
- **Scale:** Figma: mapa “ENVÍOS A NIVEL NACIONAL” chico sobre un iMac contenido; mucho lavanda a la derecha.  
- **Build:** iMac + mapa ocupan casi toda la columna (Abs mapa 340×210 + iMac 580×523 en board 640×760).  
- **Cierre:** escala y overlap del crop IZQ (mapa más chico, iMac más corto, más aire).

**FAIL-24 — Encabezados de logística no son Paytone**  
- Hijo de **FAIL-01**. `ALGORITMO DE FILTRADO MRW AVANZADO`, `APLICACIÓN DE CONDICIONALES GEOGRÁFICAS`.

**FAIL-25 — Spacing lead / features / iMac**  
- **Spacing:** Figma: más aire entre lead, los dos bloques y el gráfico. Build: copy y iMac más apelotonados; el mapa pisa más el iMac.

---

## Tabla por crop

| # | Crop | Layout | Tipo | Assets / cards | Scale | Alignment | Color | Phone screen |
|---|---|---|---|---|---|---|---|---|
| 1 | Hero | Collage explotado | h1 tracking abierto | Falta truck **sobre** navy | Piezas sueltas | Cashea/foto/WP no pisan | Falta orla `#440099` + puntos | n/a |
| 2 | Desafío 2×2 | 2×2 → stack | h3 DM Sans | **Falta card blanca** | Phone chico | Phone no pisa laptop | Lavanda OK; falta blanco | Tiles catálogo ≠ Figma |
| 3 | Desafío → Checkout | 3 piezas separadas | h2 OK | Phone peek suelto | Laptop/navy lejos | Phone sobre el título | OK | Peek Hogar/Laptops |
| 4 | B superior | 3 col desbalanceadas | h3 DM Sans | Logo vs copy | Phone alto vs logo | Copy debajo del logo | Cromas OK | **Catálogo cámaras ≠ banner LG** |
| 5 | B inferior | Escalera | h3 DM Sans | Circuito desfasado | Cards irregulares | Sin baseline común | OK | **Nav + FAB WhatsApp** |
| 6 | Logística | Gráfico come columna | h3 DM Sans | Piezas OK, escala no | iMac+mapa grandes | Mapa pisa más | OK | n/a (iMac) |

---

## Qué **no** reabre esta ronda

Cerrado en `1b63fb8` (no ticketear de nuevo):

- `hidden lg:block` en blanco &lt;lg → hay `SoyTechnoMobile`.
- Artboard 1200 con `scale(100cqw)` ilegible como único path mobile.
- h1 en `sr-only`.
- CTA inútil en 375.
- 4º phone peek 18 px en 1440.

Residuales (no son el FAIL de esta ronda): chat LeadConnector, sticky ~144 px, phones 1440 a 276×577 vs PNG 367×756.

---

## Preview

https://playful-headless-git-cursor-soytechno-7e59aa-playfuls-projects.vercel.app/casos-de-exito/soytechno-ecommerce-venezuela

Share (ronda anterior): `_vercel_share=s2IatNylWPTukG3fTOI57AA32iwEICPD`.  
Crops de José son la evidencia de esta ronda (no se re-capturó live; el lado DER es el build actual).

---

## Método

1. Lectura de 6 PNG lado a lado (IZQ Figma / DER build) que entregó José.
2. Cruce con `SoyTechnoFigmaBody.tsx` (Feature `font-sans font-bold`, collage hero, board desafío sin card blanca, `iphone-mockup.gif` en B, iMac Abs 580×523) y `SoyTechnoMobile.tsx` (`space-y-12`).
3. Tickets numerados FAIL-01…FAIL-25 para CA `bc-a0a75e4a`.
4. Sin cambios de página. Sin merge.

---

## Histórico

| Ronda | SHA | Criterio | Veredicto |
|---|---|---|---|
| 1 | `ad05086` | 1440 + “se ve todo” | FAIL (`hidden lg:block`) |
| 2 | `fb1c43e` | 375/768 no artboard 1200 | FAIL (`transform: none`) |
| 3 | `1b63fb8` | stack mobile legible | PASS (ese criterio) |
| **4** | **`1b63fb8` + crops José** | pixel Figma + Paytone h3 + mobile compuesto | **FAIL** |

No merge.
