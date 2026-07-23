import type { HeroBannerData } from "@/lib/themes/types";
import { NAVY, GOLD, SERIF } from "../theme";

export default function HeroBanner({ data }: { data: HeroBannerData }) {
  const navy = data.tone === "navy";
  return (
    <section
      className="relative py-28 flex items-center"
      style={{
        background: navy
          ? `radial-gradient(circle at 50% 20%, #16304f 0%, ${NAVY} 70%)`
          : data.backgroundImage
            ? `linear-gradient(rgba(11,30,51,.6), rgba(11,30,51,.75)), url(${data.backgroundImage}) center/cover`
            : NAVY,
        color: "#fff",
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {data.eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: GOLD }}>
            {data.eyebrow}
          </p>
        )}
        <h1 className="text-3xl sm:text-5xl font-bold mb-5 leading-tight" style={{ fontFamily: SERIF }}>
          {data.heading}
        </h1>
        {data.body && <p className="text-gray-200 leading-relaxed max-w-2xl mx-auto mb-10">{data.body}</p>}
        {(data.primaryCtaText || data.secondaryCtaText) && (
          <div className="flex flex-wrap items-center justify-center gap-4">
            {data.primaryCtaText && data.primaryCtaUrl && (
              <a
                href={data.primaryCtaUrl}
                className="px-7 py-3 rounded text-sm font-semibold tracking-wide"
                style={{ background: GOLD, color: NAVY }}
              >
                {data.primaryCtaText}
              </a>
            )}
            {data.secondaryCtaText && data.secondaryCtaUrl && (
              <a
                href={data.secondaryCtaUrl}
                className="px-7 py-3 rounded border text-sm font-semibold tracking-wide text-white"
                style={{ borderColor: "rgba(255,255,255,.4)" }}
              >
                {data.secondaryCtaText}
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
