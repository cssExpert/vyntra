import type { TestimonialsData } from "@/lib/themes/types";
import { NAVY, GOLD, SERIF } from "../theme";

export default function Testimonials({ data }: { data: TestimonialsData }) {
  return (
    <section className="py-20 bg-[#faf8f4] dark:bg-[#0f1a29]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          {data.eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: GOLD }}>{data.eyebrow}</p>}
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0B1E33] dark:text-white" style={{ fontFamily: SERIF }}>{data.title}</h2>
          {data.subtitle && <p className="text-gray-600 dark:text-gray-400 mt-3">{data.subtitle}</p>}
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {data.items.map((t, i) => (
            <div key={i} className="rounded-lg bg-white dark:bg-[#132038] p-7" style={{ border: `1px solid ${GOLD}33` }}>
              <p className="leading-relaxed mb-5 text-[#0B1E33] dark:text-white" style={{ fontFamily: SERIF }}>&ldquo;{t.quote}&rdquo;</p>
              <p className="font-bold text-sm text-[#0B1E33] dark:text-white">{t.name}</p>
              {t.role && <p className="text-xs mt-0.5" style={{ color: GOLD }}>{t.role}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
