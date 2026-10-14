import Image from 'next/image';

type BlogBylineChipProps = {
  name: string;
  href?: string;
  updatedLabel?: string;
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
  avatarSrc,
  avatarAlt,
  avatarPriority = false,
}: BlogBylineChipProps) {
  const avatar = avatarSrc ? (
    <Image
      src={avatarSrc}
      alt={avatarAlt || name}
      width={24}
      height={24}
      sizes="24px"
      priority={avatarPriority}
      className="h-6 w-6 shrink-0 rounded-full object-cover"
    />
  ) : null;

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
          <span className="min-w-0 text-sm font-medium">{updatedLabel}</span>
        </>
      ) : null}
    </div>
  );
}
