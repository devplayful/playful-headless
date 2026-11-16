import type { CollectionConfig } from 'payload';
import { servicioBlocks } from '../blocks/servicio-blocks.ts';
import { datesFields, slugField, wpIdField, yoastField } from '../fields/common.ts';

export const Servicios: CollectionConfig = {
  slug: 'servicios',
  access: { read: () => true },
  admin: { useAsTitle: 'titulo', defaultColumns: ['titulo', 'slug', 'updatedAt'] },
  fields: [
    { name: 'titulo', type: 'text', required: true },
    slugField,
    wpIdField,
    {
      name: 'h1',
      type: 'text',
      admin: { description: 'H1 público (auditoría SEO; no sustituye al del HTML Elementor).' },
    },
    { name: 'estado', type: 'text', admin: { position: 'sidebar' }, defaultValue: 'publish' },
    ...datesFields,
    {
      name: 'bloques',
      type: 'blocks',
      required: true,
      blocks: servicioBlocks,
    },
    yoastField,
  ],
};
