'use client';

import dynamic from 'next/dynamic';

const TestimonialsSection = dynamic(
  () => import('../app/casos-de-exito/TestimonialsSection'),
  { ssr: false }
);

export default function TestimonialsSectionClient({ className }: { className?: string }) {
  return <TestimonialsSection className={className} />;
}
