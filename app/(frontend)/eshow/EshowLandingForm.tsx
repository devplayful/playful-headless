'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useId, useRef, useState } from 'react';
import { getSubmissionAttribution } from '@/lib/contact/client-attribution';
import { pushGenerateLead } from '@/lib/contact/analytics';
import {
  ESHOW_LANDING_ARTICLE,
  ESHOW_LANDING_FORM,
  ESHOW_LANDING_INTRO_PARAGRAPHS,
  ESHOW_LANDING_PRIVACY_URL,
} from '@/lib/eshow-landing-copy';
import { ESHOW_MADRID_2026_CABECERA_ALT, ESHOW_MADRID_2026_CABECERA_SRC } from '@/lib/eshow-madrid-2026';

type FieldErrors = Partial<Record<'email', string>>;

const EMPTY = { name: '', email: '', consent: false };

export default function EshowLandingForm() {
  const nameId = useId();
  const emailId = useId();
  const consentId = useId();
  const emailErrorId = `${emailId}-error`;
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const focusFirstInvalid = () => {
    if (!form.name.trim()) {
      nameRef.current?.focus();
      return;
    }
    if (
      !form.email.trim()
      || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      emailRef.current?.focus();
      return;
    }
    if (!form.consent) consentRef.current?.focus();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');
    setErrors({});

    if (!form.name.trim() || !form.consent) {
      focusFirstInvalid();
      return;
    }

    const email = form.email.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: ESHOW_LANDING_FORM.emailValidationError });
      emailRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const attribution = getSubmissionAttribution();
      const response = await fetch('/api/eshow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email,
          consent: true,
          originalAttribution: attribution.originalAttribution,
          recentAttribution: attribution.recentAttribution,
        }),
      });
      const payload = await response.json() as {
        success?: boolean;
        message?: string;
        errors?: FieldErrors;
        analytics?: { generateLead?: boolean; formId?: string };
      };
      if (!response.ok || !payload.success) {
        if (payload.errors?.email) {
          setErrors(payload.errors);
          emailRef.current?.focus();
        } else {
          setFormError(payload.message || ESHOW_LANDING_FORM.submitError);
        }
        return;
      }
      if (payload.analytics?.generateLead === true && typeof payload.analytics.formId === 'string') {
        await pushGenerateLead(payload.analytics.formId);
      }
      window.location.assign('/eshow/gracias');
    } catch {
      setFormError(ESHOW_LANDING_FORM.submitError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-[#D8C8F0] bg-[#F7F2FF] p-6 md:p-8"
      aria-describedby={formError ? 'eshow-landing-form-error' : undefined}
    >
      {formError ? (
        <p id="eshow-landing-form-error" className="mb-4 text-red-700" role="alert">
          {formError}
        </p>
      ) : null}

      <div className="space-y-5">
        <div>
          <label htmlFor={nameId} className="mb-1 block font-semibold text-[#2A0064]">
            {ESHOW_LANDING_FORM.nameLabel}
          </label>
          <input
            ref={nameRef}
            id={nameId}
            name="name"
            type="text"
            autoComplete="name"
            placeholder={ESHOW_LANDING_FORM.namePlaceholder}
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-[#440099] focus:outline-none focus:ring-2 focus:ring-[#440099]"
          />
        </div>

        <div>
          <label htmlFor={emailId} className="mb-1 block font-semibold text-[#2A0064]">
            {ESHOW_LANDING_FORM.emailLabel}
          </label>
          <input
            ref={emailRef}
            id={emailId}
            name="email"
            type="email"
            autoComplete="email"
            placeholder={ESHOW_LANDING_FORM.emailPlaceholder}
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
              required
              className="mt-1 h-4 w-4 rounded border-gray-300 text-[#440099] focus:ring-2 focus:ring-[#440099]"
            />
            <label htmlFor={consentId} className="leading-relaxed text-gray-700">
              {ESHOW_LANDING_FORM.consentBeforeLink}
              <Link href={ESHOW_LANDING_PRIVACY_URL} className="text-[#440099] underline">
                {ESHOW_LANDING_FORM.consentLinkText}
              </Link>
              {ESHOW_LANDING_FORM.consentAfterLink}
            </label>
          </div>
        </div>

        <p className="text-sm text-[#453A53]">{ESHOW_LANDING_FORM.privacyLine}</p>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-[#440099] px-6 py-3 font-semibold text-white hover:bg-[#5500BB] focus:outline-none focus:ring-2 focus:ring-[#440099] focus:ring-offset-2 disabled:opacity-60 sm:w-auto"
        >
          {ESHOW_LANDING_FORM.submit}
        </button>
      </div>
    </form>
  );
}

export function EshowLandingArticleLink({ className = '' }: { className?: string }) {
  return (
    <p className={className}>
      <Link
        href={ESHOW_LANDING_ARTICLE.href}
        className="font-semibold text-[#440099] underline underline-offset-2 hover:text-[#5500BB]"
      >
        {ESHOW_LANDING_ARTICLE.text}
      </Link>
    </p>
  );
}

export function EshowLandingHeroImage() {
  return (
    <div className="flex min-h-[18rem] items-center justify-center rounded-2xl bg-[#eaddff] p-5 md:min-h-[22rem]">
      <Image
        src={ESHOW_MADRID_2026_CABECERA_SRC}
        alt={ESHOW_MADRID_2026_CABECERA_ALT}
        width={400}
        height={533}
        className="h-auto max-h-[88%] w-auto max-w-full object-contain"
        priority
      />
    </div>
  );
}

export function EshowLandingIntro() {
  return (
    <div className="space-y-4 text-gray-800 leading-relaxed">
      {ESHOW_LANDING_INTRO_PARAGRAPHS.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  );
}
