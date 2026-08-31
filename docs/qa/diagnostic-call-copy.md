# QA: llamada diagnóstica

Fuente aprobada: [ClickUp 86cb8rdfy](https://app.clickup.com/t/86cb8rdfy).

Estado: **revisión interna**. Sin push, Preview ni despliegue.

## Copy canónico

- Título: **Una llamada para revisar tu e-commerce**
- Cuerpo: **Si diriges una marca D2C que ya vende en Shopify o WooCommerce y la tienda no acompaña el ritmo del negocio, esta llamada diagnóstica es para ti. En 30 minutos revisaremos la tienda, sus puntos ciegos y los próximos pasos posibles. No es una presentación de paquetes ni una llamada para dar precios.**
- CTA: **Solicitar llamada diagnóstica**
- Apoyo: **Completa el formulario. Revisaremos la información antes de contactarte para coordinar la llamada.**
- Destino: `/contactar-agencia-de-marketing-digital`

## Superficies incluidas

- Home: CTA del hero, CTA de las dos secciones de servicios y bloque final.
- Formulario: introducción, encabezado, botón, apoyo y bloque final.
- Servicios renderizados desde Elementor: solo los bloques finales verificados y únicamente cuando coinciden el slug y page ID aprobados: E-commerce (`agencia-e-commerce`, `85582`), SEO (`agencia-seo`, `83510`), SEM (`agencia-sem`, `83848`) y Diseño Web (`agencia-diseno-web`, `83849`). La sustitución de título, cuerpo y CTA es atómica; si falta una pieza, no cambia el HTML. Se conserva el enlace existente al formulario.
- Casos: botón de los casos individuales y bloque final del listado.

## Superficies no forzadas

- Header y Footer conservan `Contáctanos`: son enlaces generales de navegación, no una promesa de reserva.
- Los títulos y cuerpos de CTA de casos individuales siguen dependiendo de campos ACF de WordPress. Este cambio alinea la acción y el destino, pero no inventa reemplazos para contenido remoto no incluido en la fuente aprobada.
- No se cambiaron textos legales, el calendario, automatizaciones ni enlaces de reserva.
- El texto legal existente bajo el formulario sigue mencionando `Enviar mensaje`. Se conserva literalmente por instrucción y queda pendiente de revisión Privacidad/Legal; no se corrige dentro de este PR.

## Verificación

1. Ejecutar `npm run test:diagnostic-copy`.
2. Cuando exista Preview, añadir aquí su URL exacta y ejecutar `npm run test:diagnostic-preview` con `DIAGNOSTIC_COPY_BASE_URL` apuntando a esa URL.
3. Ejecutar `npm run build` con acceso estable a WordPress.
4. En Preview, revisar a 1440 px y aproximadamente 390 px:
   - `/`
   - `/contactar-agencia-de-marketing-digital`
   - `/agencia-e-commerce`
   - `/casos-de-exito/odwalla-shopify-dtc-ecommerce`
5. Confirmar texto exacto, 30 minutos, CTA y destino al formulario.
6. Confirmar ausencia de rangos, métricas, testimonios o reserva inmediata dentro de estos bloques.
7. No enviar el formulario durante esta revisión; el envío controlado pertenece a la tarea 1.3.

Rollback: revertir solo el commit de copy; la ruta del formulario permanece estable.

URL exacta de Preview: pendiente; se añadirá después de que Preview exista. No se usa una URL de ejemplo durante revisión interna.

## Resultado local 2026-08-31

- `npm run test:diagnostic-copy`: PASS.
- `DIAGNOSTIC_COPY_BASE_URL=http://127.0.0.1:3100 npm run test:diagnostic-preview`: PASS; Home, formulario, cuatro servicios, caso Odwalla y listado de casos devolvieron 200.
- `tsc --noEmit`: PASS.
- `npm run build`: compila y supera la comprobación de tipos; falla después al recopilar `/blog/[...slug]` con `ReferenceError: File is not defined`. El mismo fallo se reprodujo sin este cambio en una worktree limpia de `origin/main`.
- Contacto a 1440×900 y 390×844: título y CTA visibles, sin desbordamiento horizontal.
- Home: cuatro CTA canónicos, todos dirigidos al formulario.
- Los cuatro servicios y el caso Odwalla: CTA canónico dirigido al formulario.
- Los desbordamientos horizontales observados en servicio e-commerce (119 px a 1440; 377 px a 390) y caso Odwalla (9 px a 390) son idénticos en `origin/main` y en esta rama; no fueron introducidos ni ampliados por el copy.
