import type { AcademicsProgramsData } from "@/lib/themes/types";
import { NAVY, GOLD, SERIF } from "../theme";

export default function AcademicsPrograms({ data }: { data: AcademicsProgramsData }) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          {data.eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: GOLD }}>{data.eyebrow}</p>}
          <h2 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: SERIF, color: NAVY }}>{data.title}</h2>
          {data.subtitle && <p className="text-gray-600 mt-3 max-w-2xl mx-auto">{data.subtitle}</p>}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.cards.map((c, i) => (
            <div key={i} className="rounded-lg p-7" style={{ border: `1px solid ${GOLD}44` }}>
              <h3 className="font-bold text-lg mb-1" style={{ fontFamily: SERIF, color: NAVY }}>{c.name}</h3>
              {c.tagline && <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: GOLD }}>{c.tagline}</p>}
              {c.description && <p className="text-sm text-gray-600 leading-relaxed mb-4">{c.description}</p>}
              {c.subjects && c.subjects.length > 0 && (
                <ul className="text-sm text-gray-600 space-y-1.5 mb-4">
                  {c.subjects.map((s, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <span style={{ color: GOLD }}>•</span> {s}
                    </li>
                  ))}
                </ul>
              )}
              {c.differentiator && <p className="text-sm text-gray-500 italic leading-relaxed border-t border-gray-100 pt-3">{c.differentiator}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
