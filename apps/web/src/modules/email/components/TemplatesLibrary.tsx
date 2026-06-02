"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Toast } from "../types";

interface TemplateCard {
  name: string;
  category: string;
  imgBg: string;
  rate: string;
}

const LAYOUTS: TemplateCard[] = [
  { name: "Elegant Welcome",          category: "Onboarding",    imgBg: "from-pink-500 to-primary",     rate: "71% avg open" },
  { name: "SaaS Dashboard Pitch",     category: "Conversion",    imgBg: "from-blue-600 to-emerald-500", rate: "64% avg open" },
  { name: "Abandoned Recovery",       category: "Transactional", imgBg: "from-purple-600 to-pink-500",  rate: "82% avg open" },
  { name: "Interactive Event Invite", category: "Events",        imgBg: "from-amber-500 to-orange-500", rate: "59% avg open" },
  { name: "Community Feedback Block", category: "Nurture",       imgBg: "from-teal-400 to-primary",     rate: "74% avg open" },
  { name: "System Outage Notice",     category: "Alerts",        imgBg: "from-rose-600 to-amber-500",   rate: "92% avg open" },
];

interface TemplatesLibraryProps {
  notify: (msg: string, type?: Toast["type"]) => void;
}

export function TemplatesLibrary({ notify }: TemplatesLibraryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {LAYOUTS.map((layout, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.3, ease: "easeOut" }}
          whileHover={{ y: -4 }}
          className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col h-80 hover:border-primary/30 hover:shadow-glass transition-all duration-200"
        >
          {/* Gradient thumbnail */}
          <div className={cn("h-1/2 bg-gradient-to-tr p-5 flex flex-col justify-between", layout.imgBg)}>
            <span className="text-[10px] font-bold bg-black/30 backdrop-blur-md text-white border border-white/20 px-2 py-0.5 rounded-full w-max">
              {layout.category}
            </span>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/10 space-y-1.5">
              <div className="w-1/3 h-1.5 rounded bg-white/40" />
              <div className="w-full h-1.5 rounded bg-white/20" />
              <div className="w-4/5 h-1.5 rounded bg-white/20" />
            </div>
          </div>

          {/* Details */}
          <div className="p-5 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-sm text-foreground">{layout.name}</h4>
                <span className="text-[11px] font-bold text-success">{layout.rate}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Perfect for driving engagement with highly curated aesthetic patterns.
              </p>
            </div>
            <button
              onClick={() => notify(`Loaded "${layout.name}" layout context`)}
              className="w-full py-2 bg-primary/10 border border-primary/20 text-primary text-xs font-bold rounded-xl hover:bg-primary/20 transition-all"
            >
              Configure Template Layout
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
