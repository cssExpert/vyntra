import type { TextImageData } from "@/lib/themes/types";

export default function TextImage({ data }: { data: TextImageData }) {
  const imageRight = data.imagePosition === "right";
  const hasImage = !!data.image;

  return (
    <section className="py-16 bg-white dark:bg-[#121214]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className={`flex flex-col ${imageRight ? "md:flex-row" : "md:flex-row-reverse"} gap-12 items-center`}>
          {hasImage && (
            <div className="w-full md:w-1/2">
              <img
                src={data.image}
                alt={data.heading}
                className="w-full rounded-2xl object-cover shadow-lg"
                style={{ maxHeight: 440 }}
              />
            </div>
          )}

          <div className={hasImage ? "w-full md:w-1/2" : "w-full max-w-3xl mx-auto"}>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 leading-snug">
              {data.heading}
            </h2>
            {data.paragraphs.map((p, i) => (
              <p key={i} className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 text-base">
                {p}
              </p>
            ))}
            {data.ctaText && data.ctaUrl && (
              <a
                href={data.ctaUrl}
                className="inline-block mt-4 px-7 py-3 rounded-lg font-semibold text-sm text-white bg-[#e4611e] transition-opacity hover:opacity-90"
              >
                {data.ctaText}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
