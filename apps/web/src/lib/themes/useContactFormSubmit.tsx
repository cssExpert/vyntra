"use client";

import { useCallback, useRef, useState } from "react";
import Script from "next/script";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

export interface ContactFormValues {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const EMPTY_VALUES: ContactFormValues = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

/**
 * Shared submit logic for the storefront "Contact Form" / "Contact Form + Info"
 * blocks (common + shopingo theme variants). `orgId` is undefined in the
 * editor's preview canvas, in which case submission is a no-op — the block
 * stays visually present but inert there.
 */
export function useContactFormSubmit(orgId: string | undefined) {
  const [values, setValues] = useState<ContactFormValues>(EMPTY_VALUES);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recaptchaReady = useRef(false);

  const captchaActive = !!RECAPTCHA_SITE_KEY;

  const setField = useCallback(
    (key: keyof ContactFormValues, value: string) => {
      setValues((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const getCaptchaToken = useCallback(async (): Promise<string | undefined> => {
    if (!captchaActive || !recaptchaReady.current || !window.grecaptcha) return undefined;
    return new Promise((resolve) => {
      window.grecaptcha!.ready(() => {
        window
          .grecaptcha!.execute(RECAPTCHA_SITE_KEY!, { action: "contact_submit" })
          .then(resolve)
          .catch(() => resolve(undefined));
      });
    });
  }, [captchaActive]);

  const handleSubmit = useCallback(
    async (e?: { preventDefault?: () => void }) => {
      e?.preventDefault?.();
      if (!orgId) return;
      if (!values.name.trim() || !values.email.trim() || !values.message.trim()) {
        setError("Please fill in your name, email, and message.");
        return;
      }

      setSubmitting(true);
      setError(null);
      try {
        const captchaToken = await getCaptchaToken();
        const res = await fetch(`${API}/public/sites/${orgId}/contact/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: values.name,
            email: values.email,
            phone: values.phone || undefined,
            subject: values.subject || undefined,
            message: values.message,
            captchaToken,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error((err as { message?: string }).message || "Submission failed");
        }
        setSubmitted(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
    [orgId, values, getCaptchaToken],
  );

  const reset = useCallback(() => {
    setValues(EMPTY_VALUES);
    setSubmitted(false);
    setError(null);
  }, []);

  return {
    values,
    setField,
    submitting,
    submitted,
    error,
    handleSubmit,
    reset,
    captchaActive,
    recaptchaSiteKey: RECAPTCHA_SITE_KEY,
    markRecaptchaReady: () => {
      recaptchaReady.current = true;
    },
  };
}

export function ContactRecaptchaScript({
  active,
  siteKey,
  onReady,
}: {
  active: boolean;
  siteKey?: string;
  onReady: () => void;
}) {
  if (!active || !siteKey) return null;
  return (
    <Script
      src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`}
      strategy="afterInteractive"
      onLoad={onReady}
    />
  );
}
