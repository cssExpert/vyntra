"use client";

// Base block — applies the .sk shimmer sweep from globals.css
function S({ className = "" }: { className?: string }) {
  return <div className={`sk ${className}`} />;
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
export function HeroSkeleton() {
  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:py-0 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-screen lg:min-h-0 lg:py-40">
          {/* Left */}
          <div>
            <S className="h-8 w-56 rounded-full mb-8" />
            <S className="h-6 w-20 mb-3" />
            <S className="h-28 w-full mb-1" />
            <S className="h-28 w-1/2 mb-5" />
            <S className="h-4 w-full mb-2" />
            <S className="h-4 w-5/6 mb-10" />
            <div className="flex flex-wrap gap-4 mb-12">
              <S className="h-11 w-36 rounded-md" />
              <S className="h-11 w-32 rounded-md" />
              <S className="h-11 w-28 rounded-md" />
            </div>
            <div className="flex flex-wrap gap-6 sm:gap-10">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  <S className="h-10 w-16 mb-2" />
                  <S className="h-3 w-20" />
                </div>
              ))}
            </div>
          </div>
          {/* Right */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative w-72 h-72 sm:w-96 sm:h-96 flex items-center justify-center">
              <S className="w-56 h-56 sm:w-72 sm:h-72 rounded-full" />
              {/* Floating tag skeletons */}
              <S className="absolute top-2 right-4 h-7 w-24 rounded-lg" />
              <S className="absolute top-[38%] -right-2 h-7 w-20 rounded-lg" />
              <S className="absolute bottom-[28%] right-2 h-7 w-28 rounded-lg" />
              <S className="absolute bottom-8 left-4 h-7 w-22 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── About ────────────────────────────────────────────────────────────────────
export function AboutSkeleton() {
  return (
    <section
      className="py-24 md:py-36 relative overflow-hidden"
      style={{ background: "var(--bg-2)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-16 lg:gap-24 items-center lg:grid-cols-[1fr_2fr]">
          {/* Left */}
          <div className="relative">
            <div className="glass-card rounded-2xl p-4 sm:p-6">
              <S className="aspect-4/5 max-w-sm mx-auto lg:mx-0 rounded-2xl" />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4 max-w-sm mx-auto lg:mx-0">
              {[1, 2].map((i) => (
                <div key={i} className="glass-card rounded-xl p-4">
                  <S className="h-8 w-16 mb-2" />
                  <S className="h-3 w-24" />
                </div>
              ))}
            </div>
          </div>
          {/* Right */}
          <div>
            <S className="h-4 w-28 mb-6" />
            <S className="h-16 w-full mb-2" />
            <S className="h-16 w-1/2 mb-8" />
            <S className="h-4 w-full mb-2" />
            <S className="h-4 w-11/12 mb-2" />
            <S className="h-4 w-4/5 mb-5" />
            <S className="h-4 w-full mb-2" />
            <S className="h-4 w-3/4 mb-8" />
            <div className="grid sm:grid-cols-2 gap-3 mb-10">
              {Array.from({ length: 6 }).map((_, i) => (
                <S key={i} className="h-4 w-full" />
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              <S className="h-11 w-36 rounded-md" />
              <S className="h-11 w-28 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Skills ───────────────────────────────────────────────────────────────────
export function SkillsSkeleton() {
  return (
    <section
      className="py-24 md:py-36"
      style={{ background: "var(--bg)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <S className="h-4 w-28 mx-auto mb-6" />
          <S className="h-14 w-48 mx-auto mb-4" />
          <S className="h-4 w-80 mx-auto mb-2" />
          <S className="h-4 w-64 mx-auto" />
        </div>
        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-5">
              <S className="w-12 h-12 rounded-xl mb-4" />
              <div className="flex items-center justify-between mb-3">
                <S className="h-4 w-14" />
                <S className="h-3 w-8" />
              </div>
              <S className="h-1.5 w-full rounded-full" />
            </div>
          ))}
        </div>
        {/* Tagline */}
        <div className="mt-16 glass-card rounded-2xl p-8 text-center">
          <S className="h-8 w-80 mx-auto mb-3" />
          <S className="h-4 w-64 mx-auto" />
        </div>
      </div>
    </section>
  );
}

// ─── Services ─────────────────────────────────────────────────────────────────
export function ServicesSkeleton() {
  return (
    <section
      className="py-24 md:py-36 relative overflow-hidden"
      style={{ background: "var(--bg-2)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <S className="h-4 w-28 mb-6" />
          <S className="h-16 w-56 mb-4" />
          <S className="h-4 w-full mb-2" />
          <S className="h-4 w-4/5" />
        </div>
        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-7">
              <S className="w-14 h-14 rounded-xl mb-6" />
              <S className="h-7 w-3/4 mb-3" />
              <S className="h-4 w-full mb-2" />
              <S className="h-4 w-11/12 mb-2" />
              <S className="h-4 w-4/5" />
            </div>
          ))}
        </div>
        {/* CTA banner */}
        <div className="mt-12 glass-card rounded-2xl p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <S className="h-8 w-72 mb-2" />
            <S className="h-4 w-56" />
          </div>
          <S className="h-11 w-36 rounded-md shrink-0" />
        </div>
      </div>
    </section>
  );
}

// ─── Projects ─────────────────────────────────────────────────────────────────
export function ProjectsSkeleton() {
  return (
    <section
      className="py-24 md:py-36 relative overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
          <div>
            <S className="h-4 w-24 mb-6" />
            <S className="h-14 w-48 mb-2" />
            <S className="h-14 w-40" />
          </div>
          {/* Filter tabs */}
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <S key={i} className="h-8 w-20 rounded-full" />
            ))}
          </div>
        </div>
        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card rounded-2xl overflow-hidden flex flex-col">
              <S className="h-68 w-full" />
              <div className="p-6 flex flex-col flex-1">
                <S className="h-7 w-3/4 mb-3" />
                <S className="h-4 w-full mb-2" />
                <S className="h-4 w-5/6 mb-4" />
                <div className="flex gap-1.5 mb-4">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <S key={j} className="h-6 w-14 rounded-md" />
                  ))}
                </div>
                <div className="flex gap-3">
                  <S className="h-4 w-16" />
                  <S className="h-4 w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Load more */}
        <div className="text-center mt-12">
          <S className="h-11 w-52 rounded-md mx-auto" />
        </div>
      </div>
    </section>
  );
}

