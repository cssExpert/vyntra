import type { CategoryGridData } from "@/lib/themes/types";
import { useGridCategories } from "@/lib/themes/useCategoryGrid";
import { EmptyState } from "@/lib/themes/shared/EmptyState";

export default function CategoryGrid({ data, orgId }: { data: CategoryGridData; orgId?: string }) {
  const { categories, loading } = useGridCategories(data, orgId);

  return (
    <section className="py-14 bg-white dark:bg-[#121214]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {data.title && (
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white" style={{ fontFamily: "'Raleway', sans-serif" }}>
              {data.title}
            </h2>
            <a href="#" className="text-sm font-semibold text-[#e4611e] transition-colors hover:underline">
              View All →
            </a>
          </div>
        )}
        {loading ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-10">Loading categories…</p>
        ) : categories.length === 0 ? (
          <EmptyState title="No categories found" message="Add some categories to your store catalog." />
        ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => (
            <a
              key={i}
              href={cat.url}
              className="group flex flex-col items-center text-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1c1c1e] hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-md transition-all"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden mb-3 border-2 border-gray-100 dark:border-gray-700 group-hover:border-orange-300 transition-colors">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-100 dark:bg-[#2a2a2e] flex items-center justify-center text-gray-300 dark:text-gray-600">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
                  </div>
                )}
              </div>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 group-hover:text-orange-600 transition-colors">{cat.name}</p>
              {cat.count != null && (
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{cat.count} items</p>
              )}
            </a>
          ))}
        </div>
        )}
      </div>
    </section>
  );
}
