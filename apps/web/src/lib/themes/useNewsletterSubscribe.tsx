"use client";

import { useCallback, useRef, useState } from "react";
import { ContactRecaptchaScript } from "@/lib/themes/useContactFormSubmit";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Shared submit logic for the storefront footer's newsletter signup
 * (shopingo theme). `orgId` is undefined in the editor's preview canvas,
 * in which case submission is a no-op.
 */
export function useNewsletterSubscribe(orgId: string | undefined) {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recaptchaReady = useRef(false);

  const captchaActive = !!RECAPTCHA_SITE_KEY;

  const getCaptchaToken = useCallback(async (): Promise<string | undefined> => {
    if (!captchaActive || !recaptchaReady.current || !window.grecaptcha) return undefined;
    return new Promise((resolve) => {
      window.grecaptcha!.ready(() => {
        window
          .grecaptcha!.execute(RECAPTCHA_SITE_KEY!, { action: "newsletter_subscribe" })
          .then(resolve)
          .catch(() => resolve(undefined));
      });
    });
  }, [captchaActive]);

  const handleSubmit = useCallback(
    async (e?: { preventDefault?: () => void }) => {
      e?.preventDefault?.();
      if (!orgId) return;
      if (!EMAIL_RE.test(email.trim())) {
        setError("Please enter a valid email address.");
        return;
      }

      setSubmitting(true);
      setError(null);
      try {
        const captchaToken = await getCaptchaToken();
        const res = await fetch(`${API}/public/sites/${orgId}/newsletter/subscribe`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), captchaToken }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error((err as { message?: string }).message || "Subscription failed");
        }
        setSubmitted(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
    [orgId, email, getCaptchaToken],
  );

  return {
    email,
    setEmail,
    submitting,
    submitted,
    error,
    handleSubmit,
    captchaActive,
    recaptchaSiteKey: RECAPTCHA_SITE_KEY,
    markRecaptchaReady: () => {
      recaptchaReady.current = true;
    },
  };
}

export { ContactRecaptchaScript as NewsletterRecaptchaScript };
