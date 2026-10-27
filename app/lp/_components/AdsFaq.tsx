import type { ReactNode } from 'react';

type FaqItem = {
  question: string;
  answer: ReactNode;
};

/** details/summary FAQ: answer is a div (not p wrapping a block). */
export default function AdsFaq({ items }: { items: readonly FaqItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <details
          key={item.question}
          className="group overflow-hidden rounded-2xl bg-[#FEF7FF] shadow-md"
          open={index === 0}
        >
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 group-open:bg-[#D3B0FF] md:px-6 md:py-6 [&::-webkit-details-marker]:hidden">
            <h3 className="playful-h3 mb-0 pr-2 text-left">{item.question}</h3>
            <span
              aria-hidden="true"
              className="relative inline-flex h-6 w-6 flex-shrink-0 items-center justify-center"
            >
              <span className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23453A53%27 stroke-width=%272.6%27 stroke-linecap=%27round%27%3E%3Cpath d=%27M12 5v14M5 12h14%27/%3E%3C/svg%3E')] bg-contain bg-center bg-no-repeat group-open:hidden" />
              <span className="absolute inset-0 hidden bg-[url('data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23453A53%27 stroke-width=%272.6%27 stroke-linecap=%27round%27%3E%3Cpath d=%27M5 12h14%27/%3E%3C/svg%3E')] bg-contain bg-center bg-no-repeat group-open:block" />
            </span>
          </summary>
          <div className="bg-[#E9D7FF] px-5 py-5 md:px-6 md:py-6">{item.answer}</div>
        </details>
      ))}
    </div>
  );
}
