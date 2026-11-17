import type { HighLevelGateway } from './client.ts';
import { logInboundTagRetagFailure } from '../contact/crm-alert.ts';

/**
 * Removes the inbound website tag so the subsequent addContactTags can fire
 * HighLevel's "Tag Added" workflow again for returning leads.
 */
export async function refreshInboundTagForWorkflowRetrigger(
  gateway: HighLevelGateway,
  contactId: string,
  inboundTag: string,
  shouldRetag: boolean,
): Promise<void> {
  if (!shouldRetag) return;
  try {
    await gateway.removeContactTags(contactId, [inboundTag]);
  } catch (error) {
    logInboundTagRetagFailure(error);
  }
}