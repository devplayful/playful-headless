/** Copy literal de uploads/landing-eshow-v4.md — no editar sin actualizar el doc fuente. */

export const ESHOW_LANDING_TITLE =
  'Vamos de visita al eShow Madrid y te contamos.';

export const ESHOW_LANDING_META_DESCRIPTION =
  'El miércoles 4 y el jueves 5 de noviembre vamos al eShow Madrid, en IFEMA. A la vuelta te escribimos con lo que hayamos visto y aprendido en esos dos días.';

export const ESHOW_LANDING_H1 = ESHOW_LANDING_TITLE;

export const ESHOW_LANDING_INTRO_PARAGRAPHS = [
  'El miércoles 4 y el jueves 5 de noviembre vamos al eShow Madrid, la feria de ecommerce de Tech Show Madrid en IFEMA. Vamos como visitantes profesionales, a recorrer los pabellones y a escuchar las charlas de las salas del eShow, así que tenemos dos días enteros para ver de cerca lo que hoy se ofrece a las empresas que venden online.',
  'Esta edición es el 4 y el 5 de noviembre de 2026, en IFEMA Madrid, en los pabellones 3 a 5. El horario es de 10:00 a 19:00.',
  'Llevamos unas preguntas que salen de conversaciones con empresas que ya venden online y tienen un equipo detrás de la tienda. A la vuelta te escribimos con lo que hayamos visto y aprendido en esos dos días.',
  'Con este botón te apuntas para recibir las novedades del E-SHOW.',
] as const;

export const ESHOW_LANDING_FORM = {
  nameLabel: 'Nombre',
  namePlaceholder: 'Tu nombre',
  emailLabel: 'Email',
  emailPlaceholder: 'Tu email',
  consentBeforeLink:
    'Acepto recibir las novedades del E-SHOW y he leído la ',
  consentLinkText: 'política de privacidad',
  consentAfterLink: '.',
  privacyLine:
    'La responsable es PLAYFUL AGENCY NETWORK LLC y puedes darte de baja cuando quieras.',
  submit: 'Quiero seguir recibiendo novedades del E-SHOW',
  submitError:
    'No hemos podido enviar tu nombre y tu email. Vuelve a intentarlo en un momento.',
  emailValidationError:
    'Este email no tiene un formato válido, así que revísalo antes de enviarlo.',
} as const;

export const ESHOW_LANDING_ARTICLE = {
  href: 'https://playfulagency.com/blog/otros/eshow-madrid-2026',
  text: 'eShow Madrid, la feria de ecommerce de Tech Show Madrid en IFEMA',
} as const;

export const ESHOW_LANDING_THANKS = {
  heading: 'Ya te has apuntado a las novedades del E-SHOW.',
  body:
    'A la vuelta te escribimos con lo que hayamos visto y aprendido en esos dos días.',
} as const;

export const ESHOW_LANDING_PRIVACY_URL = 'https://playfulagency.com/politica-de-privacidad';
