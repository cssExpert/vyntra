import type { CtaCardsData } from "@/lib/themes/types";

export default function CtaCards({ data }: { data: CtaCardsData }) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 grid sm:grid-cols-2 gap-6">
        {data.cards.map((c, i) => {
          const navy = c.tone === "navy";
          return (
            <div
              key={i}
              className="rounded-xl p-8 text-center"
              style={navy ? { background: "#111827", color: "#fff" } : { background: "#f9fafb", color: "#1f2937" }}
            >
              <h3 className="text-lg font-bold mb-2">{c.title}</h3>
              <p className={`text-sm leading-relaxed mb-6 ${navy ? "text-gray-300" : "text-gray-600"}`}>{c.description}</p>
              <a
                href={c.ctaUrl}
                className="inline-block px-6 py-3 rounded-lg text-sm font-semibold"
                style={navy ? { background: "#fff", color: "#111827" } : { background: "#111827", color: "#fff" }}
              >
                {c.ctaText}
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
}
