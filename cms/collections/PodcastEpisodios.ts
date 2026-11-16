import type { CollectionConfig } from 'payload';
import { contentHtmlField, datesFields, slugField, wpIdField, yoastField } from '../fields/common.ts';

export const PodcastEpisodios: CollectionConfig = {
  slug: 'podcast-episodios',
  access: { read: () => true },
  admin: { useAsTitle: 'titulo', defaultColumns: ['titulo', 'slug', 'publishedGmt'] },
  fields: [
    { name: 'titulo', type: 'text', required: true },
    slugField,
    wpIdField,
    { name: 'estado', type: 'text', admin: { position: 'sidebar' } },
    ...datesFields,
    { name: 'extracto', type: 'textarea' },
    contentHtmlField,
    { name: 'imagenDestacada', type: 'upload', relationTo: 'medios' },
    yoastField,
  ],
};