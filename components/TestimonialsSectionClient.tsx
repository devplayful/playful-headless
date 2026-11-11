'use client';

import dynamic from 'next/dynamic';

const TestimonialsSection = dynamic(
  () => import('../app/(frontend)/casos-de-exito/TestimonialsSection'),
  { ssr: false }
);

export default function TestimonialsSectionClient({
  className,
  copy,
}: {
  className?: string;
  copy?: import('@/cms/data/home-main-content').HomeMainContent['testimonios'];
}) {
  return <TestimonialsSection className={className} copy={copy} />;
}
