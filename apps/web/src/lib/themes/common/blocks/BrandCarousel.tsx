"use client";
import type { BrandCarouselData } from "@/lib/themes/types";

export default function BrandCarousel({ data }: { data: BrandCarouselData }) {
  return (
    <section className="py-10 px-6 bg-white border-y border-gray-100">
      {data.title && <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-widest mb-6">{data.title}</p>}
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-8">
        {data.brands.map((b, i) => (
          <div key={i} className="flex items-center justify-center w-28 h-12 grayscale opacity-60 hover:opacity-100 transition-opacity">
            {b.logo ? <img src={b.logo} alt={b.name} className="max-h-10 object-contain" /> : <span className="text-sm font-bold text-gray-400">{b.name}</span>}
          </div>
        ))}
      </div>
    </section>
  );
}
