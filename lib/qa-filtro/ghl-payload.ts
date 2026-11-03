import {
  QA_GHL_FIELD_IDS,
  QA_GHL_REVENUE_VALUES,
} from './ghl-fields.ts';
import {
  QA_BUSINESS_LABELS,
  QA_PLATFORM_LABELS,
  QA_SELLING_LABELS,
} from './labels.ts';
import type { QaCalifTag, QaFiltroAnswers, QaRevenue, QaThirdParty } from './types.ts';

export const QA_FILTRO_GHL_DRY_RUN_REASON = [
  'La ruta compartida del formulario web (/api/contact → syncWebsiteLeadToHighLevel) no se usa en este preview porque,',
  'además del upsert del contacto, crea oportunidades en pipeline, tareas SLA, etiquetas fit/model y escribe',
  'campos de atribución/UTM en el contacto y la oportunidad.',
  'En QA filtro solo se construye y muestra el payload de contacto (campos calif_* + etiquetas qa-interno y calif-*).',
  'No se envía nada a HighLevel hasta disponer de una ruta que haga únicamente upsert de contacto.',
].join(' ');

export interface QaFiltroGhlContactPayload {
  upsertContact: {
    name: string;
    email: string;
    tags: string[];
    customFields: Array<{ id: string; key: string; fieldValue: string }>;
  };
  wouldNotSend: typeof QA_FILTRO_GHL_DRY_RUN_REASON;
}

function revenuePayloadValue(revenue: QaRevenue): string {
  return QA_GHL_REVENUE_VALUES[revenue];
}

function thirdPartyPayloadValue(thirdParty: QaThirdParty): string {
  return thirdParty === 'si' ? 'sí' : 'no';
}

export function buildQaFiltroGhlContactPayload(
  answers: QaFiltroAnswers,
  califTag: QaCalifTag,
): QaFiltroGhlContactPayload {
  const customFields: QaFiltroGhlContactPayload['upsertContact']['customFields'] = [
    {
      id: QA_GHL_FIELD_IDS.calif_vende,
      key: 'calif_vende',
      fieldValue: QA_SELLING_LABELS[answers.selling],
    },
    {
      id: QA_GHL_FIELD_IDS.calif_plataforma,
      key: 'calif_plataforma',
      fieldValue: QA_PLATFORM_LABELS[answers.platform],
    },
    {
      id: QA_GHL_FIELD_IDS.calif_facturacion_online,
      key: 'contact.calif_facturacion_online',
      fieldValue: revenuePayloadValue(answers.revenueOnline),
    },
    {
      id: QA_GHL_FIELD_IDS.calif_facturacion_otros_canales,
      key: 'contact.calif_facturacion_otros_canales',
      fieldValue: revenuePayloadValue(answers.revenueOtherChannels),
    },
    {
      id: QA_GHL_FIELD_IDS.calif_tipo_negocio,
      key: 'calif_tipo_negocio',
      fieldValue: QA_BUSINESS_LABELS[answers.businessType],
    },
    {
      id: QA_GHL_FIELD_IDS.calif_otros_canales,
      key: 'calif_otros_canales',
      fieldValue: thirdPartyPayloadValue(answers.thirdParty),
    },
  ];

  if (answers.team?.trim()) {
    customFields.push({
      id: QA_GHL_FIELD_IDS.calif_equipo,
      key: 'calif_equipo',
      fieldValue: answers.team.trim(),
    });
  }

  return {
    upsertContact: {
      name: answers.name,
      email: answers.email,
      tags: ['qa-interno', califTag],
      customFields,
    },
    wouldNotSend: QA_FILTRO_GHL_DRY_RUN_REASON,
  };
}
