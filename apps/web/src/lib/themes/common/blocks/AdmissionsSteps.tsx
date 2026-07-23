import type { AdmissionsStepsData } from "@/lib/themes/types";

export default function AdmissionsSteps({ data }: { data: AdmissionsStepsData }) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        {data.eyebrow && <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">{data.eyebrow}</p>}
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-10">{data.title}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
          {data.steps.map((s, i) => (
            <div key={i}>
              <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold mb-3">
                {s.number}
              </div>
              <h3 className="font-bold text-gray-800 mb-1">{s.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
        {data.ctaText && data.ctaUrl && (
          <a href={data.ctaUrl} className="inline-block mt-10 px-6 py-3 rounded-lg bg-gray-900 text-white text-sm font-semibold">
            {data.ctaText}
          </a>
        )}
      </div>
    </section>
  );
}
