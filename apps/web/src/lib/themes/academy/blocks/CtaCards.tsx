import type { CtaCardsData } from "@/lib/themes/types";
import { NAVY, GOLD, SERIF } from "../theme";

export default function CtaCards({ data }: { data: CtaCardsData }) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 grid sm:grid-cols-2 gap-6">
        {data.cards.map((c, i) => {
          const navy = c.tone === "navy";
          return (
            <div
              key={i}
              className="rounded-lg p-9 text-center"
              style={navy ? { background: NAVY, color: "#fff" } : { background: "#faf8f4", color: NAVY, border: `1px solid ${GOLD}44` }}
            >
              <h3 className="text-lg font-bold mb-3" style={{ fontFamily: SERIF }}>{c.title}</h3>
              <p className={`text-sm leading-relaxed mb-7 ${navy ? "text-gray-300" : "text-gray-600"}`}>{c.description}</p>
              <a
                href={c.ctaUrl}
                className="inline-block px-7 py-3 rounded text-sm font-semibold"
                style={navy ? { background: GOLD, color: NAVY } : { background: NAVY, color: "#fff" }}
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
