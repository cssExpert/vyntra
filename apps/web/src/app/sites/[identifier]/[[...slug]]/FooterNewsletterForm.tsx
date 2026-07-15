"use client";

import { useNewsletterSubscribe, NewsletterRecaptchaScript } from "@/lib/themes/useNewsletterSubscribe";

export function FooterNewsletterForm({ orgId }: { orgId: string }) {
  const {
    email,
    setEmail,
    submitting,
    submitted,
    error,
    handleSubmit,
    captchaActive,
    recaptchaSiteKey,
    markRecaptchaReady,
  } = useNewsletterSubscribe(orgId);

  if (submitted) {
    return (
      <div className="flex w-full sm:w-auto max-w-sm items-center gap-2 text-sm font-semibold text-emerald-400">
        <NewsletterRecaptchaScript active={captchaActive} siteKey={recaptchaSiteKey} onReady={markRecaptchaReady} />
        You&apos;re subscribed — thanks!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-stretch sm:items-end gap-1.5 w-full sm:w-auto">
      <NewsletterRecaptchaScript active={captchaActive} siteKey={recaptchaSiteKey} onReady={markRecaptchaReady} />
      <div className="flex w-full sm:w-auto max-w-sm overflow-hidden border border-white/20 rounded">
        <input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
          className="flex-1 px-4 py-2.5 text-sm outline-none bg-white dark:bg-[#2a2a2e] text-gray-800 dark:text-gray-100 placeholder:text-gray-400 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2.5 text-sm font-semibold text-white shrink-0 bg-[#e4611e] hover:bg-[#cf5519] transition-colors disabled:opacity-60"
        >
          {submitting ? "…" : "Subscribe"}
        </button>
      </div>
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </form>
  );
}
