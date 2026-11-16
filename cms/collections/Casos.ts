import type { CollectionConfig } from 'payload';
import { contentHtmlField, datesFields, slugField, wpIdField, yoastField } from '../fields/common.ts';
import { casoAcfFields } from './casos-acf-fields.ts';

export const Casos: CollectionConfig = {
  slug: 'casos',
  access: { read: () => true },
  admin: { useAsTitle: 'titulo' },
  fields: [
    { name: 'titulo', type: 'text', required: true },
    slugField,
    wpIdField,
    { name: 'estado', type: 'text', admin: { position: 'sidebar' } },
    ...datesFields,
    contentHtmlField,
    { name: 'imagenDestacada', type: 'upload', relationTo: 'medios' },
    { name: 'acf', type: 'group', fields: casoAcfFields },
    {
      // ACF «Video» (group_6355d51c9403a), campo url_video (URL). En WP el grupo
      // tiene «Show in REST API» = No, así que el import puede dejarlo en null.
      name: 'url_video',
      type: 'text',
      required: false,
      admin: { description: 'URL del vídeo del caso (ACF «Video» → url_video).' },
      validate: (value: unknown) => {
        if (value === null || value === undefined || value === '') return true;
        if (typeof value !== 'string') return 'Debe ser una URL';
        try {
          const u = new URL(value);
          return u.protocol === 'http:' || u.protocol === 'https:' ? true : 'La URL debe empezar por http(s)://';
        } catch {
          return 'URL no válida';
        }
      },
    },
    yoastField,
  ],
};
