export const DIAGNOSTIC_CALL_COPY = Object.freeze({
  title: 'Una llamada para revisar tu e-commerce',
  body:
    'Si diriges una marca D2C que ya vende en Shopify o WooCommerce y la tienda no acompaña el ritmo del negocio, esta llamada diagnóstica es para ti. En 30 minutos revisaremos la tienda, sus puntos ciegos y los próximos pasos posibles. No es una presentación de paquetes ni una llamada para dar precios.',
  cta: 'Solicitar llamada diagnóstica',
  support:
    'Completa el formulario. Revisaremos la información antes de contactarte para coordinar la llamada.',
  durationMinutes: 30,
  href: '/contactar-agencia-de-marketing-digital',
});

/**
 * Replace only the known legacy service CTA block rendered from WordPress.
 * If the upstream markup changes, leave it untouched rather than guessing.
 */
export function applyDiagnosticCallCopyToElementor(html, pageId) {
  let out = html;

  out = out.replace(
    /(<h2 class="main-heading">)(¡Es Hora de actuar y cambiar tu futuro digital!\s*\(\s*sin necesidad de magia negra\s*\))(<\/h2>)/g,
    `$1<span class="playful-magia-negra">$2</span>${DIAGNOSTIC_CALL_COPY.title}$3`,
  );

  out = out.replace(
    /(<div class="sub-heading">)(No esperes más para dar el siguiente paso\.[\s\S]*?tu próxima gran campaña comienza con una conversación\.)(<\/div>)/g,
    `$1<span class="playful-magia-negra">$2</span>${DIAGNOSTIC_CALL_COPY.body}$3`,
  );

  out = out.split(
    '<span class="text">¡Contáctanos y empieza ya!</span>',
  ).join(
    `<span class="text playful-magia-negra">¡Contáctanos y empieza ya!</span><span class="text">${DIAGNOSTIC_CALL_COPY.cta}</span>`,
  );

  // Diseño Web uses a different verified Elementor block. Limit this variant
  // to its public WordPress page ID so generic "¡Hablemos!" buttons elsewhere
  // are never rewritten accidentally.
  if (pageId === 83849) {
    out = out.replace(
      '<h2 class="main-heading">¡Conectemos y comencemos a trabajar!</h2>',
      `<h2 class="main-heading"><span class="playful-magia-negra">¡Conectemos y comencemos a trabajar!</span>${DIAGNOSTIC_CALL_COPY.title}</h2>`,
    );
    out = out.replace(
      /(<div class="sub-heading">)(Ya sea que tengas preguntas, ideas o simplemente quieras conocer más sobre cómo podemos ayudarte a mejorar tu presencia en línea, estamos aquí para escucharte\.<br>\s*No esperes más: tu próxima gran campaña comienza con una conversación\.)(<\/div>)/g,
      `$1<span class="playful-magia-negra">$2</span>${DIAGNOSTIC_CALL_COPY.body}$3`,
    );
    out = out.split(
      '<span class="text">¡Hablemos!</span>',
    ).join(
      `<span class="text playful-magia-negra">¡Hablemos!</span><span class="text">${DIAGNOSTIC_CALL_COPY.cta}</span>`,
    );
  }

  return out;
}
