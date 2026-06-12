import type { PromoBannerData } from "@/lib/themes/types";

const ORANGE = "#e4611e";

export default function PromoBanner({ data }: { data: PromoBannerData }) {
  return (
    <section className="py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-lg" style={{ backgroundColor: "#212529", minHeight: 300 }}>
          {data.image && (
            <img src={data.image} alt={data.title} className="absolute inset-0 w-full h-full object-cover opacity-40" />
          )}
          <div className="relative z-10 flex flex-col items-start justify-center px-10 py-16 max-w-xl">
            {data.badge && (
              <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded mb-4 text-white" style={{ backgroundColor: ORANGE }}>
                {data.badge}
              </span>
            )}
            {data.subtitle && (
              <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: ORANGE }}>
                {data.subtitle}
              </p>
            )}
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight mb-3" style={{ fontFamily: "'Raleway', sans-serif" }}>
              {data.title}
            </h2>
            {data.description && (
              <p className="text-white/70 mb-8 leading-relaxed">{data.description}</p>
            )}
            <div className="flex flex-wrap gap-3">
              <a
                href={data.primaryCtaUrl || "#"}
                className="inline-block px-7 py-3 text-sm font-bold text-white rounded transition-opacity hover:opacity-85"
                style={{ backgroundColor: ORANGE }}
              >
                {data.primaryCtaText}
              </a>
              {data.secondaryCtaText && (
                <a
                  href={data.secondaryCtaUrl || "#"}
                  className="inline-block px-7 py-3 text-sm font-bold rounded border-2 border-white text-white transition-colors hover:bg-white hover:text-gray-900"
                >
                  {data.secondaryCtaText}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
