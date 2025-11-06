'use client';

import { handleSmoothScroll } from '@/utils/smoothScroll';

interface TableOfContentsProps {
  items: Array<{
    text: string;
    slug: string;
  }>;
}

export default function TableOfContents({ items }: TableOfContentsProps) {
  if (items.length === 0) return null;

  return (
    <div className="bg-[#DFFFFE] rounded-2xl p-8">
      <h2 className="text-2xl font-bold text-[#440099] mb-6">En este artículo</h2>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.slug} className="flex items-start">
            <span className="text-gray-700 mr-3 flex-shrink-0">•</span>
            <a
              href={item.slug}
              onClick={(e) => handleSmoothScroll(e, item.slug.replace('#', ''))}
              className="text-gray-700 hover:text-[#440099] transition-colors cursor-pointer text-sm leading-relaxed"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
      
      {/* Botón de descarga PDF */}
      <button className="mt-8 w-full bg-[#39DDCB] hover:bg-[#2CC4B3] text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm uppercase">
        <span>DESCARGA ESTE ARTÍCULO EN PDF</span>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
      </button>
    </div>
  );
}
