export const COMMON_SERVICE_CTA_FIXTURE = [
  '<h2 class="main-heading">¡Es Hora de actuar y cambiar tu futuro digital! (sin necesidad de magia negra)</h2>',
  '<div class="sub-heading">No esperes más para dar el siguiente paso. tu próxima gran campaña comienza con una conversación.</div>',
  '<a href="/contactar-agencia-de-marketing-digital/"><span class="text">¡Contáctanos y empieza ya!</span></a>',
].join('');

export const DESIGN_SERVICE_CTA_FIXTURE = [
  '<h2 class="main-heading">¡Conectemos y comencemos a trabajar!</h2>',
  '<div class="sub-heading">Ya sea que tengas preguntas, ideas o simplemente quieras conocer más sobre cómo podemos ayudarte a mejorar tu presencia en línea, estamos aquí para escucharte.<br>\n',
  'No esperes más: tu próxima gran campaña comienza con una conversación.</div>',
  '<a href="/contactar-agencia-de-marketing-digital/"><span class="text">¡Hablemos!</span></a>',
].join('');

export const TARGET_SERVICE_FIXTURES = [
  { pageId: 85582, slug: 'agencia-e-commerce', html: COMMON_SERVICE_CTA_FIXTURE },
  { pageId: 83510, slug: 'agencia-seo', html: COMMON_SERVICE_CTA_FIXTURE },
  { pageId: 83848, slug: 'agencia-sem', html: COMMON_SERVICE_CTA_FIXTURE },
  { pageId: 83849, slug: 'agencia-diseno-web', html: DESIGN_SERVICE_CTA_FIXTURE },
];

export const NON_TARGET_CONTEXTS = [
  { pageId: 0, slug: 'home-2' },
  { pageId: 8, slug: 'home-2' },
  { pageId: 12345, slug: 'pagos' },
  { pageId: 83509, slug: 'agencia-seo' },
  { pageId: 83511, slug: 'agencia-seo' },
  { pageId: 83847, slug: 'agencia-sem' },
  { pageId: 83850, slug: 'agencia-diseno-web' },
  { pageId: 85581, slug: 'agencia-e-commerce' },
  { pageId: 85583, slug: 'agencia-e-commerce' },
  { pageId: 85582, slug: 'pagos' },
  { pageId: 12345, slug: 'agencia-e-commerce' },
];
