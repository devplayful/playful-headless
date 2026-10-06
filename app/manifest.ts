import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Playful Agency',
    short_name: 'Playful',
    description: 'Agencia de e-commerce y marketing digital',
    start_url: '/',
    display: 'browser',
    background_color: '#FFEFD1',
    theme_color: '#440099',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
