import type { PageHeaderData } from "@/lib/themes/types";

const ORANGE = "#e4611e";

export default function PageHeader({ data }: { data: PageHeaderData }) {
  const crumbs = data.breadcrumbs ?? [];
  return (
    <section
      style={{
        background: data.backgroundImage
          ? `linear-gradient(rgba(33,37,41,0.8), rgba(33,37,41,0.8)) url(${data.backgroundImage}) center/cover no-repeat`
          : "#212529",
        padding: "40px 0",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{data.title}</h1>
        {data.subtitle && (
          <p className="text-gray-400 text-sm mb-3">{data.subtitle}</p>
        )}
        {crumbs.length > 0 && (
          <nav className="flex items-center flex-wrap gap-1 text-sm mt-3">
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span className="text-gray-500 mx-1">›</span>}
                {i < crumbs.length - 1 ? (
                  <a
                    href={c.url}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {c.label}
                  </a>
                ) : (
                  <span style={{ color: ORANGE }} className="font-semibold">
                    {c.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        )}
      </div>
    </section>
  );
}
