export const CMS_BLOG_FROM_PAYLOAD_ENV = 'CMS_BLOG_FROM_PAYLOAD';

export function isCmsBlogFromPayload(env: NodeJS.ProcessEnv = process.env): boolean {
  return env[CMS_BLOG_FROM_PAYLOAD_ENV] === 'true';
}

export function shouldRenderBlogFromPayload(
  cmsQueryOptIn: boolean,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (isCmsBlogFromPayload(env)) return true;
  return cmsQueryOptIn && env.VERCEL_ENV === 'preview';
}