type BlogBylineChipProps = {
  name: string;
  avatarSrc?: string;
  avatarAlt?: string;
  detail?: string;
};

/** Author / editorial pill: rounded-full purple chip, 24px avatar, text-sm font-medium. */
export function BlogBylineChip({
  name,
  avatarSrc,
  avatarAlt,
  detail,
}: BlogBylineChipProps) {
  return (
    <div className="inline-flex max-w-full min-w-0 items-center gap-2 rounded-full bg-[#440099] px-4 py-2 text-white">
      {avatarSrc ? (
        <img
          src={avatarSrc}
          alt={avatarAlt || name}
          className="h-6 w-6 shrink-0 rounded-full bg-white"
        />
      ) : null}
      <span className="min-w-0 text-sm font-medium leading-tight">
        {name}
        {detail ? (
          <span className="block text-xs font-normal text-white/90">{detail}</span>
        ) : null}
      </span>
    </div>
  );
}
