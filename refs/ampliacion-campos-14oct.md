# Fuente — Ampliación 14 oct 2026: campos, botón y gracias

Encargo de ampliación (mismo run, prioridad máxima):

> además de título, entrada y consentimiento, entrega también: etiquetas y placeholders de los campos del formulario (mínimo: nombre, email, tienda/URL opcional), texto del botón y mensaje de gracias tras enviar.

## Campos pedidos por el encargo

- Nombre
- Email
- Tienda/URL, opcional

No se piden más campos. No se inventan teléfono, facturación ni cargo.

## Por qué nombre y email son obligatorios

La finalidad del formulario es enviar avisos por correo (`refs/NEED-avisos-eshow.md`). Sin correo no hay envío. El nombre está en las categorías que la política publicada ya trata:

> «Datos identificativos (nombre y, en su caso, apellidos)»
> «Dirección de correo electrónico y/o teléfono (dependiendo del medio utilizado)»

Fuente: https://playfulagency.com/politica-de-privacidad

## Obligatorio / opcional (AEPD)

Decálogo AEPD, punto 7 (https://www.aepd.es/guias/decalogo-politicas-de-privacidad-adaptacion-rgpd.pdf):

> «Debe informarse al interesado si tiene una obligación legal o contractual de facilitar los datos personales, o si es un requisito necesario para suscribir un contrato, o si el interesado está obligado a facilitar sus datos personales. Asimismo, en tales casos, hay que explicar las posibles consecuencias de no facilitar tales datos.»

Aplicado: nombre y correo son requisito para apuntarse a los avisos. La URL de la tienda es opcional; no darla no impide el envío.

## Botón

Sin CTA de venta (encargo original). Corey (web) pide verbo + qué obtiene. No se usa el CTA de `/gracias` («agendar sesión») ni el de contacto («Nos pondremos en contacto»).

## Gracias: no reutilizar /gracias

La página live https://playfulagency.com/gracias (código `app/gracias/page.tsx`, solo lectura) es de leads de contacto:

> «¡Recibimos tu caso!»
> «Hablemos de dónde está tu e-commerce…»
> «Cumplo estas condiciones: agendar sesión»

Ese texto no sirve para este formulario. El mensaje de gracias de Avisos eShow solo confirma el apunte a los avisos. No agenda reunión. No promete plazo de primer correo ([DATO PENDIENTE]: frecuencia y si hay correo de confirmación / doble opt-in).

## Placeholders del formulario de contacto (no se copian)

`app/contactar-agencia-de-marketing-digital/ContactPageClient.tsx` (solo lectura):

- Nombre → «Déjanos aquí tu nombre»
- Correo → «Correo electrónico dónde te contactaremos»
- Negocio → «Y... el nombre de tu empresa»

Ese tono es de contacto comercial. Este formulario es literal.
