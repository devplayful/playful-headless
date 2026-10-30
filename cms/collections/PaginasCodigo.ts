import type { CollectionConfig } from 'payload';
import { slugField, yoastField } from '../fields/common.ts';

/** Páginas cuyo origen es el código Next (H6), no Elementor/WP. */
export const PaginasCodigo: CollectionConfig = {
  slug: 'paginas-codigo',
  labels: { singular: 'Página código', plural: 'Páginas código' },
  admin: {
    useAsTitle: 'titulo',
    defaultColumns: ['titulo', 'slug', 'bloque', 'updatedAt'],
  },
  access: { read: () => true },
  fields: [
    { name: 'titulo', type: 'text', required: true },
    slugField,
    {
      name: 'bloque',
      type: 'text',
      required: true,
      admin: { description: 'Bloque H6 (p. ej. b1 legales).' },
    },
    {
      name: 'content',
      type: 'json',
      required: true,
      admin: { description: 'Snapshot congelado del copy (ver cms/data/*-payload.ts).' },
    },
    yoastField,
  ],
};
