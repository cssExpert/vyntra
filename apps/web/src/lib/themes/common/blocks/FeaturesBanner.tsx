"use client";
import type { FeaturesBannerData } from "@/lib/themes/types";

export default function FeaturesBanner({ data }: { data: FeaturesBannerData }) {
  return (
    <section className="py-10 px-6 bg-gray-50 border-y border-gray-200">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
        {data.features.map((f, i) => (
          <div key={i} className="flex flex-col items-center text-center gap-2">
            <span className="text-2xl">📦</span>
            <p className="text-sm font-semibold text-gray-800">{f.title}</p>
            <p className="text-xs text-gray-500">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
