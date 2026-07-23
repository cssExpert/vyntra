import type { TimelineStepsData } from "@/lib/themes/types";
import { NAVY, GOLD, SERIF } from "../theme";

export default function TimelineSteps({ data }: { data: TimelineStepsData }) {
  return (
    <section className="py-20" style={{ background: "#faf8f4" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          {data.eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: GOLD }}>{data.eyebrow}</p>}
          <h2 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: SERIF, color: NAVY }}>{data.title}</h2>
          {data.subtitle && <p className="text-gray-600 mt-3">{data.subtitle}</p>}
        </div>
        <div className="relative pl-9 space-y-10" style={{ borderLeft: `2px solid ${GOLD}55` }}>
          {data.steps.map((s, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[45px] top-0 w-5 h-5 rounded-full" style={{ background: GOLD }} />
              <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: GOLD }}>{s.marker}</p>
              <h3 className="font-bold mb-1" style={{ color: NAVY }}>{s.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
