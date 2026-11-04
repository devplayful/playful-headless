import type { WebsiteLead, ContactAttribution } from '../contact/types.ts';
import type { EnabledHighLevelConfig } from '../highlevel/config.ts';
import type { HighLevelGateway, UpsertContactInput } from '../highlevel/client.ts';
import { buildCalificacionGhlContactPayload } from '../qa-filtro/ghl-payload.ts';
import type { QaCalifTag, QaFiltroAnswers } from '../qa-filtro/types.ts';
import {
  mapClickAndUtmFields,
  nativeContactAttribution,
} from '../highlevel/workflow.ts';

export interface CalificacionLeadContext {
  name: string;
  email: string;
  originalAttribution: ContactAttribution;
  recentAttribution: ContactAttribution;
}

function websiteLeadShape(context: CalificacionLeadContext): Pick<
  WebsiteLead,
  'name' | 'email' | 'originalAttribution' | 'recentAttribution'
> {
  return {
    name: context.name,
    email: context.email,
    originalAttribution: context.originalAttribution,
    recentAttribution: context.recentAttribution,
  };
}

export function buildCalificacionUpsertInput(
  answers: QaFiltroAnswers,
  califTag: QaCalifTag,
  context: CalificacionLeadContext,
  config: EnabledHighLevelConfig,
): UpsertContactInput {
  const califPayload = buildCalificacionGhlContactPayload(answers, califTag, {
    includeQaInterno: false,
  });
  const lead = websiteLeadShape(context) as WebsiteLead;
  const attributionFields = mapClickAndUtmFields(lead, config);
  return {
    name: califPayload.name,
    email: califPayload.email,
    locationId: config.locationId,
    assignedTo: config.ownerId,
    tags: califPayload.tags,
    ...nativeContactAttribution(lead),
    customFields: [...califPayload.customFields, ...attributionFields],
    createNewIfDuplicateAllowed: false,
  };
}

export async function syncCalificacionToHighLevel(
  answers: QaFiltroAnswers,
  califTag: QaCalifTag,
  context: CalificacionLeadContext,
  gateway: HighLevelGateway,
  config: EnabledHighLevelConfig,
): Promise<{ contactId: string }> {
  const input = buildCalificacionUpsertInput(answers, califTag, context, config);
  const contact = await gateway.upsertContact(input);
  return { contactId: contact.id };
}
