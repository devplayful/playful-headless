import type { ReactNode } from 'react';

type FaqItem = {
  question: string;
  answer: ReactNode;
};

export default function PasarelaFaqAccordion({ items }: { items: readonly FaqItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <details
          key={item.question}
          className="group overflow-hidden rounded-2xl bg-white shadow-md"
          open={index === 0}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 bg-white px-5 py-5 md:px-6 md:py-6 text-[#453A53] group-open:bg-[#440099] group-open:text-white [&::-webkit-details-marker]:hidden">
            <h3 className="mb-0 pr-2 text-left font-[family-name:var(--font-paytone-one),var(--font-montserrat),sans-serif] text-[1.25rem] leading-[1.15] md:text-[1.75rem]">
              {item.question}
            </h3>
            <span
              aria-hidden="true"
              className="relative inline-flex h-5 w-5 flex-shrink-0 items-center justify-center"
            >
              <span className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23453A53%27 stroke-width=%272.6%27 stroke-linecap=%27round%27%3E%3Cpath d=%27M12 5v14M5 12h14%27/%3E%3C/svg%3E')] bg-contain bg-center bg-no-repeat group-open:hidden" />
              <span className="absolute inset-0 hidden bg-[url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23FFFFFF%27 stroke-width=%272.6%27 stroke-linecap=%27round%27%3E%3Cpath d=%27M5 12h14%27/%3E%3C/svg%3E')] bg-contain bg-center bg-no-repeat group-open:block" />
            </span>
          </summary>
          <div className="bg-[#95eae2] px-5 py-5 md:px-6 md:py-6">
            <p className="playful-contenido-p mb-0">{item.answer}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
