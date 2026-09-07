type Environment = Readonly<Record<string, string | undefined>>;

const ISOLATED_PREVIEW_CONTACT_HOST = 'wpqa.playfulagency.com';

/**
 * The simulator is deliberately more restrictive than the normal Preview
 * delivery path. It is an opt-in test harness, never a production fallback.
 */
export function previewContactSimulatorEnabled(
  env: Environment = process.env,
): boolean {
  return env.VERCEL_ENV === 'preview'
    && env.PREVIEW_CONTACT_SIMULATOR_ENABLED === 'true';
}

function isolatedPreviewBackendConfigured(env: Environment): boolean {
  if (env.PREVIEW_CONTACT_BACKEND_ISOLATED !== 'true'
    || env.HIGHLEVEL_TEST_MODE !== 'true') return false;

  try {
    const endpoint = new URL(env.WORDPRESS_API_URL || '');
    return endpoint.protocol === 'https:'
      && endpoint.hostname === ISOLATED_PREVIEW_CONTACT_HOST
      && endpoint.port === ''
      && endpoint.pathname === '/wp-json';
  } catch {
    return false;
  }
}

export function previewContactSubmissionsEnabled(
  env: Environment = process.env,
): boolean {
  if (env.VERCEL_ENV !== 'preview') return true;
  return env.PREVIEW_CONTACT_SUBMISSIONS_ENABLED === 'true'
    && isolatedPreviewBackendConfigured(env);
}
