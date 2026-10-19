const WORDPRESS_ENDPOINT_HOST = 'endpoint.playfulagency.com';
const WORDPRESS_UPLOADS_PATH = '/wp-content/uploads/';

export function isAllowedCaseStudyMediaUrl(value) {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      url.hostname === WORDPRESS_ENDPOINT_HOST &&
      url.port === '' &&
      !url.username &&
      !url.password &&
      url.pathname.startsWith(WORDPRESS_UPLOADS_PATH)
    );
  } catch {
    return false;
  }
}

function numericWidth(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0;
}

/** Prefer the largest allowlisted WP derivative (full > large > source_url). */
export function largestAllowedCaseStudyMediaUrl(media) {
  if (!media || typeof media !== 'object') return '';

  const candidates = [];
  const push = (url, width) => {
    if (!isAllowedCaseStudyMediaUrl(url)) return;
    candidates.push({ url, width: numericWidth(width) });
  };

  push(media.source_url, media.media_details?.width ?? media.width);
  const sizes = media.media_details?.sizes;
  if (sizes && typeof sizes === 'object') {
    for (const variant of Object.values(sizes)) {
      if (!variant || typeof variant !== 'object') continue;
      push(variant.source_url, variant.width);
    }
  }

  if (candidates.length === 0) return '';

  let best = candidates[0];
  for (const candidate of candidates.slice(1)) {
    if (candidate.width > best.width) {
      best = candidate;
      continue;
    }
    // Same pixel width: keep the original (no -300x300 suffix), else source_url.
    if (candidate.width === best.width && candidate.url === media.source_url) {
      best = candidate;
    }
  }
  return best.url;
}

export function preserveFeaturedMediaUrl(source, sanitized) {
  const featuredMedia = source?._embedded?.['wp:featuredmedia'];
  const firstMedia = Array.isArray(featuredMedia) ? featuredMedia[0] : undefined;
  const sourceUrl = largestAllowedCaseStudyMediaUrl(firstMedia);

  if (!sourceUrl) return sanitized;

  return {
    ...sanitized,
    featured_media_url: sourceUrl,
  };
}

export function selectCaseStudyCardMediaUrl(source) {
  const sourceUrl = source?.featured_media_url;
  return isAllowedCaseStudyMediaUrl(sourceUrl) ? sourceUrl : '';
}
