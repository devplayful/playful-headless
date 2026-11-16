'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { getOrCreateSubmissionId } from '@/lib/contact/client-attribution';
import type { QaFiltroGhlContactPayload } from '@/lib/qa-filtro/ghl-payload';
import {
  QA_BUSINESS_TYPE_OPTIONS,
  QA_PLATFORM_OPTIONS,
  QA_REVENUE_OPTIONS,
  QA_SELLING_OPTIONS,
  QA_THIRD_PARTY_OPTIONS,
  type QaFiltroOutcome,
} from '@/lib/qa-filtro/types';
import {
  QA_BUSINESS_LABELS,
  QA_PLATFORM_LABELS,
  QA_REVENUE_LABELS,
  QA_SELLING_LABELS,
  QA_THIRD_PARTY_LABELS,
} from '@/lib/qa-filtro/labels';
import { QA_FILTRO_BLOG_GUIDE_HREF } from '@/lib/qa-filtro/constants';
import QaFiltroCalendar from './QaFiltroCalendar';

type Step = 'form' | 'result';

interface ApiResponse {
  success: boolean;
  message?: string;
  outcome?: QaFiltroOutcome;
  califTag?: string;
  ghlDryRun?: boolean;
  ghlPayload?: QaFiltroGhlContactPayload;
}

const EMPTY = {
  name: '',
  email: '',
  selling: '',
  platform: '',
  revenueOnline: '',
  revenueOtherChannels: '',
  businessType: '',
  thirdParty: '',
  team: '',
};

const QA_CALENDAR_INTRO =
  'Esto es una solicitud, no una reunión confirmada. Revisamos tus respuestas y te confirmamos solo si de verdad podemos ayudarte.';

function GhlDryRunPanel({ payload }: { payload: QaFiltroGhlContactPayload }) {
  return (
    <aside
      className="rounded border border-amber-300 bg-amber-50 p-4 text-sm space-y-2"
      data-qa-ghl-dry-run="true"
    >
      <p className="font-medium text-amber-900">Modo dry-run GHL (sin envío)</p>
      <p className="text-amber-900/90">{payload.wouldNotSend}</p>
      <pre className="qa-filtro-dry-run-json rounded bg-white p-2 text-xs text-neutral-800">
        {JSON.stringify(payload.upsertContact, null, 2)}
      </pre>
    </aside>
  );
}

export default function QaFiltroReunionClient({ calendarId }: { calendarId: string }) {
  return (
    <Suspense fallback={null}>
      <QaFiltroReunionClientInner calendarId={calendarId} />
    </Suspense>
  );
}

