import type { PageHeaderData } from "@/lib/themes/types";

export default function PageHeader({ data }: { data: PageHeaderData }) {
  const crumbs = data.breadcrumbs ?? [];
  return (
    <section className="bg-gray-800 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl font-bold text-white mb-2">{data.title}</h1>
        {data.subtitle && <p className="text-gray-400 text-sm">{data.subtitle}</p>}
        {crumbs.length > 0 && (
          <nav className="flex items-center gap-2 text-sm mt-3">
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-gray-500">›</span>}
                {i < crumbs.length - 1 ? (
                  <a href={c.url} className="text-gray-400 hover:text-white">{c.label}</a>
                ) : (
                  <span className="text-orange-400 font-medium">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
      </div>
    </section>
  );
}
