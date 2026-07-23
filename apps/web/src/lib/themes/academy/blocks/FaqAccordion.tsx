"use client";

import { useState } from "react";
import type { FaqAccordionData, FaqItem } from "@/lib/themes/types";
import { NAVY, GOLD, SERIF } from "../theme";

function AccordionItem({ item, defaultOpen }: { item: FaqItem; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="border-b py-4" style={{ borderColor: `${GOLD}33` }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-left gap-4"
      >
        <span className="font-semibold" style={{ color: NAVY }}>{item.question}</span>
        <span className="shrink-0" style={{ color: GOLD }}>{open ? "–" : "+"}</span>
      </button>
      {open && <p className="text-sm text-gray-600 leading-relaxed mt-2">{item.answer}</p>}
    </div>
  );
}

export default function FaqAccordion({ data }: { data: FaqAccordionData }) {
  const groups = data.groups?.length ? data.groups : null;
  const items = data.items?.length ? data.items : [];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          {data.eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-4" style={{ color: GOLD }}>{data.eyebrow}</p>}
          <h2 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: SERIF, color: NAVY }}>{data.title}</h2>
          {data.subtitle && <p className="text-gray-600 mt-3">{data.subtitle}</p>}
        </div>

        {groups ? (
          <div className="space-y-12">
            {groups.map((g, gi) => (
              <div key={gi}>
                <h3 className="text-lg font-bold" style={{ fontFamily: SERIF, color: NAVY }}>{g.category}</h3>
                {g.intro && <p className="text-sm text-gray-500 mt-1 mb-2">{g.intro}</p>}
                <div>
                  {g.items.map((item, i) => (
                    <AccordionItem key={i} item={item} defaultOpen={gi === 0 && i === 0} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {items.map((item, i) => (
              <AccordionItem key={i} item={item} defaultOpen={i === 0} />
            ))}
          </div>
        )}

        {data.linkText && data.linkUrl && (
          <div className="text-center mt-10">
            <a href={data.linkUrl} className="text-sm font-semibold hover:underline" style={{ color: NAVY }}>{data.linkText}</a>
          </div>
        )}
      </div>
    </section>
  );
}
