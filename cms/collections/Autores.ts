import type { CollectionConfig } from 'payload';
import { wpIdField } from '../fields/common.ts';

export const Autores: CollectionConfig = {
  slug: 'autores',
  access: { read: () => true },
  admin: { useAsTitle: 'nombre' },
  fields: [
    wpIdField,
    { name: 'nombre', type: 'text', required: true },
    { name: 'slug', type: 'text', index: true },
    { name: 'descripcion', type: 'textarea' },
    { name: 'url', type: 'text' },
    { name: 'avatarUrl', type: 'text' },
  ],
};
