import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const home = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');

test('home matches production layout (frozen on preview branch)', () => {
  assert.match(home, /¿Tu e-commerce está perdiendo dinero sin que lo sepas\?/);
  assert.match(home, /Playful Agency:/);
  assert.match(home, /MaterialServicesSection/);
  assert.match(home, /SolucionesPlayful/);
  assert.match(home, /CarouselResultados/);
  assert.match(home, /TestimonialsSection/);
  assert.match(home, /BlogRelatedPostsSection/);
  assert.match(home, /TwoColumnCtaSection/);
  assert.doesNotMatch(home, /from '@\/lib\/home-copy'/);
  assert.doesNotMatch(home, /HomeB2BSections/);
  assert.doesNotMatch(home, /HomeB2BCasosSection/);
  assert.doesNotMatch(home, /HomeB2BTestimonialsSection/);
});

test('home hero CTA uses contact form link (production copy)', () => {
  const hero = home.slice(home.indexOf('data-cta-section="hero"'), home.indexOf('<CimaBreaker variant="home"'));
  assert.match(hero, /href="\/contactar-agencia-de-marketing-digital"/);
  assert.match(hero, /Completa el formulario y cuéntanos tu idea/);
  assert.doesNotMatch(hero, /href="\/agencia-shopify"/);
});

test('home footer CTA uses booking href', () => {
  assert.match(home, /buttonLink=\{SERVICE_BOOKING_HREF\}/);
  assert.match(home, /Llena el formulario y hablemos sobre tu web/);
});
