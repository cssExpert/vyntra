"use client";
import type { NewsletterData } from "@/lib/themes/types";
import { useNewsletterSubscribe, NewsletterRecaptchaScript } from "@/lib/themes/useNewsletterSubscribe";

export default function Newsletter({ data, orgId }: { data: NewsletterData; orgId?: string }) {
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

  return (
    <section className="py-16 px-6 bg-gray-900 text-white text-center">
      <NewsletterRecaptchaScript active={captchaActive} siteKey={recaptchaSiteKey} onReady={markRecaptchaReady} />
      <div className="max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-2">{data.title}</h2>
        {data.subtitle && <p className="text-gray-400 mb-8">{data.subtitle}</p>}
        {submitted ? (
          <p className="text-sm font-semibold text-emerald-400">You&apos;re subscribed — thanks!</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col items-center gap-2">
            <div className="flex gap-2 max-w-md mx-auto w-full">
              <input
                type="email"
                placeholder={data.placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm outline-none disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={submitting}
                className="bg-white text-gray-900 px-5 py-2.5 rounded-lg text-sm font-semibold shrink-0 disabled:opacity-60"
              >
                {submitting ? "…" : data.buttonText}
              </button>
            </div>
            {error && <p className="text-xs text-rose-400">{error}</p>}
          </form>
        )}
      </div>
    </section>
  );
}
