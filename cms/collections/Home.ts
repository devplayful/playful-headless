import type { CollectionConfig } from 'payload';

/** Singleton lógico: un documento slug `main` con el JSON de bloques de la Home. */
export const Home: CollectionConfig = {
  slug: 'home',
  labels: { singular: 'Home', plural: 'Home' },
  admin: {
    useAsTitle: 'slug',
    description: 'Contenido estático de la Home (bloques hero, servicios, casos, etc.).',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      defaultValue: 'main',
      admin: { readOnly: true },
    },
    {
      name: 'content',
      type: 'json',
      required: true,
      admin: {
        description: 'Estructura HomeMainContent (ver cms/data/home-main-content.ts).',
      },
    },
  ],
};
