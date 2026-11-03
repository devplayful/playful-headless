import { SubmissionValidationError } from '../contact/normalize.ts';
import {
  QA_BUSINESS_TYPE_OPTIONS,
  QA_PLATFORM_OPTIONS,
  QA_REVENUE_OPTIONS,
  QA_SELLING_OPTIONS,
  QA_THIRD_PARTY_OPTIONS,
  type QaFiltroAnswers,
  type QaRevenue,
} from './types.ts';

function text(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

function required(value: unknown, field: string, max = 200): string {
  const normalized = text(value, max);
  if (!normalized) throw new SubmissionValidationError(`Falta el campo requerido: ${field}.`);
  return normalized;
}

function option<T extends string>(value: unknown, field: string, allowed: readonly T[]): T {
  const normalized = required(value, field, 80);
  if (!(allowed as readonly string[]).includes(normalized)) {
    throw new SubmissionValidationError(`El campo ${field} no contiene una opción válida.`);
  }
  return normalized as T;
}

function optionalRevenue(value: unknown): QaRevenue | '' {
  if (value === undefined || value === null || value === '') return '';
  return option<QaRevenue>(value, 'revenue', QA_REVENUE_OPTIONS);
}

export function parseQaFiltroSubmission(value: unknown): QaFiltroAnswers {
  if (!value || typeof value !== 'object') {
    throw new SubmissionValidationError('El cuerpo del formulario no es válido.');
  }
  const input = value as Record<string, unknown>;
  if (input.privacyConsent !== true) {
    throw new SubmissionValidationError('Debes aceptar la Política de Privacidad.');
  }

  const email = required(input.email, 'email', 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new SubmissionValidationError('El correo electrónico no es válido.');
  }

  return {
    name: required(input.name, 'name', 120),
    email,
    selling: option(input.selling, 'selling', QA_SELLING_OPTIONS),
    platform: option(input.platform, 'platform', QA_PLATFORM_OPTIONS),
    revenue: optionalRevenue(input.revenue),
    businessType: option(input.businessType, 'businessType', QA_BUSINESS_TYPE_OPTIONS),
    thirdParty: option(input.thirdParty, 'thirdParty', QA_THIRD_PARTY_OPTIONS),
    team: text(input.team, 250),
  };
}
