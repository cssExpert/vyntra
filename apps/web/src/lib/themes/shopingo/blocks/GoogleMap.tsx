"use client";

import type { GoogleMapData } from "@/lib/themes/types";

export default function GoogleMap({ data }: { data: GoogleMapData }) {
  const address = data.address?.trim();
  const zoom = data.zoom ?? 11;
  const height = data.height ?? 420;
  const src = address
    ? `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=${zoom}&output=embed`
    : null;

  return (
    <section className="py-16 bg-[#f5f5f5] dark:bg-[#151518]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {data.title && (
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">{data.title}</h2>
        )}
        <div
          className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700"
          style={{ height }}
        >
          {src ? (
            <iframe
              src={src}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              title={data.title ?? "Store location map"}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-gray-400 bg-gray-100 dark:bg-[#1c1c1e]">
              Add an address to show the map
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
