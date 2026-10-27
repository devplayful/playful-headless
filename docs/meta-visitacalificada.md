# VisitaCalificada (plan B2, en código)

Evento personalizado de Meta montado **en el sitio**, no en GTM. Vive solo en las landings `/lp/*` (`/lp/calentamiento`, `/lp/integraciones-pasarela-erp`, `/lp/propuesta-ecommerce`).

## Qué hace el código

- `app/lp/layout.tsx` monta `VisitaCalificadaTracker` (cliente). El layout raíz, header, footer y el CSS global no se tocan.
- El helper `lib/analytics/visita-calificada.ts` dispara **una vez por página vista** (`window.__vcSent`) si se cumple A o B:
  - **A — lectura:** scroll ≥ 50 % de la altura del documento (profundidad visible, mismo criterio que GTM Scroll Depth) **y** ≥ 15 s en página. Hacen falta las dos.
  - **B — intención:** clic en un enlace cuyo `href` contiene `/reunion-playful`. El listener no llama `preventDefault`; la navegación la sigue llevando `CtaClickTracker` (`cta_reunion_click`). El CTA final lleva `data-cta="lp-meta-final"`.
- Llamada a Meta (cuando no es tráfico QA y `fbq` ya existe):

  ```js
  fbq('trackCustom', 'VisitaCalificada', {
    content_name: 'lp-calentamiento',
    trigger: 'scroll_time' | 'cta_click',
    lp_slug: '<slug>',
  }, { eventID: id });
  ```

  `id` es `'vc-'+Date.now()+'-'+Math.random().toString(36).slice(2,10)` y se guarda en `window.__vcEventId`.
- Después (siempre): `dataLayer.push({ event: 'visita_calificada', event_id: id, trigger, lp_slug })`.
- `fbq` lo carga GTM (tag 6) en producción. Si aún no existe, el helper reintenta hasta 5 s. Si no aparece, solo queda el push al `dataLayer`. No se modifica el contenedor `GTM-MXHKJ4NW`.

## Tráfico QA

`?qa=1` o `User-Agent: PlayfulQA/1.0` (`isQaTraffic`):

- **No** llama a `fbq`.
- **Sí** hace el push al `dataLayer` con `qa: true`.
- Escribe `console.debug('[visita_calificada]', payload)` para verlo en preview.

## Cómo probarlo en la preview

1. Abrir `/lp/calentamiento?qa=1` (o con UA `PlayfulQA/1.0`). Comprobar 200 y `noindex`.
2. Consola: hacer scroll hasta media página, esperar 15 s. Debe aparecer `visita_calificada` en `dataLayer` con `trigger: 'scroll_time'` y el `console.debug`. Recargar y pulsar el CTA de `/reunion-playful`: `trigger: 'cta_click'`. En ambos casos, una sola vez.
3. Pixel Helper (tráfico **no** QA, producción o preview con GTM/píxel reales): evento `VisitaCalificada` con `eventID` `vc-…`. En QA el Helper no verá `fbq` a propósito.
4. Fuera de `/lp/*` (p. ej. `/` o `/agencia-shopify`) no se monta el tracker: no hay push.

## Alternativa GTM del brief

**No se ha montado.** El brief (sección 1, plan B2) describe una etiqueta HTML en GTM, variables `{{cjs - eventID}}` / Scroll Depth / Clic y secuenciación tras la tag 6. Ese camino queda documentado ahí; este cambio es la vía en código. El contenedor `GTM-MXHKJ4NW` no se publica ni se edita.
