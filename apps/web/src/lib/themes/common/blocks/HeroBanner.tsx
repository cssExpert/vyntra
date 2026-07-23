import type { HeroBannerData } from "@/lib/themes/types";

export default function HeroBanner({ data }: { data: HeroBannerData }) {
  const navy = data.tone === "navy";
  return (
    <section
      className="relative py-24 flex items-center"
      style={{
        background: navy
          ? "#111827"
          : data.backgroundImage
            ? `linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.45)), url(${data.backgroundImage}) center/cover`
            : "#1f2937",
        color: "#fff",
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {data.eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-300 mb-3">{data.eyebrow}</p>
        )}
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">{data.heading}</h1>
        {data.body && <p className="text-gray-200 leading-relaxed max-w-2xl mx-auto mb-8">{data.body}</p>}
        {(data.primaryCtaText || data.secondaryCtaText) && (
          <div className="flex flex-wrap items-center justify-center gap-3">
            {data.primaryCtaText && data.primaryCtaUrl && (
              <a href={data.primaryCtaUrl} className="px-6 py-3 rounded-lg bg-white text-gray-900 text-sm font-semibold">
                {data.primaryCtaText}
              </a>
            )}
            {data.secondaryCtaText && data.secondaryCtaUrl && (
              <a href={data.secondaryCtaUrl} className="px-6 py-3 rounded-lg border border-white/40 text-white text-sm font-semibold">
                {data.secondaryCtaText}
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
