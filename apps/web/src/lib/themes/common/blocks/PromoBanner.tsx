"use client";
import type { PromoBannerData } from "@/lib/themes/types";

export default function PromoBanner({ data }: { data: PromoBannerData }) {
  return (
    <section className="py-16 px-6 bg-gray-900 text-white">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1">
          {data.badge && <span className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 block">{data.badge}</span>}
          <h2 className="text-3xl font-bold mb-3">{data.title}</h2>
          {data.description && <p className="text-gray-400 mb-6">{data.description}</p>}
          <div className="flex gap-3 flex-wrap">
            <a href={data.primaryCtaUrl} className="inline-block bg-white text-gray-900 font-semibold px-6 py-2.5 rounded-lg">{data.primaryCtaText}</a>
            {data.secondaryCtaText && <a href={data.secondaryCtaUrl ?? "#"} className="inline-block border border-white/40 text-white font-semibold px-6 py-2.5 rounded-lg">{data.secondaryCtaText}</a>}
          </div>
        </div>
        {data.image && <img src={data.image} alt="" className="w-full md:w-64 rounded-xl object-cover" />}
      </div>
    </section>
  );
}