// ─── Experience ───────────────────────────────────────────────────────────────
export function ExperienceSkeleton() {
  return (
    <section
      className="py-24 md:py-36 relative overflow-hidden"
      style={{ background: "var(--bg-2)" }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <S className="h-4 w-28 mx-auto mb-6" />
          <S className="h-14 w-64 mx-auto mb-4" />
          <S className="h-4 w-80 mx-auto mb-2" />
          <S className="h-4 w-64 mx-auto" />
        </div>
        {/* Timeline */}
        <div className="relative">
          <div className="space-y-10">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`relative flex flex-col sm:flex-row gap-6 sm:gap-0 ${
                  i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"
                }`}
              >
                {/* Dot */}
                <div className="absolute left-4 sm:left-1/2 top-6 sm:top-8 -translate-x-1/2 z-10">
                  <S className="w-4 h-4 rounded-full" />
                </div>
                <div className="hidden sm:block sm:w-1/2" />
                <div
                  className={`pl-12 sm:pl-0 sm:w-1/2 ${
                    i % 2 === 0 ? "sm:pl-10" : "sm:pr-10"
                  }`}
                >
                  <div className="glass-card rounded-2xl p-6">
                    <S className="h-6 w-28 rounded-full mb-4" />
                    <S className="h-6 w-3/4 mb-2" />
                    <S className="h-4 w-1/2 mb-4" />
                    <S className="h-4 w-full mb-2" />
                    <S className="h-4 w-11/12 mb-2" />
                    <S className="h-4 w-4/5 mb-4" />
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <S key={j} className="h-6 w-16 rounded-md" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
export function TestimonialsSkeleton() {
  return (
    <section
      className="py-24 md:py-36 relative overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <S className="h-4 w-24 mx-auto mb-6" />
          <S className="h-14 w-56 mx-auto mb-2" />
          <S className="h-14 w-16 mx-auto mb-4" />
          <S className="h-4 w-80 mx-auto mb-2" />
          <S className="h-4 w-64 mx-auto" />
        </div>
        {/* Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-7 flex flex-col">
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <S key={j} className="w-3.5 h-3.5 rounded-sm" />
                ))}
              </div>
              <S className="h-4 w-full mb-2" />
              <S className="h-4 w-11/12 mb-2" />
              <S className="h-4 w-4/5 mb-2" />
              <S className="h-4 w-full mb-2" />
              <S className="h-4 w-3/4 mb-6" />
              {/* Author */}
              <div className="flex items-center gap-4 pt-5 border-t border-[var(--border)]">
                <S className="w-11 h-11 rounded-full shrink-0" />
                <div>
                  <S className="h-4 w-28 mb-1.5" />
                  <S className="h-3 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Satisfaction strip */}
        <div className="mt-12 glass-card rounded-2xl px-8 py-6 flex flex-wrap items-center justify-center gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="text-center">
              <S className="h-8 w-14 mx-auto mb-2" />
              <S className="h-3 w-24 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Contact ──────────────────────────────────────────────────────────────────
export function ContactSkeleton() {
  return (
    <section
      className="py-24 md:py-36 relative overflow-hidden"
      style={{ background: "var(--bg-2)" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <S className="h-4 w-28 mx-auto mb-6" />
          <S className="h-14 w-full max-w-xl mx-auto mb-2" />
          <S className="h-14 w-64 mx-auto mb-4" />
          <S className="h-4 w-80 mx-auto mb-2" />
          <S className="h-4 w-64 mx-auto" />
        </div>
        <div className="grid lg:grid-cols-[1fr_1.6fr] gap-10">
          {/* Left */}
          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-6">
              <S className="h-4 w-44 rounded-full mb-4" />
              <S className="h-8 w-48 mb-2" />
              <S className="h-8 w-32 mb-3" />
              <S className="h-4 w-full mb-2" />
              <S className="h-4 w-11/12" />
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card rounded-xl p-4 flex items-center gap-4">
                <S className="w-10 h-10 rounded-xl shrink-0" />
                <div className="min-w-0 flex-1">
                  <S className="h-3 w-16 mb-2" />
                  <S className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
          {/* Right – form */}
          <div className="glass-card rounded-2xl p-8">
            <div className="grid sm:grid-cols-2 gap-5 mb-5">
              {[1, 2].map((i) => (
                <div key={i}>
                  <S className="h-3 w-24 mb-2" />
                  <S className="h-12 w-full rounded-xl" />
                </div>
              ))}
            </div>
            <div className="mb-5">
              <S className="h-3 w-20 mb-2" />
              <S className="h-12 w-full rounded-xl" />
            </div>
            <div className="mb-5">
              <S className="h-3 w-20 mb-2" />
              <S className="h-36 w-full rounded-xl" />
            </div>
            <S className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
