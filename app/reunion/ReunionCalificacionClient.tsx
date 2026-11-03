'use client';

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import {
  getOrCreateSubmissionId,
  getSubmissionAttribution,
} from '@/lib/contact/client-attribution';
import { FILTRO_REUNION_BLOG_GUIDE_HREF } from '@/lib/filtro-reunion/copy';
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
import ReunionCalendarEmbed from './ReunionCalendarEmbed';

type Step = 'form' | 'result';

interface ApiResponse {
  success: boolean;
  message?: string;
  outcome?: QaFiltroOutcome;
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

const CALENDAR_INTRO =
  'Esto es una solicitud, no una reunión confirmada. Revisamos tus respuestas y te confirmamos solo si de verdad podemos ayudarte.';

export default function ReunionCalificacionClient() {
  return (
    <Suspense fallback={null}>
      <ReunionCalificacionClientInner />
    </Suspense>
  );
}

function ReunionCalificacionClientInner() {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  const [form, setForm] = useState(EMPTY);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [step, setStep] = useState<Step>('form');
  const [outcome, setOutcome] = useState<QaFiltroOutcome | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const submissionIdRef = useMemo(() => ({ current: '' }), []);

  useEffect(() => {
    submissionIdRef.current = getOrCreateSubmissionId();
    getSubmissionAttribution();
  }, [submissionIdRef]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    const recaptchaToken = recaptchaSiteKey ? recaptchaRef.current?.getValue() : undefined;
    if (recaptchaSiteKey && !recaptchaToken) {
      setError('Por favor, completa la verificación de seguridad.');
      return;
    }

    setSubmitting(true);
    try {
      const { originalAttribution, recentAttribution } = getSubmissionAttribution();
      const response = await fetch('/api/calificacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          privacyConsent,
          submissionId: submissionIdRef.current || getOrCreateSubmissionId(),
          originalAttribution,
          recentAttribution,
          recaptchaToken,
        }),
      });
      const payload = (await response.json()) as ApiResponse;
      if (!response.ok || !payload.success || !payload.outcome) {
        throw new Error(payload.message || 'No se pudo enviar el formulario.');
      }
      setOutcome(payload.outcome);
      setStep('result');
      recaptchaRef.current?.reset();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Error al enviar.');
      recaptchaRef.current?.reset();
    } finally {
      setSubmitting(false);
    }
  }

  if (step === 'result' && outcome) {
    if (outcome === 'rejected') {
      return (
        <div className="mx-auto max-w-xl px-4 py-10 space-y-4" data-reunion-outcome="rejected">
          <p>
            Gracias por contarnos tu proyecto. Ahora mismo no es el momento para una reunión, pero te
            dejamos una guía para tu etapa y puedes apuntarte a nuestro newsletter.
          </p>
          <p>
            <Link className="text-[#6B2C91] underline" href={FILTRO_REUNION_BLOG_GUIDE_HREF}>
              Guía para hacer marketing digital
            </Link>
          </p>
        </div>
      );
    }

    if (outcome === 'review') {
      return (
        <div className="mx-auto max-w-xl px-4 py-10 space-y-4" data-reunion-outcome="review">
          <p>Te escribimos en 1 día laborable.</p>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-3xl px-4 pb-10 space-y-6" data-reunion-outcome="qualified">
        <p className="text-[15px] leading-relaxed">{CALENDAR_INTRO}</p>
        <ReunionCalendarEmbed />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10" style={{ paddingTop: '7rem' }}>
      <p className="mb-6 text-[15px] leading-relaxed">{CALENDAR_INTRO}</p>
      <form className="space-y-5" onSubmit={handleSubmit}>
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

        {!recaptchaSiteKey ? null : (
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={recaptchaSiteKey}
          />
        )}

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
