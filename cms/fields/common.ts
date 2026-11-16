import type { Field } from 'payload';

/** Id del registro en WordPress: clave de idempotencia del importador. */
export const wpIdField: Field = {
  name: 'wpId',
  type: 'number',
  unique: true,
  index: true,
  admin: { position: 'sidebar', description: 'Id en WordPress (importación idempotente).' },
};

export const slugField: Field = {
  name: 'slug',
  type: 'text',
  required: true,
  index: true,
  admin: { position: 'sidebar' },
};

export const datesFields: Field[] = [
  {
    name: 'date',
    type: 'date',
    admin: { position: 'sidebar', description: 'Publicación (instante UTC, desde date_gmt de WP).' },
  },
  { name: 'wpDate', type: 'text', admin: { position: 'sidebar', description: 'date de WP tal cual (hora local del sitio, sin zona).' } },
  {
    name: 'modifiedGmt',
    type: 'date',
    admin: { position: 'sidebar', description: 'modified_gmt de WP: fuente del lastmod del sitemap.' },
  },
];

/** Campos de Yoast que hay que conservar (ver SEO-MAPA.md). */
export const yoastField: Field = {
  name: 'yoast',
  type: 'group',
  fields: [
    { name: 'title', type: 'text' },
    { name: 'description', type: 'textarea' },
    { name: 'canonical', type: 'text' },
    { name: 'robots', type: 'json' },
    { name: 'ogImage', type: 'text', admin: { description: 'URL de og:image.' } },
    { name: 'ogTitle', type: 'text' },
    { name: 'ogDescription', type: 'textarea' },
    { name: 'schema', type: 'json', admin: { description: 'Grafo JSON-LD de Yoast tal cual.' } },
  ],
};

export const contentHtmlField: Field = {
  name: 'contentHtml',
  type: 'code',
  admin: { language: 'html', description: 'HTML renderizado de WP (fase 1; Lexical en fase 2).' },
};
