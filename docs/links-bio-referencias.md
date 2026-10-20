# Referencias de link in bio (investigación previa al rediseño de `/links`)

Investigación del 19 oct 2026, **antes** de rediseñar `/links`. Fuentes: galerías y rankings de Linktree, Beacons, Stan Store, bio.link, Koji, Carrd, Milkshake, Later Linkin.bio / Campsite, y artículos de «best link in bio examples» (Hootsuite, Sprout Social, Later, Deck of Carrd).

Criterio: páginas **reales y vivas** (HTTP 200 el 19 oct), sobre todo agencias, marcas D2C y estudios creativos. Capturas móviles a **390×844**, página completa, en `/opt/cursor/artifacts/links_ref_01.png` … `links_ref_10.png`.

## Galerías y rankings consultados

- [8 Best Link in Bio Tools in 2026 (Sprout Social)](https://sproutsocial.com/insights/link-in-bio-tools/)
- [12 Best Link in Bio Tools in 2026 (Linkship)](https://linkship.cc/en/blog/best-link-in-bio-tools-2026)
- [Link in bio: How to set up and optimize (Hootsuite)](https://blog.hootsuite.com/link-in-bio/) — ejemplos Fable, Listerine, Tilebar
- [Best Link in Bio Tools for Brands & Creators (Later)](https://later.com/blog/link-in-bio-tools/)
- [Deck of Carrd](https://deckof.carrd.co/) — 52 sitios Carrd
- [Beacons gallery](https://beacons.ai/gallery) y homepage (iJustine, Andrea Botez)
- [Stan Store](https://www.stan.store/) — storefronts destacados
- [Koji shutdown](https://withkoji.com/koji-shutdown) — Koji fue adquirido por Linktree y apagado el 1 feb 2024; no hay páginas vivas que capturar

## 10 ejemplos vivos

### 01. Active Theory — estudio de creative technology (Linktree)

- **URL:** https://linktr.ee/activetheory
- **Captura:** `/opt/cursor/artifacts/links_ref_01.png`
- **Por qué funciona:** cabecera con marca + una línea; un **fotograma a ancho completo** abre la página; debajo, filas con **miniatura del proyecto** (no el logo repetido). Jerarquía clara: featured ≠ resto.

### 02. 3 Deep — agencia de branding de lujo (Linktree)

- **URL:** https://linktr.ee/3deepdesign
- **Captura:** `/opt/cursor/artifacts/links_ref_02.png`
- **Por qué funciona:** **fondo de marca a sangre** (textura, no blanco); avatar + handle + **una línea de descripción**; botones con aire y tipografía serena. El color y la atmósfera venden más que la lista.

### 03. Allbirds — D2C (Linktree)

- **URL:** https://linktr.ee/allbirds
- **Captura:** `/opt/cursor/artifacts/links_ref_03.png`
- **Por qué funciona:** logo circular, nombre, **claim publicado** y redes; pastillas blancas con **mucho aire**; tipografía limpia. Premium por contención, no por recargar.

### 04. Liquid Death — D2C (Linktree)

- **URL:** https://linktr.ee/liquiddeath
- **Captura:** `/opt/cursor/artifacts/links_ref_04.png`
- **Por qué funciona:** cada fila lleva la **foto real del producto** (lata, collab), nunca el isotipo como miniatura. El feed se lee como catálogo, no como menú genérico.

### 05. Fable — marca/app (Later Linkin.bio; ejemplo Hootsuite)

- **URL:** https://linkin.bio/fable
- **Captura:** `/opt/cursor/artifacts/links_ref_05.png`
- **Por qué funciona:** **tarjeta destacada** con portada + título + CTA; después una **rejilla visual** de contenidos. El primer bloque decide el clic; el resto es exploración.

### 06. Between Collective — agencia creativa (Lisboa, Linktree)

- **URL:** https://linktr.ee/betweencollective
- **Captura:** `/opt/cursor/artifacts/links_ref_06.png`
- **Por qué funciona:** una línea de estudio + iconos sociales; las filas de **trabajo de cliente** usan la portada/pieza real. Contacto y web quedan como secundarios, no como clones del logo.

### 07. Abigail Peugh — storefront (Stan Store)

- **URL:** https://stan.store/abigailpeugh
- **Captura:** `/opt/cursor/artifacts/links_ref_07.png`
- **Por qué funciona:** cada oferta es una **tarjeta con foto, título y CTA**; el destacado (comunidad / precio) ocupa más que un enlace plano. El patrón Stan: bloque grande arriba, grid de productos debajo.

### 08. VVH Creative — agencia (Milkshake / msha.ke)

- **URL:** https://msha.ke/vvh.creative/
- **Captura:** `/opt/cursor/artifacts/links_ref_08.png`
- **Por qué funciona:** **foto de estudio a pantalla completa** + nombre + una línea + pastillas blancas con aire. Mobile-first tipo story: atmósfera primero, links después.

### 09. It's Fine Company — estudio de producto (Carrd)

- **URL:** https://itsfine.company
- **Captura:** `/opt/cursor/artifacts/links_ref_09.png`
- **Por qué funciona:** no es una lista de botones: **secciones, tipografía propia, un CTA de producto arriba**. Carrd gana cuando el bio deja de parecer plantilla.

### 10. ShoutnHike — agencia (bio.link)

- **URL:** https://bio.link/shoutnhike
- **Captura:** `/opt/cursor/artifacts/links_ref_10.png`
- **Por qué funciona (y qué no copiar):** cabecera clara (logo, nombre, «Digital Marketing Agency», redes) y pastillas con aire. **Anti-patrón:** la miniatura es el **logo repetido** en cada botón — exactamente lo que José pidió evitar en Playful.

## Beacons (vivo, sin captura usable aquí)

Perfiles vivos el 19 oct: [beacons.ai/ijustine](https://beacons.ai/ijustine), [beacons.ai/andreabotez](https://beacons.ai/andreabotez). Desde este entorno Cloudflare bloqueó el render (403 / «Just a moment…»). El patrón Beacons que sí aplica: **bloques con media real**, no filas idénticas, y un featured (drop, show, producto) arriba.

## Koji

[withkoji.com/koji-shutdown](https://withkoji.com/koji-shutdown): Koji cerró el 1 feb 2024 tras la compra por Linktree. No hay ejemplos vivos. El legado útil es el de **bloques visuales** (tarjeta con media), no el de botones de texto.

## 5 patrones a aplicar en `/links` de Playful

1. **Un destacado, no cinco botones iguales.** Zelle como tarjeta grande: portada a ancho completo arriba y título debajo (Active Theory, Fable, Stan).
2. **Miniatura = portada del destino.** Casos: tapas Jumex / Odwalla / SoyTechno del repo. Landings: covers ya aprobados. Contacto: ilustración Playful. Nunca el logo como thumb (Liquid Death, Between Collective; anti-patrón ShoutnHike).
3. **Cabecera de marca + una línea ya publicada.** Logo/avatar, «Playful Agency», «Agencia de e-commerce». Sin copy nuevo (Allbirds, 3 Deep).
4. **Fondo lavanda/morado de las landings** (`#E9D7FF` + `background.webp` + puntos decorativos del home). La página no puede ser un lienzo blanco con pastillas teal (3 Deep, VVH).
5. **Sistema visual del sitio, con aire.** Paytone / DM Sans, radios grandes, sombra del header, hover/tap (`translate` + sombra). Tarjetas blancas, no `.playful-boton` a ancho completo. Hueco generoso entre bloques (Allbirds, Stan).
