"use client";
import type { HeroCarouselData } from "@/lib/themes/types";

export default function HeroCarousel({ data }: { data: HeroCarouselData }) {
  const slide = data.slides?.[0];
  return (
    <section className="relative min-h-[420px] flex items-center bg-gray-800 overflow-hidden">
      {slide?.image && (
        <img src={slide.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
      )}
      <div className="relative z-10 max-w-5xl mx-auto px-8 py-20">
        {slide?.badge && (
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-white/70 border border-white/30 px-3 py-1 rounded-full mb-4">
            {slide.badge}
          </span>
        )}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{slide?.title ?? "Hero Title"}</h1>
        <p className="text-lg text-white/70 mb-8 max-w-xl">{slide?.subtitle}</p>
        {slide?.ctaText && (
          <a href={slide.ctaUrl ?? "#"} className="inline-block bg-white text-gray-900 font-semibold px-7 py-3 rounded-lg">
            {slide.ctaText}
          </a>
        )}
      </div>
    </section>
  );
}
