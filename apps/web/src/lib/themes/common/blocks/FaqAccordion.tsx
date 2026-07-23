"use client";

import { useState } from "react";
import type { FaqAccordionData, FaqItem } from "@/lib/themes/types";

function AccordionItem({ item, defaultOpen }: { item: FaqItem; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="border-b border-gray-200 py-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-left gap-4"
      >
        <span className="font-semibold text-gray-800">{item.question}</span>
        <span className="text-gray-400 shrink-0">{open ? "–" : "+"}</span>
      </button>
      {open && <p className="text-sm text-gray-600 leading-relaxed mt-2">{item.answer}</p>}
    </div>
  );
}

export default function FaqAccordion({ data }: { data: FaqAccordionData }) {
  const groups = data.groups?.length ? data.groups : null;
  const items = data.items?.length ? data.items : [];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          {data.eyebrow && <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">{data.eyebrow}</p>}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">{data.title}</h2>
          {data.subtitle && <p className="text-gray-600 mt-2">{data.subtitle}</p>}
        </div>

        {groups ? (
          <div className="space-y-10">
            {groups.map((g, gi) => (
              <div key={gi}>
                <h3 className="text-lg font-bold text-gray-800">{g.category}</h3>
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
          <div className="text-center mt-8">
            <a href={data.linkUrl} className="text-sm font-semibold text-gray-800 hover:underline">{data.linkText}</a>
          </div>
        )}
      </div>
    </section>
  );
}
