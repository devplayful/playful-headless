import type { CollectionConfig } from 'payload';
import { contentHtmlField, datesFields, slugField, wpIdField } from '../fields/common.ts';

export const Equipo: CollectionConfig = {
  slug: 'equipo',
  access: { read: () => true },
  admin: { useAsTitle: 'titulo', defaultColumns: ['titulo', 'slug', 'cargo'] },
  fields: [
    { name: 'titulo', type: 'text', required: true },
    slugField,
    wpIdField,
    { name: 'estado', type: 'text', admin: { position: 'sidebar' } },
    { name: 'cargo', type: 'text' },
    { name: 'rol', type: 'text' },
    ...datesFields,
    { name: 'extracto', type: 'textarea' },
    contentHtmlField,
    { name: 'imagenDestacada', type: 'upload', relationTo: 'medios' },
    { name: 'acf', type: 'json' },
  ],
};