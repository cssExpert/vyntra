import type { FeaturesBannerData } from "@/lib/themes/types";
import type { ReactElement } from "react";

const ORANGE = "#e4611e";

const ICON_MAP: Record<string, ReactElement> = {
  truck: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  shield: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  refresh: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-5.1" />
    </svg>
  ),
  headphones: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  ),
  tag: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  ),
};

function getIcon(iconKey: string) {
  return ICON_MAP[iconKey] ?? ICON_MAP.tag;
}

export default function FeaturesBanner({ data }: { data: FeaturesBannerData }) {
  if (!data.features.length) return null;
  return (
    <section style={{ backgroundColor: "#f5f5f5", borderTop: "1px solid #e1e1e1", borderBottom: "1px solid #e1e1e1" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className={`grid gap-8 ${data.features.length <= 3 ? `grid-cols-1 sm:grid-cols-${data.features.length}` : "grid-cols-2 md:grid-cols-4"}`}>
          {data.features.map((f, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="shrink-0 w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: "#fff", color: ORANGE, border: `2px solid ${ORANGE}` }}>
                {getIcon(f.icon)}
              </div>
              <div>
                <p className="font-bold text-gray-800 mb-1">{f.title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
