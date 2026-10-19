/**
 * Copy de /avisos-eshow.
 *
 * Todos los textos de usuario son PLACEHOLDERS. Pegar aquí el copy firmado
 * sin tocar componentes ni la página.
 */

export const AVISOS_ESHOW_PATH = '/avisos-eshow';

/** Formulario GHL embebido (id del builder). No es copy. */
export const AVISOS_ESHOW_GHL_FORM_ID = 'dFgOGgLMEaiJUHW8UrBF';

/**
 * UTM del botón del email eShow Madrid 2026. La página no los inventa:
 * conserva los de la URL (y cookies first/last touch) como el resto del sitio.
 */
export const AVISOS_ESHOW_EMAIL_UTM = {
  utm_source: 'ghl',
  utm_medium: 'email',
  utm_campaign: 'eshow-madrid-2026',
  utm_content: 'base-avisos',
} as const;

const PLACEHOLDER = '[PLACEHOLDER]';

export const AVISOS_ESHOW_META = {
  title: `${PLACEHOLDER} Avisos eShow Madrid 2026 | Playful Agency`,
  description: `${PLACEHOLDER} Meta description de la landing de avisos eShow Madrid 2026. Sustituir por el copy firmado.`,
} as const;

export const AVISOS_ESHOW_HERO = {
  h1: `${PLACEHOLDER} H1 de avisos eShow Madrid 2026`,
  intro: `${PLACEHOLDER} Entradilla: un párrafo que explique por qué apuntarse a los avisos. Sustituir por el copy firmado.`,
} as const;

export const AVISOS_ESHOW_BENEFITS = {
  h2: `${PLACEHOLDER} Beneficios de apuntarte a los avisos`,
  items: [
    {
      title: `${PLACEHOLDER} Beneficio 1`,
      body: `${PLACEHOLDER} Descripción del primer beneficio de la lista de avisos. Sustituir por el copy firmado.`,
    },
    {
      title: `${PLACEHOLDER} Beneficio 2`,
      body: `${PLACEHOLDER} Descripción del segundo beneficio de la lista de avisos. Sustituir por el copy firmado.`,
    },
    {
      title: `${PLACEHOLDER} Beneficio 3`,
      body: `${PLACEHOLDER} Descripción del tercer beneficio de la lista de avisos. Sustituir por el copy firmado.`,
    },
  ],
} as const;

export const AVISOS_ESHOW_FORM = {
  h2: `${PLACEHOLDER} Formulario para apuntarte a los avisos`,
  embedTitle: `${PLACEHOLDER} Formulario de avisos eShow Madrid 2026`,
} as const;
