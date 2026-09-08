import { createHash } from 'node:crypto';
import {
  type CrmSyncControl,
  RetainResourceLeaseError,
} from '../contact/orchestrator.ts';
import type { WebsiteLead } from '../contact/types.ts';
import type {
  EnabledHighLevelConfig,
  HighLevelCustomFieldKey,
  HighLevelOpportunityCustomFieldKey,
} from './config.ts';
import type {
  HighLevelCustomFieldValue,
  HighLevelGateway,
  HighLevelOpportunity,
} from './client.ts';
import { HighLevelApiError } from './client.ts';

export class AmbiguousOpportunityError extends Error {
  constructor(public readonly count: number) {
    super(`El contacto ya tiene ${count} oportunidades abiertas en el pipeline canónico.`);
    this.name = 'AmbiguousOpportunityError';
  }
}

export interface CrmSyncResult {
  contactId: string;
  opportunityId?: string;
  opportunityCreated?: boolean;
  taskId?: string;
}

export interface CrmSyncOptions {
  /** Avoid an extra CRM side effect during the one-contact production canary. */
  skipSlaTask?: boolean;
}

export type QualificationLevel = 'priority' | 'transition' | 'review';

export function qualificationLevel(lead: WebsiteLead): QualificationLevel {
  const qualification = lead.qualification;
  const isDecisionMaker = qualification.decisionRole === 'owner'
    || qualification.decisionRole === 'decision_lead';
  const isNearTerm = qualification.projectTiming === '0_30_days'
    || qualification.projectTiming === '1_3_months';
  const isDirectCommerce = qualification.salesModel === 'd2c'
    || qualification.salesModel === 'd2c_b2b'
    || qualification.salesModel === 'marketplace_to_d2c';

  if (isDecisionMaker && isNearTerm && isDirectCommerce
    && qualification.monthlyRevenue === 'over_100k') return 'priority';
  if (['amazon', 'mercado_libre', 'marketplaces_other', 'marketplace_to_d2c', 'pre_d2c']
    .includes(qualification.salesModel)) return 'transition';
  return 'review';
}

function field(
  config: EnabledHighLevelConfig,
  key: HighLevelCustomFieldKey,
  value: string | boolean,
): HighLevelCustomFieldValue {
  return { id: config.customFieldIds[key], fieldValue: String(value) };
}

function opportunityField(
  config: EnabledHighLevelConfig,
  key: HighLevelOpportunityCustomFieldKey,
  value: string,
): HighLevelCustomFieldValue {
  return { id: config.opportunityCustomFieldIds[key], fieldValue: value };
}

const DECISION_ROLE_LABELS = {
  owner: 'Dueño/a, socio/a o cofundador/a',
  decision_lead: 'Lidera e-commerce, marketing u operaciones y participa en la decisión',
  researching_for_other: 'Investiga para otra persona o equipo',
  other: 'Otro',
} as const;

const SALES_MODEL_LABELS = {
  d2c: 'Principalmente D2C',
  d2c_b2b: 'D2C y B2B',
  amazon: 'Marketplace: Amazon',
  mercado_libre: 'Marketplace: Mercado Libre',
  marketplaces_other: 'Otros marketplaces',
  marketplace_to_d2c: 'Marketplace con intención de dar el salto a venta directa',
  pre_d2c: 'Preparando venta D2C',
  not_online_or_unsure: 'No vende D2C o no está seguro',
  other: 'Otro',
} as const;

const MONTHLY_REVENUE_LABELS = {
  over_100k: 'Más de US$100.000',
  '50k_100k': 'US$50.000–100.000',
  '10k_50k': 'US$10.000–50.000',
  under_10k: 'Menos de US$10.000',
  prefer_not_to_say: 'Prefiere no compartirlo',
  other: 'Otro',
} as const;

const PROJECT_TIMING_LABELS = {
  '0_30_days': 'Próximos 30 días',
  '1_3_months': 'Próximos 1–3 meses',
  evaluating: 'Evaluando opciones',
  researching: 'Solo investigando',
  other: 'Otro',
} as const;

