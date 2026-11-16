import type { CollectionConfig } from 'payload';
import { contentHtmlField, datesFields, slugField, wpIdField, yoastField } from '../fields/common.ts';

export const Paginas: CollectionConfig = {
  slug: 'paginas',
  access: { read: () => true },
  admin: { useAsTitle: 'titulo' },
  fields: [
    { name: 'titulo', type: 'text', required: true },
    slugField,
    wpIdField,
    { name: 'estado', type: 'text', admin: { position: 'sidebar' } },
    { name: 'parentWpId', type: 'number', admin: { position: 'sidebar' } },
    { name: 'link', type: 'text', admin: { position: 'sidebar' } },
    { name: 'plantilla', type: 'text', admin: { position: 'sidebar' } },
    ...datesFields,
    contentHtmlField,
    { name: 'imagenDestacada', type: 'upload', relationTo: 'medios' },
    { name: 'acf', type: 'json' },
    yoastField,
  ],
};
