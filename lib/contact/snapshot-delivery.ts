import type { WebsiteLead } from './types.ts';

/**
 * WordPress contact delivery is retired: leads are acknowledged locally and
 * synced to HighLevel when the pipeline is enabled.
 */
export async function acknowledgeContactSubmission(_lead: WebsiteLead): Promise<void> {
  return;
}
