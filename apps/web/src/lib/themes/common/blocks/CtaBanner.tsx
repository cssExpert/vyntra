import type { CtaBannerData } from "@/lib/themes/types";

export default function CtaBanner({ data }: { data: CtaBannerData }) {
  return (
    <section className="py-16 text-center" style={{ background: "#111827", color: "#fff" }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">{data.title}</h2>
        {data.subtitle && <p className="text-gray-300 mb-8">{data.subtitle}</p>}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a href={data.primaryCtaUrl} className="px-6 py-3 rounded-lg bg-white text-gray-900 text-sm font-semibold">
            {data.primaryCtaText}
          </a>
          {data.secondaryCtaText && data.secondaryCtaUrl && (
            <a href={data.secondaryCtaUrl} className="px-6 py-3 rounded-lg border border-white/40 text-white text-sm font-semibold">
              {data.secondaryCtaText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
