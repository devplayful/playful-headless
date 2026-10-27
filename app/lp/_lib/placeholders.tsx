import type { ReactNode } from 'react';

export type ContentPlaceholder = {
  /** Visible tag in brackets, e.g. "H1", "intro", "FAQ 1 — pregunta". */
  tag: string;
  /** Brief for Contenido / José (not public marketing copy). */
  note: string;
};

export function placeholderLabel(tag: string): string {
  return `[COPY PENDIENTE — ${tag}: …]`;
}

export function PlaceholderBlock({
  block,
  as = 'p',
  className = 'playful-contenido-p',
}: {
  block: ContentPlaceholder;
  as?: 'p' | 'h1' | 'h2' | 'h3';
  className?: string;
}) {
  const label = placeholderLabel(block.tag);
  const Tag = as;
  return (
    <div className="space-y-2">
      <Tag className={className}>{label}</Tag>
      <p className="text-sm text-[#6B6570] italic border-l-2 border-[#E9D7FF] pl-3" data-content-note>
        Nota para Contenido: {block.note}
      </p>
    </div>
  );
}

export function PlaceholderFaqAnswer({ block }: { block: ContentPlaceholder }) {
  return (
    <div className="space-y-2">
      <p className="playful-contenido-p mb-0">{placeholderLabel(block.tag)}</p>
      <p className="text-sm text-[#6B6570] italic" data-content-note>
        Nota para Contenido: {block.note}
      </p>
    </div>
  );
}

export function PlaceholderInline({ block }: { block: ContentPlaceholder }): ReactNode {
  return placeholderLabel(block.tag);
}
