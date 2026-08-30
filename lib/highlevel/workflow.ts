import type { WebsiteLead } from '../contact/types.ts';
import type { EnabledHighLevelConfig, HighLevelCustomFieldKey } from './config.ts';
import type {
  HighLevelCustomFieldValue,
  HighLevelGateway,
  HighLevelOpportunity,
} from './client.ts';

export class AmbiguousOpportunityError extends Error {
  constructor(public readonly count: number) {
    super(`El contacto ya tiene ${count} oportunidades abiertas en el pipeline canónico.`);
    this.name = 'AmbiguousOpportunityError';
  }
}

export interface CrmSyncResult {
  contactId: string;
  opportunityId: string;
  opportunityCreated: boolean;
  taskId: string;
}

function field(
  config: EnabledHighLevelConfig,
  key: HighLevelCustomFieldKey,
  value: string | boolean,
): HighLevelCustomFieldValue {
  return { id: config.customFieldIds[key], fieldValue: String(value) };
}

function recentFields(lead: WebsiteLead, config: EnabledHighLevelConfig): HighLevelCustomFieldValue[] {
  const attribution = lead.recentAttribution;
  return [
    field(config, 'recent_source', attribution.source),
    field(config, 'recent_landing', attribution.landing),
    field(config, 'utm_source', attribution.utm_source),
    field(config, 'utm_medium', attribution.utm_medium),
    field(config, 'utm_campaign', attribution.utm_campaign),
    field(config, 'utm_term', attribution.utm_term),
    field(config, 'utm_content', attribution.utm_content),
    field(config, 'form_id', attribution.formId),
    field(config, 'privacy_consent_at', lead.consentCapturedAt),
    field(config, 'marketing_consent', lead.marketingConsent),
  ];
}

function originalFields(lead: WebsiteLead, config: EnabledHighLevelConfig): HighLevelCustomFieldValue[] {
  return [
    field(config, 'original_source', lead.originalAttribution.source),
    field(config, 'original_landing', lead.originalAttribution.landing),
  ];
}

function selectOrReject(opportunities: HighLevelOpportunity[]): HighLevelOpportunity | undefined {
  if (opportunities.length > 1) throw new AmbiguousOpportunityError(opportunities.length);
  return opportunities[0];
}

export async function syncWebsiteLeadToHighLevel(
  lead: WebsiteLead,
  gateway: HighLevelGateway,
  config: EnabledHighLevelConfig,
  now = new Date(),
): Promise<CrmSyncResult> {
  const contact = await gateway.upsertContact({
    name: lead.name,
    email: lead.email,
    ...(lead.phone ? { phone: lead.phone } : {}),
    ...(lead.business ? { companyName: lead.business } : {}),
    locationId: config.locationId,
    assignedTo: config.ownerId,
    customFields: recentFields(lead, config),
    createNewIfDuplicateAllowed: false,
  });

  if (contact.isNew) {
    await gateway.updateContactCustomFields(contact.id, originalFields(lead, config));
  }
  await gateway.addContactTags(contact.id, [config.contactTag]);

  const existing = selectOrReject(await gateway.findOpenOpportunities(
    config.locationId,
    config.pipelineId,
    contact.id,
  ));

  const opportunity = existing || await gateway.createOpportunity({
    pipelineId: config.pipelineId,
    locationId: config.locationId,
    name: `${lead.business || lead.name} — consulta web`,
    pipelineStageId: config.consultaStageId,
    status: 'open',
    contactId: contact.id,
    assignedTo: config.ownerId,
  });

  const dueDate = new Date(now.getTime() + config.slaHours * 60 * 60 * 1000).toISOString();
  const task = await gateway.createTask(contact.id, {
    title: 'Responder consulta web',
    body: `Siguiente acción del formulario ${lead.recentAttribution.formId}.`,
    dueDate,
    completed: false,
    assignedTo: config.ownerId,
  });

  return {
    contactId: contact.id,
    opportunityId: opportunity.id,
    opportunityCreated: !existing,
    taskId: task.id,
  };
}