function QaFiltroReunionClientInner({ calendarId }: { calendarId: string }) {
  const searchParams = useSearchParams();
  const showDryRunPanel = searchParams.get('panel') !== '0';
  const [form, setForm] = useState(EMPTY);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [step, setStep] = useState<Step>('form');
  const [outcome, setOutcome] = useState<QaFiltroOutcome | null>(null);
  const [ghlPayload, setGhlPayload] = useState<QaFiltroGhlContactPayload | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const submissionIdRef = useMemo(() => ({ current: '' }), []);

  useEffect(() => {
    submissionIdRef.current = getOrCreateSubmissionId();
  }, [submissionIdRef]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const response = await fetch('/api/qa-filtro-reunion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          privacyConsent,
          submissionId: submissionIdRef.current || getOrCreateSubmissionId(),
        }),
      });
      const payload = (await response.json()) as ApiResponse;
      if (!response.ok || !payload.success || !payload.outcome) {
        throw new Error(payload.message || 'No se pudo enviar el formulario.');
      }
      setOutcome(payload.outcome);
      setGhlPayload(payload.ghlPayload || null);
      setStep('result');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Error al enviar.');
    } finally {
      setSubmitting(false);
    }
  }

  const dryRunPanel = showDryRunPanel && ghlPayload
    ? <GhlDryRunPanel payload={ghlPayload} />
    : null;

  if (step === 'result' && outcome) {
    if (outcome === 'rejected') {
      return (
        <div className="mx-auto max-w-xl px-4 py-10 space-y-4" data-qa-outcome="rejected" data-qa-filtro-content>
          <p>
            Gracias por contarnos tu proyecto. Ahora mismo no es el momento para una reunión, pero te
            dejamos una guía para tu etapa y puedes apuntarte a nuestro newsletter.
          </p>
          <p>
            <Link className="text-[#6B2C91] underline" href={QA_FILTRO_BLOG_GUIDE_HREF}>
              Guía para hacer marketing digital
            </Link>
          </p>
          {dryRunPanel}
        </div>
      );
    }

    if (outcome === 'review') {
      return (
        <div className="mx-auto max-w-xl px-4 py-10 space-y-4" data-qa-outcome="review" data-qa-filtro-content>
          <p>Te escribimos en 1 día laborable.</p>
          {dryRunPanel}
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-3xl px-4 pb-10 space-y-6" data-qa-outcome="qualified" data-qa-filtro-content>
        <p className="text-[15px] leading-relaxed">{QA_CALENDAR_INTRO}</p>
        {dryRunPanel}
        <div data-qa-calendar-wrap>
          <QaFiltroCalendar calendarId={calendarId} />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10" data-qa-filtro-content>
      <p className="mb-6 text-[15px] leading-relaxed">
        {QA_CALENDAR_INTRO}
      </p>
      <form className="space-y-5" onSubmit={handleSubmit} data-qa-step="form">
        <label className="block space-y-1">
          <span className="text-sm font-medium">Nombre</span>
          <input
            required
            className="w-full rounded border border-neutral-300 px-3 py-2"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Email</span>
          <input
            required
            type="email"
            className="w-full rounded border border-neutral-300 px-3 py-2"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">¿Ya vendes?</legend>
          {QA_SELLING_OPTIONS.map((value) => (
            <label key={value} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="selling"
                required
                value={value}
                checked={form.selling === value}
                onChange={() => setForm({ ...form, selling: value })}
              />
              {QA_SELLING_LABELS[value]}
            </label>
          ))}
        </fieldset>

        <label className="block space-y-1">
          <span className="text-sm font-medium">Plataforma</span>
          <select
            required
            className="w-full rounded border border-neutral-300 px-3 py-2"
            value={form.platform}
            onChange={(e) => setForm({ ...form, platform: e.target.value })}
          >
            <option value="">Selecciona…</option>
            {QA_PLATFORM_OPTIONS.map((value) => (
              <option key={value} value={value}>{QA_PLATFORM_LABELS[value]}</option>
            ))}
          </select>
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium">Facturación mensual de la tienda online (USD)</span>
          <select
            required
            name="revenueOnline"
            className="w-full rounded border border-neutral-300 px-3 py-2"
            value={form.revenueOnline}
            onChange={(e) => setForm({ ...form, revenueOnline: e.target.value })}
          >
            <option value="">Selecciona…</option>
            {QA_REVENUE_OPTIONS.map((value) => (
              <option key={value} value={value}>{QA_REVENUE_LABELS[value]}</option>
            ))}
          </select>
        </label>

        <label className="block space-y-1">
          <span className="text-sm font-medium">
            Facturación mensual del resto de canales (tiendas físicas, distribuidores, retail) (USD)
          </span>
          <select
            required
            name="revenueOtherChannels"
            className="w-full rounded border border-neutral-300 px-3 py-2"
            value={form.revenueOtherChannels}
            onChange={(e) => setForm({ ...form, revenueOtherChannels: e.target.value })}
          >
            <option value="">Selecciona…</option>
            {QA_REVENUE_OPTIONS.map((value) => (
              <option key={value} value={value}>{QA_REVENUE_LABELS[value]}</option>
            ))}
          </select>
        </label>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Tipo de negocio</legend>
          {QA_BUSINESS_TYPE_OPTIONS.map((value) => (
            <label key={value} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="businessType"
                required
                value={value}
                checked={form.businessType === value}
                onChange={() => setForm({ ...form, businessType: value })}
              />
              {QA_BUSINESS_LABELS[value]}
            </label>
          ))}
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">
            ¿Vendes también en tiendas de terceros o distribuidores?
          </legend>
          {QA_THIRD_PARTY_OPTIONS.map((value) => (
            <label key={value} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="thirdParty"
                required
                value={value}
                checked={form.thirdParty === value}
                onChange={() => setForm({ ...form, thirdParty: value })}
              />
              {QA_THIRD_PARTY_LABELS[value]}
            </label>
          ))}
        </fieldset>

        <label className="block space-y-1">
          <span className="text-sm font-medium">
            ¿Tienes equipo propio dedicado a la tienda? (opcional, solo informativa)
          </span>
          <input
            className="w-full rounded border border-neutral-300 px-3 py-2"
            value={form.team}
            onChange={(e) => setForm({ ...form, team: e.target.value })}
          />
        </label>

        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            required
            checked={privacyConsent}
            onChange={(e) => setPrivacyConsent(e.target.checked)}
          />
          <span>
            Acepto la{' '}
            <Link className="underline" href="/politica-de-privacidad">
              Política de Privacidad
            </Link>
            .
          </span>
        </label>

        {error ? <p className="text-sm text-red-700" role="alert">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="rounded bg-[#6B2C91] px-4 py-2 text-white disabled:opacity-60"
        >
          {submitting ? 'Enviando…' : 'Continuar'}
        </button>
      </form>
    </div>
  );
}
