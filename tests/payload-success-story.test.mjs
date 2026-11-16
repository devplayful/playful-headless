import test from 'node:test';
import assert from 'node:assert/strict';
import { finalizePayloadSuccessStory } from '../lib/payload-success-story.ts';

test('finalizePayloadSuccessStory applies local tapa on imagenbanner for Jumex', () => {
  const story = finalizePayloadSuccessStory({
    id: 86237,
    slug: 'jumex-shopify-dtc-ecommerce',
    title: { rendered: 'JUMEX y Shopify: La Creación del Canal Directo (DTC) para un Portafolio Global' },
    acf: {
      imagenbanner: {
        url: 'https://endpoint.playfulagency.com/wp-content/uploads/2025/12/Tapa-Caso-de-exito-JUMEX-US.png',
        alt: 'JUMEX y Shopify:  La Creación del Canal Directo (DTC) para un Portafolio Global',
      },
      testimonial_foto: {
        url: 'https://endpoint.playfulagency.com/wp-content/uploads/2025/11/Ellipse-12.png',
        alt: 'Ellipse 12',
      },
    },
  });

  assert.equal(story.featured_media_url, '/casos/Tapa-Caso-de-exito-JUMEX-US.png');
  const banner = story.acf.imagenbanner;
  assert.equal(typeof banner === 'object' && banner && banner.url, '/casos/Tapa-Caso-de-exito-JUMEX-US.png');
  const foto = story.acf.testimonial_foto;
  assert.equal(
    typeof foto === 'object' && foto && foto.url,
    'https://endpoint.playfulagency.com/wp-content/uploads/2025/11/Ellipse-12.png',
  );
});
