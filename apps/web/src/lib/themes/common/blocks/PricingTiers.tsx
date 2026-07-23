import type { PricingTiersData } from "@/lib/themes/types";

export default function PricingTiers({ data }: { data: PricingTiersData }) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          {data.eyebrow && <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">{data.eyebrow}</p>}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">{data.title}</h2>
          {data.subtitle && <p className="text-gray-600 mt-2 max-w-2xl mx-auto">{data.subtitle}</p>}
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {data.tiers.map((t, i) => (
            <div key={i} className="relative rounded-xl border border-gray-200 bg-white p-6">
              {t.badge && (
                <span className="absolute -top-3 left-6 text-xs font-bold px-2 py-1 rounded bg-gray-900 text-white">
                  {t.badge}
                </span>
              )}
              <h3 className="font-bold text-gray-800 mb-1">{t.name}</h3>
              <p className="text-2xl font-bold text-gray-900 mb-1">{t.price}</p>
              {t.note && <p className="text-xs text-gray-500 mb-4">{t.note}</p>}
              <ul className="text-sm text-gray-600 space-y-1.5 mb-5">
                {t.features.map((f, j) => <li key={j}>• {f}</li>)}
              </ul>
              <a href={t.ctaUrl} className="block text-center px-4 py-2.5 rounded-lg bg-gray-900 text-white text-sm font-semibold">
                {t.ctaText}
              </a>
            </div>
          ))}
        </div>
        {data.calloutTitle && (
          <div className="mt-10 rounded-xl bg-gray-900 text-white p-8 text-center">
            <h3 className="text-lg font-bold mb-2">{data.calloutTitle}</h3>
            {data.calloutBody && <p className="text-gray-300 max-w-2xl mx-auto mb-5">{data.calloutBody}</p>}
            {data.calloutCtaText && data.calloutCtaUrl && (
              <a href={data.calloutCtaUrl} className="inline-block px-6 py-3 rounded-lg bg-white text-gray-900 text-sm font-semibold">
                {data.calloutCtaText}
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
