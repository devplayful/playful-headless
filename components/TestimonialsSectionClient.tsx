'use client';

import dynamic from 'next/dynamic';

const TestimonialsSection = dynamic(
  () => import('../app/casos-de-exito/TestimonialsSection'),
  { ssr: false }
);

interface TestimonialItem {
  quote?: string;
  content?: string;
  name: string;
  role?: string;
}

export default function TestimonialsSectionClient({
  className,
  title,
  intro,
  alliesTitle,
  items,
  hideHeader,
  hideQuotes,
}: {
  className?: string;
  title?: string;
  intro?: string;
  alliesTitle?: string;
  items?: readonly TestimonialItem[];
  hideHeader?: boolean;
  hideQuotes?: boolean;
}) {
  return (
    <TestimonialsSection
      className={className}
      title={title}
      intro={intro}
      alliesTitle={alliesTitle}
      items={items}
      hideHeader={hideHeader}
      hideQuotes={hideQuotes}
    />
  );
}
