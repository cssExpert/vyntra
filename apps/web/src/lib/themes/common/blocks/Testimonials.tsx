import type { TestimonialsData } from "@/lib/themes/types";

export default function Testimonials({ data }: { data: TestimonialsData }) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          {data.eyebrow && <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">{data.eyebrow}</p>}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">{data.title}</h2>
          {data.subtitle && <p className="text-gray-600 mt-2">{data.subtitle}</p>}
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {data.items.map((t, i) => (
            <div key={i} className="rounded-xl bg-white border border-gray-200 p-6">
              <p className="text-gray-700 leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
              <p className="font-bold text-gray-800 text-sm">{t.name}</p>
              {t.role && <p className="text-xs text-gray-500">{t.role}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
