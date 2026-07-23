import type { AcademicsProgramsData } from "@/lib/themes/types";

export default function AcademicsPrograms({ data }: { data: AcademicsProgramsData }) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          {data.eyebrow && <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">{data.eyebrow}</p>}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">{data.title}</h2>
          {data.subtitle && <p className="text-gray-600 mt-2 max-w-2xl mx-auto">{data.subtitle}</p>}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.cards.map((c, i) => (
            <div key={i} className="rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-800 mb-1">{c.name}</h3>
              {c.tagline && <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">{c.tagline}</p>}
              {c.description && <p className="text-sm text-gray-600 leading-relaxed mb-3">{c.description}</p>}
              {c.subjects && c.subjects.length > 0 && (
                <ul className="text-sm text-gray-600 space-y-1 mb-3 list-disc list-inside">
                  {c.subjects.map((s, j) => <li key={j}>{s}</li>)}
                </ul>
              )}
              {c.differentiator && <p className="text-sm text-gray-500 italic leading-relaxed">{c.differentiator}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
