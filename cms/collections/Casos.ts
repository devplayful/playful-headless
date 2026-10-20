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
    yoastField,
  ],
};
