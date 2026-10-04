'use client';

import { useId, useRef, useState } from 'react';
import { getSubmissionAttribution } from '@/lib/contact/client-attribution';
import { ESHOW_LISTA_ERRORS } from '@/lib/eshow-lista';

type FieldErrors = Partial<Record<'name' | 'email' | 'consent', string>>;

const EMPTY = { name: '', email: '', consent: false };

export default function EshowListaForm() {
  const nameId = useId();
  const emailId = useId();
  const consentId = useId();
  const nameErrorId = `${nameId}-error`;
  const emailErrorId = `${emailId}-error`;
  const consentErrorId = `${consentId}-error`;
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [formError, setFormError] = useState('');

  const focusFirstError = (next: FieldErrors) => {
    if (next.name) {
      nameRef.current?.focus();
      return;
    }
    if (next.email) {
      emailRef.current?.focus();
      return;
    }
    if (next.consent) consentRef.current?.focus();
  };

  const clientValidate = (): FieldErrors => {
    const next: FieldErrors = {};
    if (!form.name.trim()) next.name = ESHOW_LISTA_ERRORS.name;
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = ESHOW_LISTA_ERRORS.email;
    }
    if (!form.consent) next.consent = ESHOW_LISTA_ERRORS.consent;
    return next;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');
    const nextErrors = clientValidate();
    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.email || nextErrors.consent) {
      focusFirstError(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      const attribution = getSubmissionAttribution();
      const response = await fetch('/api/eshow-lista', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          consent: true,
          originalAttribution: attribution.originalAttribution,
          recentAttribution: attribution.recentAttribution,
        }),
      });
      const payload = await response.json() as {
        success?: boolean;
        message?: string;
        errors?: FieldErrors;
      };
      if (!response.ok || !payload.success) {
        if (payload.errors) {
          setErrors(payload.errors);
          focusFirstError(payload.errors);
        } else {
          setFormError(payload.message || 'No pudimos guardar el alta. Inténtalo de nuevo en unos minutos.');
        }
        return;
      }
      setConfirmation(payload.message || '');
    } catch {
      setFormError('No pudimos guardar el alta. Inténtalo de nuevo en unos minutos.');
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmation) {
    return (
      <div
        className="my-8 rounded-2xl border border-[#D8C8F0] bg-[#F7F2FF] p-6 md:p-8"
        role="status"
      >
        <p className="text-gray-800 leading-relaxed">{confirmation}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="my-8 rounded-2xl border border-[#D8C8F0] bg-[#F7F2FF] p-6 md:p-8"
      aria-describedby={formError ? 'eshow-lista-form-error' : undefined}
    >
      <h3 className="text-2xl font-bold text-[#2A0064] mb-2">
        Sigue el eShow Madrid 2026 con Playful
      </h3>
      <p className="text-gray-700 leading-relaxed mb-6">
        Recibe un resumen al cerrar cada día de feria, el 4 y el 5 de noviembre, y el informe del eShow cuando esté listo.
      </p>

      {formError ? (
        <p id="eshow-lista-form-error" className="mb-4 text-red-700" role="alert">
          {formError}
        </p>
      ) : null}

      <div className="space-y-5">
        <div>
          <label htmlFor={nameId} className="block font-semibold text-[#2A0064] mb-1">
            Nombre
          </label>
          <input
            ref={nameRef}
            id={nameId}
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Tu nombre"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? nameErrorId : undefined}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#440099] focus:outline-none focus:ring-2 focus:ring-[#440099]"
          />
          {errors.name ? (
            <p id={nameErrorId} className="mt-1 text-sm text-red-700" role="alert">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor={emailId} className="block font-semibold text-[#2A0064] mb-1">
            Correo electrónico
          </label>
          <input
            ref={emailRef}
            id={emailId}
            name="email"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? emailErrorId : undefined}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#440099] focus:outline-none focus:ring-2 focus:ring-[#440099]"
          />
          {errors.email ? (
            <p id={emailErrorId} className="mt-1 text-sm text-red-700" role="alert">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div>
          <div className="flex items-start gap-3">
            <input
              ref={consentRef}
              id={consentId}
              name="consent"
              type="checkbox"
              checked={form.consent}
              onChange={(event) => setForm((prev) => ({ ...prev, consent: event.target.checked }))}
              aria-invalid={Boolean(errors.consent)}
              aria-describedby={errors.consent ? consentErrorId : undefined}
              required
              className="mt-1 h-4 w-4 rounded border-gray-300 text-[#440099] focus:ring-2 focus:ring-[#440099]"
            />
            <label htmlFor={consentId} className="text-gray-700 leading-relaxed">
              Acepto recibir los correos de la lista «Sigue el eShow con Playful» y he leído la{' '}
              <a href="/politica-de-privacidad" className="text-[#440099] underline">
                política de privacidad
              </a>
              .
            </label>
          </div>
          {errors.consent ? (
            <p id={consentErrorId} className="mt-1 text-sm text-red-700" role="alert">
              {errors.consent}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-[#440099] px-6 py-3 font-semibold text-white hover:bg-[#5500BB] focus:outline-none focus:ring-2 focus:ring-[#440099] focus:ring-offset-2 disabled:opacity-60"
        >
          {submitting ? 'Enviando…' : 'Quiero seguir el eShow'}
        </button>
      </div>
    </form>
  );
}
