import type { CollectionConfig } from 'payload';
import { contentHtmlField, datesFields, slugField, wpIdField, yoastField } from '../fields/common.ts';

/** Entradas del blog: URL pública /blog/<categoria>/<slug>. */
export const Posts: CollectionConfig = {
  slug: 'posts',
  access: { read: () => true },
  admin: { useAsTitle: 'titulo', defaultColumns: ['titulo', 'slug', 'categoria', 'modifiedGmt'] },
  fields: [
    { name: 'titulo', type: 'text', required: true },
    slugField,
    wpIdField,
    { name: 'estado', type: 'text', admin: { position: 'sidebar' } },
    {
      name: 'categoria',
      type: 'relationship',
      relationTo: 'categorias',
      admin: { description: 'Categoría principal: primer segmento de /blog/<categoria>/<slug>.' },
    },
    { name: 'categorias', type: 'relationship', relationTo: 'categorias', hasMany: true },
    { name: 'autor', type: 'relationship', relationTo: 'autores' },
    ...datesFields,
    { name: 'extracto', type: 'textarea' },
    contentHtmlField,
    { name: 'imagenDestacada', type: 'upload', relationTo: 'medios' },
    {
      name: 'imagenesContenido',
      type: 'array',
      admin: { description: 'Imágenes del cuerpo con su alt (los alt se conservan).' },
      fields: [
        { name: 'src', type: 'text' },
        { name: 'alt', type: 'text' },
      ],
    },
    {
      name: 'articulosRelacionados',
      type: 'relationship',
      relationTo: 'posts',
      hasMany: true,
      admin: { description: 'ACF articulos_relacionados.' },
    },
    { name: 'articulosRelacionadosWpIds', type: 'json', admin: { readOnly: true } },
    yoastField,
  ],
};