function clarified(label: string, detail: string): string {
  return detail.trim() ? `${label}: ${detail.trim()}` : label;
}

function opportunityFields(
  lead: WebsiteLead,
  config: EnabledHighLevelConfig,
): HighLevelCustomFieldValue[] {
  const qualification = lead.qualification;
  const fit = qualificationLevel(lead);
  const marketplace = qualification.secondaryMarketplaces.trim()
    || (['amazon', 'mercado_libre', 'marketplaces_other', 'marketplace_to_d2c']
      .includes(qualification.salesModel)
      ? SALES_MODEL_LABELS[qualification.salesModel]
      : '');

  return [
    opportunityField(config, 'decision_role', clarified(
      DECISION_ROLE_LABELS[qualification.decisionRole],
      qualification.decisionRoleOther,
    )),
    opportunityField(config, 'sales_model', clarified(
      SALES_MODEL_LABELS[qualification.salesModel],
      qualification.salesModelOther,
    )),
    opportunityField(config, 'marketplaces', marketplace),
    opportunityField(config, 'monthly_revenue', clarified(
      MONTHLY_REVENUE_LABELS[qualification.monthlyRevenue],
      qualification.monthlyRevenueOther,
    )),
    opportunityField(config, 'project_timing', clarified(
      PROJECT_TIMING_LABELS[qualification.projectTiming],
      qualification.projectTimingOther,
    )),
    opportunityField(config, 'qualification_level', {
      priority: 'Prioritario',
      transition: 'Transición a D2C',
      review: 'Revisar',
    }[fit]),
    opportunityField(config, 'project_context', lead.message),
  ];
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
    field(config, 'decision_role', lead.qualification.decisionRole),
    field(config, 'decision_role_other', lead.qualification.decisionRoleOther),
    field(config, 'sales_model', lead.qualification.salesModel),
    field(config, 'sales_model_other', lead.qualification.salesModelOther),
    field(config, 'secondary_marketplaces', lead.qualification.secondaryMarketplaces),
    field(config, 'monthly_revenue', lead.qualification.monthlyRevenue),
    field(config, 'monthly_revenue_other', lead.qualification.monthlyRevenueOther),
    field(config, 'project_timing', lead.qualification.projectTiming),
    field(config, 'project_timing_other', lead.qualification.projectTimingOther),
    field(config, 'qualification_level', qualificationLevel(lead)),
    field(config, 'project_context', lead.message),
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

function isDeterministicWriteFailure(error: unknown): boolean {
  return error instanceof HighLevelApiError && error.status >= 400 && error.status < 500;
}

function retainLeaseForUncertainWrite(error: unknown): never {
  if (isDeterministicWriteFailure(error)) throw error;
  throw new RetainResourceLeaseError(error);
}

function localControl(lead: WebsiteLead): CrmSyncControl {
  const progress: CrmSyncControl['progress'] = {};
  return {
    submissionKey: createHash('sha256').update(lead.submissionId).digest('hex'),
    progress,
    checkpoint: async (patch) => { Object.assign(progress, patch); },
    withResourceLease: async (_resource, operation) => operation(),
  };
}

export async function syncWebsiteLeadToHighLevel(
  lead: WebsiteLead,
  gateway: HighLevelGateway,
  config: EnabledHighLevelConfig,
  now = new Date(),
  suppliedControl?: CrmSyncControl,
  options: CrmSyncOptions = {},
): Promise<CrmSyncResult> {
  const control = suppliedControl || localControl(lead);
  const fit = qualificationLevel(lead);
  let contactId = control.progress.contactId;

  if (!contactId) {
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
    contactId = contact.id;
    await control.checkpoint({ contactId });
  }

  if (!control.progress.originalAttributionCompleted) {
    await control.withResourceLease(
      `original-attribution:${config.locationId}:${contactId}`,
      async () => {
        const currentFields = await gateway.getContactCustomFields(contactId);
        const values = new Map(currentFields.map((item) => [item.id, item.fieldValue]));
        const missingOriginalFields = originalFields(lead, config).filter((item) => (
          item.fieldValue.trim() !== '' && !(values.get(item.id) || '').trim()
        ));
        let wroteOriginalFields = false;
        if (missingOriginalFields.length > 0) {
          try {
            await gateway.updateContactCustomFields(contactId, missingOriginalFields);
            wroteOriginalFields = true;
          } catch (error) {
            retainLeaseForUncertainWrite(error);
          }
        }
        try {
          await control.checkpoint({ originalAttributionCompleted: true });
        } catch (error) {
          if (wroteOriginalFields) throw new RetainResourceLeaseError(error);
          throw error;
        }
      },
    );
  }

  if (!control.progress.tagsCompleted) {
    await gateway.addContactTags(contactId, [
      config.contactTag,
      `fit:${fit}`,
      `model:${lead.qualification.salesModel}`,
    ]);
    await control.checkpoint({ tagsCompleted: true });
  }

  if (fit !== 'priority') {
    return { contactId, opportunityCreated: false };
  }

  let opportunityId = control.progress.opportunityId;
  let opportunityCreated = control.progress.opportunityCreated;
  if (!opportunityId) {
    await control.withResourceLease(
      `opportunity:${config.locationId}:${config.pipelineId}:${contactId}`,
      async () => {
        const existing = selectOrReject(await gateway.findOpenOpportunities(
          config.locationId,
          config.pipelineId,
          contactId,
        ));
        let resolvedOpportunityId: string;
        let createdRemotely = false;
        if (existing) {
          resolvedOpportunityId = existing.id;
          try {
            await gateway.updateOpportunityCustomFields(
              resolvedOpportunityId,
              opportunityFields(lead, config),
            );
          } catch (error) {
            retainLeaseForUncertainWrite(error);
          }
        } else {
          try {
            const created = await gateway.createOpportunity({
              pipelineId: config.pipelineId,
              locationId: config.locationId,
              name: `${lead.business || lead.name} — consulta web`,
              pipelineStageId: config.consultaStageId,
              status: 'open',
              contactId,
              assignedTo: config.ownerId,
              customFields: opportunityFields(lead, config),
            });
            resolvedOpportunityId = created.id;
            createdRemotely = true;
          } catch (error) {
            retainLeaseForUncertainWrite(error);
          }
        }
        opportunityId = resolvedOpportunityId;
        opportunityCreated = !existing;
        try {
          await control.checkpoint({ opportunityId, opportunityCreated });
        } catch (error) {
          if (createdRemotely) throw new RetainResourceLeaseError(error);
          throw error;
        }
      },
    );
  }

  if (options.skipSlaTask) {
    return { contactId, opportunityId, opportunityCreated };
  }

  let taskId = control.progress.taskId;
  if (!taskId) {
    const taskMarker = `[playful-submission:${control.submissionKey}]`;
    await control.withResourceLease(`task:${contactId}:${control.submissionKey}`, async () => {
      const existing = (await gateway.findTasks(contactId)).find((task) => (
        (task.body || '').includes(taskMarker)
      ));
      let createdRemotely = false;
      if (existing) {
        taskId = existing.id;
      } else {
        const dueDate = new Date(now.getTime() + config.slaHours * 60 * 60 * 1000).toISOString();
        let task;
        try {
          task = await gateway.createTask(contactId, {
            title: 'Responder consulta web',
            body: `Siguiente acción del formulario ${lead.recentAttribution.formId}. ${taskMarker}`,
            dueDate,
            completed: false,
            assignedTo: config.ownerId,
          });
          createdRemotely = true;
        } catch (error) {
          retainLeaseForUncertainWrite(error);
        }
        taskId = task.id;
      }
      try {
        await control.checkpoint({ taskId });
      } catch (error) {
        if (createdRemotely) throw new RetainResourceLeaseError(error);
        throw error;
      }
    });
  }

  if (!opportunityId || opportunityCreated === undefined || !taskId) {
    throw new Error('El flujo CRM terminó sin checkpoints obligatorios.');
  }

  return { contactId, opportunityId, opportunityCreated, taskId };
}
