'use client';

import { useState } from 'react';
import Image from 'next/image';

const FALLBACK_AVATAR_SRC = '/images/avatar-playful.svg';

type BlogBylineChipProps = {
  name: string;
  href?: string;
  updatedLabel?: string;
  /** ISO 8601 with timezone for the visible last-updated copy. */
  updatedDateTime?: string;
  avatarSrc?: string;
  avatarAlt?: string;
  /** Hero bylines should not lazy-load the 24px avatar. */
  avatarPriority?: boolean;
};

/** Author pill: rounded-full purple chip, 24px avatar, one line of text-sm font-medium. */
export function BlogBylineChip({
  name,
  href,
  updatedLabel,
  updatedDateTime,
  avatarSrc,
  avatarAlt,
  avatarPriority = false,
}: BlogBylineChipProps) {
  const fallbackSrc = FALLBACK_AVATAR_SRC;
  const initialSrc = avatarSrc || fallbackSrc;
  const [src, setSrc] = useState(initialSrc);
  const [hidden, setHidden] = useState(false);

  const avatar = hidden ? null : (
    <Image
      src={src}
      alt={avatarAlt || name}
      width={24}
      height={24}
      sizes="24px"
      priority={avatarPriority}
      unoptimized={src.endsWith('.svg')}
      onError={() => {
        if (src !== fallbackSrc) {
          setSrc(fallbackSrc);
          return;
        }
        setHidden(true);
      }}
      className="h-6 w-6 shrink-0 rounded-full object-cover"
    />
  );

  const authorLabel = (
    <span className="min-w-0 text-sm font-medium">{name}</span>
  );

  const author = href ? (
    <a
      href={href}
      className="inline-flex min-w-0 items-center gap-2 text-white hover:underline"
    >
      {avatar}
      {authorLabel}
    </a>
  ) : (
    <>
      {avatar}
      {authorLabel}
    </>
  );

  return (
    <div className="inline-flex max-w-full min-w-0 items-center gap-2 rounded-full bg-[#440099] px-4 py-2 text-white">
      {author}
      {updatedLabel ? (
        <>
          <span className="text-white/70" aria-hidden="true">
            ·
          </span>
          {updatedDateTime ? (
            <time dateTime={updatedDateTime} className="min-w-0 text-sm font-medium">
              {updatedLabel}
            </time>
          ) : (
            <span className="min-w-0 text-sm font-medium">{updatedLabel}</span>
          )}
        </>
      ) : null}
    </div>
  );
}
