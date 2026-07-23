import type { StatsCounterData } from "@/lib/themes/types";
import { NAVY, GOLD, SERIF } from "../theme";

export default function StatsCounter({ data }: { data: StatsCounterData }) {
  return (
    <section className="py-20 text-center" style={{ background: NAVY, color: "#fff" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {data.eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: GOLD }}>{data.eyebrow}</p>
        )}
        <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ fontFamily: SERIF }}>{data.title}</h2>
        {data.subtitle && <p className="text-gray-300 max-w-2xl mx-auto mb-12">{data.subtitle}</p>}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 mt-4">
          {data.stats.map((s, i) => (
            <div key={i}>
              <p className="text-4xl font-bold" style={{ fontFamily: SERIF, color: GOLD }}>{s.value}</p>
              <p className="text-sm text-gray-300 mt-2 uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
        {data.linkText && data.linkUrl && (
          <a href={data.linkUrl} className="inline-block mt-12 text-sm font-semibold hover:underline" style={{ color: GOLD }}>
            {data.linkText}
          </a>
        )}
      </div>
    </section>
  );
}
