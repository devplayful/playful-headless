type Environment = Readonly<Record<string, string | undefined>>;

export function previewContactSubmissionsEnabled(
  env: Environment = process.env,
): boolean {
  if (env.VERCEL_ENV !== 'preview') return true;
  return env.PREVIEW_CONTACT_SUBMISSIONS_ENABLED === 'true';
}
