"use client";
import type { NewsletterData } from "@/lib/themes/types";

export default function Newsletter({ data }: { data: NewsletterData }) {
  return (
    <section className="py-16 px-6 bg-gray-900 text-white text-center">
      <div className="max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-2">{data.title}</h2>
        {data.subtitle && <p className="text-gray-400 mb-8">{data.subtitle}</p>}
        <div className="flex gap-2 max-w-md mx-auto">
          <input type="email" placeholder={data.placeholder} className="flex-1 px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm outline-none" />
          <button className="bg-white text-gray-900 px-5 py-2.5 rounded-lg text-sm font-semibold shrink-0">{data.buttonText}</button>
        </div>
      </div>
    </section>
  );
}
