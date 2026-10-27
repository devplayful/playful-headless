# PR compartidos — 27 oct 2026

Rama `cursor/a11y-compartidos-2710`. Cero cambios visuales: solo ARIA, labels invisibles y teclado.

## Archivos

- `components/AnimatedButton.tsx` — Lottie `aria-hidden`
- `components/ContactLeadForm.tsx` — `aria-label` en marketplaces (mismo placeholder); grupo reCAPTCHA; colores de main
- `components/CarouselResultados.tsx` — flechas con `aria-label`; `inert` en clones `aria-hidden`; CTA `tabIndex=-1` (mismo botón visual)
- `components/ui/PortfolioCarousel.tsx` — módulo A11y de Swiper

`services/wordpress.ts` no entra: su único cambio era `applyElementorA11y`, aparcado.

## Capturas

`docs/qa-sprint-20261027-compartidos/visual/` — 390 y 1440, prod vs local mismo SHA (`antes` = prod, `despues` = preview local).
