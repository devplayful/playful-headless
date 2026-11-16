import type { CollectionConfig } from 'payload';
import { wpIdField } from '../fields/common.ts';

export const Categorias: CollectionConfig = {
  slug: 'categorias',
  access: { read: () => true },
  admin: { useAsTitle: 'nombre' },
  fields: [
    wpIdField,
    { name: 'nombre', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'descripcion', type: 'textarea', admin: { description: 'Texto propio: si está vacío, el listado va noindex,follow.' } },
    { name: 'parentWpId', type: 'number' },
  ],
};
