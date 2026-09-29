import type { ReactNode } from 'react';

type BleedIllustrationCardProps = {
  className?: string;
  children: ReactNode;
  media: ReactNode;
  bodyClassName?: string;
  mediaClassName?: string;
};

/**
 * Pastel rounded card whose illustration bleeds to the card edges.
 * Copy stays below in its own padded block so titles/body never sit on the art.
 * Reserved media height avoids CLS.
 */
export default function BleedIllustrationCard({
  className = '',
  children,
  media,
  bodyClassName = 'p-8 md:p-10',
  mediaClassName = 'h-[200px] md:h-[240px]',
}: BleedIllustrationCardProps) {
  return (
    <div className={`rounded-[32px] shadow-lg overflow-hidden flex flex-col ${className}`}>
      <div className={`relative w-full shrink-0 overflow-hidden ${mediaClassName}`}>
        {media}
      </div>
      <div className={`${bodyClassName} flex flex-col flex-1`}>
        {children}
      </div>
    </div>
  );
}
