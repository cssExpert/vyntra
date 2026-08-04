import type { FacultyGridData } from "@/lib/themes/types";
import { NAVY, GOLD, SERIF } from "../theme";

export default function FacultyGrid({ data }: { data: FacultyGridData }) {
  return (
    <section className="py-20 bg-[#faf8f4] dark:bg-[#0f1a29]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          {data.eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: GOLD }}>{data.eyebrow}</p>}
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0B1E33] dark:text-white" style={{ fontFamily: SERIF }}>{data.title}</h2>
          {data.intro && <p className="text-gray-600 dark:text-gray-400 mt-3">{data.intro}</p>}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {data.members.map((m, i) => (
            <div key={i} className="text-center">
              <div
                className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden bg-[#e8e2d5] dark:bg-[#1c2c42]"
                style={{ border: `2px solid ${GOLD}` }}
              >
                {m.image && <img src={m.image} alt={m.name} className="w-full h-full object-cover" />}
              </div>
              <h3 className="font-bold text-[#0B1E33] dark:text-white" style={{ fontFamily: SERIF }}>{m.name}</h3>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: GOLD }}>{m.role}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{m.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
