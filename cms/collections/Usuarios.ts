import type { CollectionConfig } from 'payload';

export const Usuarios: CollectionConfig = {
  slug: 'usuarios',
  auth: true,
  admin: { useAsTitle: 'email' },
  fields: [{ name: 'nombre', type: 'text' }],
};
