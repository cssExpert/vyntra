"use client";

import { useRef } from "react";
import type { BrandCarouselData } from "@/lib/themes/types";

const ORANGE = "#e4611e";

export default function BrandCarousel({ data }: { data: BrandCarouselData }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({ left: dir === "left" ? -200 : 200, behavior: "smooth" });
  }

  if (!data.brands.length) return null;

  return (
    <section className="py-10" style={{ backgroundColor: "#f5f5f5", borderTop: "1px solid #e1e1e1" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {data.title && (
          <h2 className="text-xl font-extrabold text-gray-900 mb-6 text-center" style={{ fontFamily: "'Raleway', sans-serif" }}>
            {data.title}
          </h2>
        )}
        <div className="relative flex items-center gap-3">
          <button
            onClick={() => scroll("left")}
            className="shrink-0 w-9 h-9 rounded-full border border-gray-300 bg-white flex items-center justify-center transition-colors hover:border-orange-400"
            style={{ color: "#4a4a4a" }}
            aria-label="Scroll left"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scroll-smooth no-scrollbar flex-1"
          >
            {data.brands.map((brand, i) => (
              <a
                key={i}
                href={brand.url || "#"}
                className="shrink-0 w-28 h-16 bg-white border border-gray-200 rounded flex items-center justify-center p-3 hover:border-orange-300 hover:shadow-sm transition-all"
              >
                {brand.logo ? (
                  <img src={brand.logo} alt={brand.name} className="max-w-full max-h-full object-contain grayscale hover:grayscale-0 transition-all" />
                ) : (
                  <span className="text-xs font-semibold text-gray-400">{brand.name}</span>
                )}
              </a>
            ))}
          </div>

          <button
            onClick={() => scroll("right")}
            className="shrink-0 w-9 h-9 rounded-full border border-gray-300 bg-white flex items-center justify-center transition-colors hover:border-orange-400"
            style={{ color: "#4a4a4a" }}
            aria-label="Scroll right"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
