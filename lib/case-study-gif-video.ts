export const CASE_STUDY_GIF_VIDEOS = {
  'JumexUX-Pagina-web.gif': {
    mp4: '/videos/casos/jumex-ux.mp4',
    webm: '/videos/casos/jumex-ux.webm',
    poster: '/videos/casos/jumex-ux.jpg',
  },
  'Drink-Odwalla-pagina-web.gif': {
    mp4: '/videos/casos/odwalla.mp4',
    webm: '/videos/casos/odwalla.webm',
    poster: '/videos/casos/odwalla.jpg',
  },
} as const;

export function caseStudyGifVideoForSrc(src: unknown) {
  if (typeof src !== 'string') return null;
  for (const [gif, assets] of Object.entries(CASE_STUDY_GIF_VIDEOS)) {
    if (src.includes(gif)) return assets;
  }
  return null;
}
