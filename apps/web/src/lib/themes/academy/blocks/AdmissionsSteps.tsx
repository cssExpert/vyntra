import type { AdmissionsStepsData } from "@/lib/themes/types";
import { NAVY, GOLD, SERIF } from "../theme";

export default function AdmissionsSteps({ data }: { data: AdmissionsStepsData }) {
  return (
    <section className="py-20 bg-white text-center">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {data.eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: GOLD }}>{data.eyebrow}</p>}
        <h2 className="text-2xl sm:text-3xl font-bold mb-14" style={{ fontFamily: SERIF, color: NAVY }}>{data.title}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 text-left">
          {data.steps.map((s, i) => (
            <div key={i}>
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center font-bold mb-4"
                style={{ background: NAVY, color: GOLD, fontFamily: SERIF }}
              >
                {s.number}
              </div>
              <h3 className="font-bold mb-2" style={{ color: NAVY }}>{s.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
        {data.ctaText && data.ctaUrl && (
          <a
            href={data.ctaUrl}
            className="inline-block mt-14 px-7 py-3 rounded text-sm font-semibold tracking-wide"
            style={{ background: NAVY, color: "#fff" }}
          >
            {data.ctaText}
          </a>
        )}
      </div>
    </section>
  );
}
