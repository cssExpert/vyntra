import type { PhotoGalleryData } from "@/lib/themes/types";

export default function PhotoGallery({ data }: { data: PhotoGalleryData }) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          {data.eyebrow && <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">{data.eyebrow}</p>}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">{data.title}</h2>
          {data.subtitle && <p className="text-gray-600 mt-2">{data.subtitle}</p>}
        </div>
        <div className="columns-2 sm:columns-3 gap-4 [&>*]:mb-4">
          {data.images.map((img, i) => (
            <div key={i} className="relative rounded-lg overflow-hidden break-inside-avoid group">
              {img.image && <img src={img.image} alt={img.caption ?? ""} className="w-full object-cover" />}
              {img.caption && (
                <p className="absolute bottom-0 left-0 right-0 p-2 text-xs text-white bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  {img.caption}
                </p>
              )}
            </div>
          ))}
        </div>
        {data.linkText && data.linkUrl && (
          <div className="text-center mt-8">
            <a href={data.linkUrl} className="text-sm font-semibold text-gray-800 hover:underline">{data.linkText}</a>
          </div>
        )}
      </div>
    </section>
  );
}
