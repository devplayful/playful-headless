import NextImage, { type ImageProps } from 'next/image';
import { caseStudyGifVideoForSrc } from '@/lib/case-study-gif-video';

export default function CaseStudyMedia(props: ImageProps) {
  const video = caseStudyGifVideoForSrc(props.src);
  if (!video) {
    return <NextImage {...props} />;
  }

  const fit = props.className?.includes('object-cover') ? 'cover' : 'contain';
  const fillStyle = props.fill
    ? {
        position: 'absolute' as const,
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: fit,
      }
    : undefined;

  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      poster={video.poster}
      className={props.className}
      style={fillStyle}
      aria-label={typeof props.alt === 'string' ? props.alt : undefined}
    >
      <source src={video.webm} type="video/webm" />
      <source src={video.mp4} type="video/mp4" />
    </video>
  );
}
