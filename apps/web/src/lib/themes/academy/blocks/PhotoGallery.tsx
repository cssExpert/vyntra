import type { PhotoGalleryData } from "@/lib/themes/types";
import { NAVY, GOLD, SERIF } from "../theme";

export default function PhotoGallery({ data }: { data: PhotoGalleryData }) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          {data.eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: GOLD }}>{data.eyebrow}</p>}
          <h2 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: SERIF, color: NAVY }}>{data.title}</h2>
          {data.subtitle && <p className="text-gray-600 mt-3">{data.subtitle}</p>}
        </div>
        <div className="columns-2 sm:columns-3 gap-4 [&>*]:mb-4">
          {data.images.map((img, i) => (
            <div key={i} className="relative rounded-lg overflow-hidden break-inside-avoid group">
              {img.image && <img src={img.image} alt={img.caption ?? ""} className="w-full object-cover" />}
              {img.caption && (
                <p
                  className="absolute bottom-0 left-0 right-0 p-2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `${NAVY}cc` }}
                >
                  {img.caption}
                </p>
              )}
            </div>
          ))}
        </div>
        {data.linkText && data.linkUrl && (
          <div className="text-center mt-10">
            <a href={data.linkUrl} className="text-sm font-semibold hover:underline" style={{ color: NAVY }}>{data.linkText}</a>
          </div>
        )}
      </div>
    </section>
  );
}
