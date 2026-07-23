import type { TimelineStepsData } from "@/lib/themes/types";

export default function TimelineSteps({ data }: { data: TimelineStepsData }) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          {data.eyebrow && <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">{data.eyebrow}</p>}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">{data.title}</h2>
          {data.subtitle && <p className="text-gray-600 mt-2">{data.subtitle}</p>}
        </div>
        <div className="relative pl-8 border-l-2 border-gray-200 space-y-8">
          {data.steps.map((s, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-gray-900" />
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">{s.marker}</p>
              <h3 className="font-bold text-gray-800 mb-1">{s.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
