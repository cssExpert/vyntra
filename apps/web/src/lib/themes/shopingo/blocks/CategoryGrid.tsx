import type { CategoryGridData } from "@/lib/themes/types";

const ORANGE = "#e4611e";

export default function CategoryGrid({ data }: { data: CategoryGridData }) {
  if (!data.categories.length) return null;
  return (
    <section className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {data.title && (
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-extrabold text-gray-900" style={{ fontFamily: "'Raleway', sans-serif" }}>
              {data.title}
            </h2>
            <a href="#" className="text-sm font-semibold transition-colors hover:underline" style={{ color: ORANGE }}>
              View All →
            </a>
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {data.categories.map((cat, i) => (
            <a
              key={i}
              href={cat.url}
              className="group flex flex-col items-center text-center p-4 rounded-lg border border-gray-200 bg-white hover:border-orange-400 hover:shadow-md transition-all"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden mb-3 border-2 border-gray-100 group-hover:border-orange-300 transition-colors">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
                  </div>
                )}
              </div>
              <p className="text-xs font-semibold text-gray-700 group-hover:text-orange-600 transition-colors">{cat.name}</p>
              {cat.count != null && (
                <p className="text-[10px] text-gray-400 mt-0.5">{cat.count} items</p>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
