type BlogBylineChipProps = {
  name: string;
  href?: string;
  updatedLabel?: string;
  avatarSrc?: string;
  avatarAlt?: string;
};

/** Author pill: rounded-full purple chip, 24px avatar, one line of text-sm font-medium. */
export function BlogBylineChip({
  name,
  href,
  updatedLabel,
  avatarSrc,
  avatarAlt,
}: BlogBylineChipProps) {
  const author = href ? (
    <a href={href} className="min-w-0 text-sm font-medium text-white hover:underline">
      {name}
    </a>
  ) : (
    <span className="min-w-0 text-sm font-medium">{name}</span>
  );

  return (
    <div className="inline-flex max-w-full min-w-0 items-center gap-2 rounded-full bg-[#440099] px-4 py-2 text-white">
      {avatarSrc ? (
        <img
          src={avatarSrc}
          alt={avatarAlt || name}
          className="h-6 w-6 shrink-0 rounded-full"
        />
      ) : null}
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
