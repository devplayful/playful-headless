// Opt-in only: production must keep its existing analytics and chat behavior.
export function isReadOnlySeoPreview(env = process.env) {
  return env.VERCEL_ENV === 'preview' && env.SEO_READ_ONLY_PREVIEW === 'true';
}
