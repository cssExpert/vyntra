import type { PricingTiersData } from "@/lib/themes/types";
import { NAVY, GOLD, SERIF } from "../theme";

export default function PricingTiers({ data }: { data: PricingTiersData }) {
  return (
    <section className="py-20" style={{ background: "#faf8f4" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          {data.eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: GOLD }}>{data.eyebrow}</p>}
          <h2 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: SERIF, color: NAVY }}>{data.title}</h2>
          {data.subtitle && <p className="text-gray-600 mt-3 max-w-2xl mx-auto">{data.subtitle}</p>}
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {data.tiers.map((t, i) => (
            <div key={i} className="relative rounded-lg bg-white p-7" style={{ border: `1px solid ${GOLD}44` }}>
              {t.badge && (
                <span
                  className="absolute -top-3 left-7 text-xs font-bold px-2.5 py-1 rounded"
                  style={{ background: GOLD, color: NAVY }}
                >
                  {t.badge}
                </span>
              )}
              <h3 className="font-bold mb-1" style={{ fontFamily: SERIF, color: NAVY }}>{t.name}</h3>
              <p className="text-2xl font-bold mb-1" style={{ fontFamily: SERIF, color: NAVY }}>{t.price}</p>
              {t.note && <p className="text-xs text-gray-500 mb-5">{t.note}</p>}
              <ul className="text-sm text-gray-600 space-y-2 mb-6">
                {t.features.map((f, j) => (
                  <li key={j} className="flex items-start gap-2">
                    <span style={{ color: GOLD }}>•</span> {f}
                  </li>
                ))}
              </ul>
              <a
                href={t.ctaUrl}
                className="block text-center px-4 py-3 rounded text-sm font-semibold"
                style={{ background: NAVY, color: "#fff" }}
              >
                {t.ctaText}
              </a>
            </div>
          ))}
        </div>
        {data.calloutTitle && (
          <div className="mt-12 rounded-lg p-9 text-center" style={{ background: NAVY, color: "#fff" }}>
            <h3 className="text-lg font-bold mb-2" style={{ fontFamily: SERIF }}>{data.calloutTitle}</h3>
            {data.calloutBody && <p className="text-gray-300 max-w-2xl mx-auto mb-6">{data.calloutBody}</p>}
            {data.calloutCtaText && data.calloutCtaUrl && (
              <a
                href={data.calloutCtaUrl}
                className="inline-block px-7 py-3 rounded text-sm font-semibold"
                style={{ background: GOLD, color: NAVY }}
              >
                {data.calloutCtaText}
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
