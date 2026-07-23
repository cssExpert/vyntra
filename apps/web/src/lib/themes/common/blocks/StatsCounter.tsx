import type { StatsCounterData } from "@/lib/themes/types";

export default function StatsCounter({ data }: { data: StatsCounterData }) {
  return (
    <section className="py-16 bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        {data.eyebrow && <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">{data.eyebrow}</p>}
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">{data.title}</h2>
        {data.subtitle && <p className="text-gray-300 max-w-2xl mx-auto mb-10">{data.subtitle}</p>}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mt-10">
          {data.stats.map((s, i) => (
            <div key={i}>
              <p className="text-3xl sm:text-4xl font-bold">{s.value}</p>
              <p className="text-sm text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
        {data.linkText && data.linkUrl && (
          <a href={data.linkUrl} className="inline-block mt-10 text-sm font-semibold text-white hover:underline">
            {data.linkText}
          </a>
        )}
      </div>
    </section>
  );
}
