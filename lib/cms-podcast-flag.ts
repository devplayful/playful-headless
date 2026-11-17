export const CMS_PODCAST_FROM_PAYLOAD_ENV = 'CMS_PODCAST_FROM_PAYLOAD';

export function isCmsPodcastFromPayload(env: NodeJS.ProcessEnv = process.env): boolean {
  return env[CMS_PODCAST_FROM_PAYLOAD_ENV] === 'true';
}

export function shouldRenderPodcastFromPayload(
  cmsQueryOptIn: boolean,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (isCmsPodcastFromPayload(env)) return true;
  return cmsQueryOptIn && env.VERCEL_ENV === 'preview';
}