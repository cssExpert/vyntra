import type { FacultyGridData } from "@/lib/themes/types";

export default function FacultyGrid({ data }: { data: FacultyGridData }) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 max-w-2xl mx-auto">
          {data.eyebrow && <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">{data.eyebrow}</p>}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">{data.title}</h2>
          {data.intro && <p className="text-gray-600 mt-2">{data.intro}</p>}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.members.map((m, i) => (
            <div key={i} className="text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4 overflow-hidden">
                {m.image && <img src={m.image} alt={m.name} className="w-full h-full object-cover" />}
              </div>
              <h3 className="font-bold text-gray-800">{m.name}</h3>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">{m.role}</p>
              <p className="text-sm text-gray-600 leading-relaxed">{m.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
