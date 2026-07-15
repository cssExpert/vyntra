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
    <section className="py-20 relative overflow-hidden bg-[#1e2226]">
      <NewsletterRecaptchaScript active={captchaActive} siteKey={recaptchaSiteKey} onReady={markRecaptchaReady} />
      {data.backgroundImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={data.backgroundImage} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-15" />
      )}
      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3" style={{ fontFamily: "'Raleway', sans-serif" }}>
          {data.title}
        </h2>
        {data.subtitle && (
          <p className="text-white/60 mb-8">{data.subtitle}</p>
        )}
        {submitted ? (
          <p className="text-sm font-semibold text-emerald-400">You&apos;re subscribed — thanks!</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col items-center gap-2">
            <div className="flex max-w-md mx-auto w-full overflow-hidden rounded border border-white/20">
              <input
                type="email"
                placeholder={data.placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
                className="flex-1 px-5 py-3.5 text-sm bg-white text-gray-800 outline-none disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={submitting}
                className="px-7 py-3.5 text-sm font-bold text-white shrink-0 bg-[#e4611e] transition-opacity hover:opacity-85 disabled:opacity-60"
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
