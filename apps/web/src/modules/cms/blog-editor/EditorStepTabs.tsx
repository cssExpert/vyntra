"use client";

import React from "react";
import { PenTool, Tag, Globe, Settings, type LucideIcon } from "lucide-react";

export type EditorTab = "editor" | "metadata" | "seo" | "publish";

const TABS: { id: EditorTab; label: string; icon: LucideIcon }[] = [
  { id: "editor", label: "1. Writing Space", icon: PenTool },
  { id: "metadata", label: "2. Metadata Tags", icon: Tag },
  { id: "seo", label: "3. SEO Preview", icon: Globe },
  { id: "publish", label: "4. Visibility Options", icon: Settings },
];

export function EditorStepTabs({
  active,
  onChange,
}: {
  active: EditorTab;
  onChange: (tab: EditorTab) => void;
}) {
  return (
    <div className="p-1 rounded-xl flex items-center gap-1 border border-border bg-card">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              isActive
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
