"use client";

import type { GoogleMapData } from "@/lib/themes/types";

export default function GoogleMap({ data }: { data: GoogleMapData }) {
  const address = data.address?.trim();
  const zoom = data.zoom ?? 11;
  const height = data.height ?? 380;
  const src = address
    ? `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=${zoom}&output=embed`
    : null;

  return (
    <section className="py-14 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {data.title && <h2 className="text-xl font-bold text-gray-800 mb-4">{data.title}</h2>}
        <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height }}>
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
            <div className="w-full h-full flex items-center justify-center text-sm text-gray-400 bg-gray-100">
              Add an address to show the map
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
