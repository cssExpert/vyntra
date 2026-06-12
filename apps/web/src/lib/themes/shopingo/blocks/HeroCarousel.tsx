"use client";

import { useState, useEffect, useCallback } from "react";
import type { HeroCarouselData } from "@/lib/themes/types";

const ORANGE = "#e4611e";

export default function HeroCarousel({ data }: { data: HeroCarouselData }) {
  const { slides, autoPlayMs = 4000 } = data;
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), [slides.length]);
  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(next, autoPlayMs);
    return () => clearInterval(id);
  }, [next, autoPlayMs, slides.length]);

  if (!slides.length) return null;

  const slide = slides[current];

  return (
    <section className="relative overflow-hidden bg-gray-100" style={{ minHeight: 480 }}>
      {/* Slide image */}
      {slide.image && (
        <img
          src={slide.image}
          alt={slide.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-black/35" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-full" style={{ minHeight: 480 }}>
        <div className="max-w-xl py-20">
          {slide.badge && (
            <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded mb-4 text-white" style={{ backgroundColor: ORANGE }}>
              {slide.badge}
            </span>
          )}
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4" style={{ fontFamily: "'Raleway', sans-serif" }}>
            {slide.title}
          </h1>
          {slide.subtitle && (
            <p className="text-lg text-white/80 mb-8">{slide.subtitle}</p>
          )}
          {slide.ctaText && (
            <a
              href={slide.ctaUrl || "#"}
              className="inline-block px-8 py-3.5 text-sm font-bold text-white rounded transition-opacity hover:opacity-85"
              style={{ backgroundColor: ORANGE }}
            >
              {slide.ctaText}
            </a>
          )}
        </div>
      </div>

      {/* Prev / Next */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors"
            aria-label="Previous slide"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors"
            aria-label="Next slide"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          {/* Dots */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className="w-2.5 h-2.5 rounded-full transition-colors"
                style={{ backgroundColor: i === current ? ORANGE : "rgba(255,255,255,0.5)" }}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
