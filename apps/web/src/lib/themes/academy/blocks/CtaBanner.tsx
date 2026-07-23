import type { CtaBannerData } from "@/lib/themes/types";
import { NAVY, GOLD, SERIF } from "../theme";

export default function CtaBanner({ data }: { data: CtaBannerData }) {
  return (
    <section
      className="py-20 text-center"
      style={{ background: `radial-gradient(circle at 50% 30%, #16304f 0%, ${NAVY} 70%)`, color: "#fff" }}
    >
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4" style={{ fontFamily: SERIF }}>{data.title}</h2>
        {data.subtitle && <p className="text-gray-300 mb-10">{data.subtitle}</p>}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a href={data.primaryCtaUrl} className="px-7 py-3 rounded text-sm font-semibold" style={{ background: GOLD, color: NAVY }}>
            {data.primaryCtaText}
          </a>
          {data.secondaryCtaText && data.secondaryCtaUrl && (
            <a
              href={data.secondaryCtaUrl}
              className="px-7 py-3 rounded border text-sm font-semibold text-white"
              style={{ borderColor: "rgba(255,255,255,.4)" }}
            >
              {data.secondaryCtaText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
