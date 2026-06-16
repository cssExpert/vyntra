"use client";

import { useState } from "react";
import { MoveLeft, MoveRight, Plus, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAIStudioStore } from "@/store/aiStudioStore";
import type { StandardPage } from "@/types/ai-studio";
import { nanoid } from "nanoid";
import { cn } from "@/lib/utils";

const STANDARD_PAGES: { value: StandardPage; label: string; description: string; recommended?: boolean }[] = [
  { value: "home", label: "Home", description: "Landing page and first impression", recommended: true },
  { value: "about", label: "About", description: "Your story, team, and mission", recommended: true },
  { value: "services", label: "Services", description: "What you offer and how it works", recommended: true },
  { value: "pricing", label: "Pricing", description: "Plans, packages, and pricing tiers" },
  { value: "portfolio", label: "Portfolio", description: "Showcase your best work" },
  { value: "case-studies", label: "Case Studies", description: "In-depth client success stories" },
  { value: "blog", label: "Blog", description: "Articles, news, and insights" },
  { value: "faq", label: "FAQ", description: "Common questions answered" },
  { value: "contact", label: "Contact", description: "Contact form and location info", recommended: true },
];

export function Step3PageSelection({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { wizard, setPageSelection } = useAIStudioStore();
  const { standard, custom } = wizard.pageSelection;

  const [newPageName, setNewPageName] = useState("");
  const [adding, setAdding] = useState(false);

  function togglePage(page: StandardPage) {
    const next = standard.includes(page)
      ? standard.filter((p) => p !== page)
      : [...standard, page];
    setPageSelection({ standard: next });
  }

  function addCustomPage() {
    if (!newPageName.trim()) return;
    const slug = newPageName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    setPageSelection({
      custom: [...custom, { id: nanoid(), name: newPageName.trim(), slug }],
    });
    setNewPageName("");
    setAdding(false);
  }

  function removeCustom(id: string) {
    setPageSelection({ custom: custom.filter((p) => p.id !== id) });
  }

  const totalPages = standard.length + custom.length;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Select Pages</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Choose which pages to include. AI will generate content for each one.
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary">{totalPages} page{totalPages !== 1 ? "s" : ""}</span>
            </div>
          </div>

          {/* Standard pages */}
          <div>
            <p className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wide">Standard Pages</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STANDARD_PAGES.map((page) => {
                const selected = standard.includes(page.value);
                return (
                  <button
                    key={page.value}
                    type="button"
                    onClick={() => togglePage(page.value)}
                    className={cn(
                      "flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all",
                      selected
                        ? "bg-primary/10 border-primary ring-1 ring-primary/20"
                        : "border-border hover:border-primary/40",
                    )}
                  >
                    <div
                      className={cn(
                        "w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-colors",
                        selected ? "bg-primary border-primary" : "border-border",
                      )}
                    >
                      {selected && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className={cn("text-sm font-semibold", selected ? "text-primary" : "text-foreground")}>
                          {page.label}
                        </span>
                        {page.recommended && (
                          <span className="text-[10px] font-medium text-success bg-success/10 px-1.5 py-0.5 rounded-full">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{page.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom pages */}
          <div>
            <p className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wide">Custom Pages</p>

            {custom.length > 0 && (
              <div className="flex flex-col gap-2 mb-3">
                {custom.map((page) => (
                  <div key={page.id} className="flex items-center justify-between px-3.5 py-3 rounded-xl border border-primary/30 bg-primary/5">
                    <div>
                      <p className="text-sm font-semibold text-primary">{page.name}</p>
                      <p className="text-xs text-muted-foreground">/{page.slug}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCustom(page.id)}
                      className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {adding ? (
              <div className="flex gap-2">
                <Input
                  autoFocus
                  value={newPageName}
                  onChange={(e) => setNewPageName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addCustomPage(); if (e.key === "Escape") setAdding(false); }}
                  placeholder="e.g. Team, Careers, Press Kit"
                  className="flex-1"
                />
                <Button onClick={addCustomPage} disabled={!newPageName.trim()} size="sm">Add</Button>
                <Button variant="outline" size="sm" onClick={() => setAdding(false)}>Cancel</Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-border hover:border-primary/40 text-muted-foreground hover:text-foreground text-sm transition-colors w-full"
              >
                <Plus className="w-4 h-4" />
                Add Custom Page
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 border-t border-border px-6 py-4 flex justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <MoveLeft className="w-4 h-4" />
          Back
        </Button>
        <Button onClick={onNext} disabled={totalPages === 0} className="gap-2">
          Generate Website
          <Sparkles className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
