'use client';

import dynamic from 'next/dynamic';

const TestimonialsSection = dynamic(
  () => import('../app/casos-de-exito/TestimonialsSection'),
  { ssr: false }
);

interface FeaturedTestimonial {
  quote: string;
  name: string;
  role: string;
}

export default function TestimonialsSectionClient({
  className,
  title,
  intro,
  alliesTitle,
  featuredTestimonials,
}: {
  className?: string;
  title?: string;
  intro?: string;
  alliesTitle?: string;
  featuredTestimonials?: readonly FeaturedTestimonial[];
}) {
  return (
    <TestimonialsSection
      className={className}
      title={title}
      intro={intro}
      alliesTitle={alliesTitle}
      featuredTestimonials={featuredTestimonials}
    />
  );
}
