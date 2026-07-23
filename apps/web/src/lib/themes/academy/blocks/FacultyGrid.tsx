import type { FacultyGridData } from "@/lib/themes/types";
import { NAVY, GOLD, SERIF } from "../theme";

export default function FacultyGrid({ data }: { data: FacultyGridData }) {
  return (
    <section className="py-20" style={{ background: "#faf8f4" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          {data.eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: GOLD }}>{data.eyebrow}</p>}
          <h2 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: SERIF, color: NAVY }}>{data.title}</h2>
          {data.intro && <p className="text-gray-600 mt-3">{data.intro}</p>}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {data.members.map((m, i) => (
            <div key={i} className="text-center">
              <div
                className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden"
                style={{ background: "#e8e2d5", border: `2px solid ${GOLD}` }}
              >
                {m.image && <img src={m.image} alt={m.name} className="w-full h-full object-cover" />}
              </div>
              <h3 className="font-bold" style={{ fontFamily: SERIF, color: NAVY }}>{m.name}</h3>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: GOLD }}>{m.role}</p>
              <p className="text-sm text-gray-600 leading-relaxed">{m.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
