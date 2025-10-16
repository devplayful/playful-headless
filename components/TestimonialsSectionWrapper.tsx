'use client';

import dynamic from 'next/dynamic';

dynamic(() => import("../app/casos-de-exito-agencia-de-marketing-digital/TestimonialsSection"), {
  ssr: false,
});

export default function TestimonialsSectionWrapper() {
  const TestimonialsSection = dynamic(
    () => import("../app/casos-de-exito-agencia-de-marketing-digital/TestimonialsSection"),
    { ssr: false }
  );

  return <TestimonialsSection />;
}
