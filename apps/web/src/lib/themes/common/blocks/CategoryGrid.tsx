"use client";
import type { CategoryGridData } from "@/lib/themes/types";
import { useGridCategories } from "@/lib/themes/useCategoryGrid";
import { EmptyState } from "@/lib/themes/shared/EmptyState";

export default function CategoryGrid({ data, orgId }: { data: CategoryGridData; orgId?: string }) {
  const { categories, loading } = useGridCategories(data, orgId);

  return (
    <section className="py-16 px-6 bg-gray-50">
      {data.title && <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">{data.title}</h2>}
      {loading ? (
        <p className="text-sm text-gray-400 text-center py-8">Loading categories…</p>
      ) : categories.length === 0 ? (
        <EmptyState title="No categories found" message="Add some categories to your store catalog." />
      ) : (
      <div className="max-w-5xl mx-auto grid grid-cols-3 md:grid-cols-6 gap-4">
        {categories.map((c, i) => (
          <a key={i} href={c.url} className="flex flex-col items-center gap-2 group">
            <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center group-hover:ring-2 ring-blue-500 transition-all">
              {c.image ? <img src={c.image} alt={c.name} className="w-full h-full object-cover" /> : <span className="text-xs text-gray-400">{c.name[0]}</span>}
            </div>
            <span className="text-xs font-medium text-gray-700 text-center">{c.name}</span>
          </a>
        ))}
      </div>
      )}
    </section>
  );
}
