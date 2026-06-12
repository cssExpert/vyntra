import type { TextImageData } from "@/lib/themes/types";

export default function TextImage({ data }: { data: TextImageData }) {
  const imageRight = data.imagePosition === "right";
  const hasImage = !!data.image;
  return (
    <section className="py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className={`flex flex-col ${imageRight ? "md:flex-row" : "md:flex-row-reverse"} gap-10 items-center`}>
          {hasImage && (
            <div className="w-full md:w-1/2">
              <img src={data.image} alt={data.heading} className="w-full rounded-xl object-cover" style={{ maxHeight: 400 }} />
            </div>
          )}
          <div className={hasImage ? "w-full md:w-1/2" : "w-full max-w-2xl mx-auto"}>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{data.heading}</h2>
            {data.paragraphs.map((p, i) => (
              <p key={i} className="text-gray-600 leading-relaxed mb-3">{p}</p>
            ))}
            {data.ctaText && data.ctaUrl && (
              <a href={data.ctaUrl} className="inline-block mt-3 px-6 py-3 rounded-lg bg-orange-500 text-white text-sm font-semibold">
                {data.ctaText}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
