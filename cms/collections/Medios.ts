import type { CollectionConfig } from 'payload';
import { wpIdField } from '../fields/common.ts';

/**
 * Medios. En fase 1 solo guardamos la URL de origen de WP y sus metadatos
 * (no se descargan los binarios). El almacenamiento real es configurable:
 * Vercel Blob si hay BLOB_READ_WRITE_TOKEN, disco local si no.
 */
export const Medios: CollectionConfig = {
  slug: 'medios',
  access: { read: () => true },
  upload: {
    staticDir: process.env.PAYLOAD_MEDIA_DIR || 'media',
    filesRequiredOnCreate: false,
  },
  admin: { useAsTitle: 'titulo' },
  fields: [
    wpIdField,
    { name: 'alt', type: 'text' },
    { name: 'titulo', type: 'text' },
    { name: 'caption', type: 'textarea' },
    { name: 'sourceUrl', type: 'text', index: true, admin: { description: 'URL original en WP.' } },
    { name: 'wpMimeType', type: 'text' },
    { name: 'wpWidth', type: 'number' },
    { name: 'wpHeight', type: 'number' },
    { name: 'wpSizes', type: 'json' },
  ],
};
