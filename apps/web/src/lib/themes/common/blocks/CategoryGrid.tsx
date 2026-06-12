"use client";
import type { CategoryGridData } from "@/lib/themes/types";

export default function CategoryGrid({ data }: { data: CategoryGridData }) {
  return (
    <section className="py-16 px-6 bg-gray-50">
      {data.title && <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">{data.title}</h2>}
      <div className="max-w-5xl mx-auto grid grid-cols-3 md:grid-cols-6 gap-4">
        {data.categories.map((c, i) => (
          <a key={i} href={c.url} className="flex flex-col items-center gap-2 group">
            <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center group-hover:ring-2 ring-blue-500 transition-all">
              {c.image ? <img src={c.image} alt={c.name} className="w-full h-full object-cover" /> : <span className="text-xs text-gray-400">{c.name[0]}</span>}
            </div>
            <span className="text-xs font-medium text-gray-700 text-center">{c.name}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
