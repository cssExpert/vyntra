"use client";
import type { ProductGridData } from "@/lib/themes/types";

export default function ProductGrid({ data }: { data: ProductGridData }) {
  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        {data.title && <h2 className="text-3xl font-bold text-gray-900 mb-2 text-center">{data.title}</h2>}
        {data.subtitle && <p className="text-gray-500 text-center mb-10">{data.subtitle}</p>}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {data.products.map((p) => (
            <div key={p.id} className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-100 aspect-square flex items-center justify-center">
                {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <span className="text-gray-300 text-xs">No image</span>}
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                <p className="text-sm text-gray-700 mt-1">${p.price.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
