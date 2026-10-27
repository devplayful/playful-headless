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

/** Author pill: purple chip, 24px avatar, name row then date row on small screens. */
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
      unoptimized
      onError={() => {
        if (src !== fallbackSrc) {
          setSrc(fallbackSrc);
          return;
        }
        setHidden(true);
      }}
      className="h-6 w-6 shrink-0 rounded-full bg-white object-cover"
    />
  );

  const author = href ? (
    <a
      href={href}
      className="inline-flex min-w-0 items-center gap-2 text-white hover:underline"
    >
      {avatar}
      <span className="text-xs font-medium sm:text-sm">{name}</span>
    </a>
  ) : (
    <span className="inline-flex min-w-0 items-center gap-2">
      {avatar}
      <span className="text-xs font-medium sm:text-sm">{name}</span>
    </span>
  );

  return (
    <div className="inline-flex max-w-full flex-col items-start gap-y-1 rounded-full bg-[#440099] px-3 py-2 text-white sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-2 sm:px-4">
      {author}
      {updatedLabel ? (
        <span className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-xs font-medium sm:text-sm">
          <span className="text-white/70" aria-hidden="true">
            ·
          </span>
          {updatedDateTime ? (
            <time dateTime={updatedDateTime}>{updatedLabel}</time>
          ) : (
            <span>{updatedLabel}</span>
          )}
        </span>
      ) : null}
    </div>
  );
}
