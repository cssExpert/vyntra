"use client";

import { useCallback, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

export interface CommentFormValues {
  authorName: string;
  authorEmail: string;
  body: string;
}

const EMPTY_VALUES: CommentFormValues = {
  authorName: "",
  authorEmail: "",
  body: "",
};

/**
 * Shared submit logic for a resource's comment form (blog post today; page/
 * product later — see resourceType). `orgId` is undefined in the editor's
 * preview canvas, in which case submission is a no-op. Mirrors
 * useContactFormSubmit's shape/captcha handling.
 */
export function useCommentSubmit(
  orgId: string | undefined,
  resourceType: "blog" | "page" | "product",
  resourceId: string | undefined,
  onSubmitted?: () => void,
) {
  const [values, setValues] = useState<CommentFormValues>(EMPTY_VALUES);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const captchaActive = !!RECAPTCHA_SITE_KEY;

  const setField = useCallback((key: keyof CommentFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const getCaptchaToken = useCallback(async (): Promise<string | undefined> => {
    // Don't gate on this component's own recaptchaReady ref (set via its
    // Script onLoad): the recaptcha script is shared/deduped across the
    // page (e.g. the newsletter footer block also loads it), so whichever
    // consumer mounts second never gets its own onLoad fired even though
    // window.grecaptcha is already usable. grecaptcha.ready() below already
    // handles waiting for real readiness.
    if (!captchaActive || typeof window === "undefined" || !window.grecaptcha) return undefined;
    return new Promise((resolve) => {
      window.grecaptcha!.ready(() => {
        window
          .grecaptcha!.execute(RECAPTCHA_SITE_KEY!, { action: "comment_submit" })
          .then(resolve)
          .catch(() => resolve(undefined));
      });
    });
  }, [captchaActive]);

  const handleSubmit = useCallback(
    async (e?: { preventDefault?: () => void }) => {
      e?.preventDefault?.();
      if (!orgId || !resourceId) return;
      if (!values.authorName.trim() || !values.authorEmail.trim() || !values.body.trim()) {
        setError("Please fill in your name, email, and comment.");
        return;
      }

      setSubmitting(true);
      setError(null);
      try {
        const captchaToken = await getCaptchaToken();
        const res = await fetch(`${API}/public/sites/${orgId}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resourceType,
            resourceId,
            parentId: replyTo || undefined,
            authorName: values.authorName,
            authorEmail: values.authorEmail,
            body: values.body,
            captchaToken,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error((err as { message?: string }).message || "Submission failed");
        }
        setSubmitted(true);
        setValues(EMPTY_VALUES);
        setReplyTo(null);
        onSubmitted?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
    [orgId, resourceType, resourceId, replyTo, values, getCaptchaToken, onSubmitted],
  );

  const reset = useCallback(() => {
    setValues(EMPTY_VALUES);
    setSubmitted(false);
    setError(null);
  }, []);

  return {
    values,
    setField,
    replyTo,
    setReplyTo,
    submitting,
    submitted,
    error,
    handleSubmit,
    reset,
    captchaActive,
    recaptchaSiteKey: RECAPTCHA_SITE_KEY,
  };
}
