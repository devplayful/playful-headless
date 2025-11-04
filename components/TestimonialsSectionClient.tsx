'use client';

import dynamic from 'next/dynamic';

const TestimonialsSection = dynamic(
  () => import('../app/casos-de-exito-agencia-de-marketing-digital/TestimonialsSection'),
  { ssr: false }
);

export default function TestimonialsSectionClient() {
  return <TestimonialsSection />;
}
