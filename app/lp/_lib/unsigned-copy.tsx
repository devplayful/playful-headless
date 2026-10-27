import type { ReactNode } from 'react';
import type { ContentPlaceholder } from './placeholders';

export function unsignedLabel(tag: string): string {
  return `[COPY SIN FIRMAR — ${tag}: …]`;
}

export function UnsignedBlock({
  block,
  as = 'p',
  className = 'playful-contenido-p',
  extra,
}: {
  block: ContentPlaceholder;
  as?: 'p' | 'h1' | 'h2' | 'h3';
  className?: string;
  extra?: string;
}) {
  const Tag = as;
  return (
    <div className="space-y-2" data-copy-unsigned={block.tag}>
      <Tag className={className}>{unsignedLabel(block.tag)}</Tag>
      <p className="text-sm text-[#453A53] italic border-l-2 border-[#E9D7FF] pl-3" data-content-note>
        Nota para Contenido: {block.note}
        {extra ? ` ${extra}` : ''}
      </p>
    </div>
  );
}

export function UnsignedFaqAnswer({ block }: { block: ContentPlaceholder }) {
  return (
    <div className="space-y-2" data-copy-unsigned={block.tag}>
      <p className="playful-contenido-p mb-0">{unsignedLabel(block.tag)}</p>
      <p className="text-sm text-[#453A53] italic" data-content-note>
        Nota para Contenido: {block.note}
      </p>
    </div>
  );
}

export function UnsignedInline({ block }: { block: ContentPlaceholder }): ReactNode {
  return unsignedLabel(block.tag);
}
