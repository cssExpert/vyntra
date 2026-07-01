"use client";
import { useState } from "react";
import type { ProductTabsData } from "@/lib/themes/types";
import { useActiveTabProducts } from "@/lib/themes/useProductTabs";
import { EmptyState } from "@/lib/themes/shared/EmptyState";

export default function ProductTabs({ data, orgId }: { data: ProductTabsData; orgId?: string }) {
  const [active, setActive] = useState(0);
  const { products, loading } = useActiveTabProducts(data.tabs, active, orgId);
  return (
    <section className="py-16 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex gap-4 border-b border-gray-200 mb-8">
          {data.tabs.map((t, i) => (
            <button key={i} onClick={() => setActive(i)} className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${i === active ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-800"}`}>{t.label}</button>
          ))}
        </div>
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-8">Loading products…</p>
        ) : products.length === 0 ? (
          <EmptyState title="No products found" message="Try a different category or product type." />
        ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {products.map((p) => (
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
        )}
      </div>
    </section>
  );
}
