"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, MoveRight, MoveLeft } from "lucide-react";
import { Sketch } from "@uiw/react-color";
import { Button } from "@/components/ui/button";
import { useAIStudioStore } from "@/store/aiStudioStore";
import type { WebsiteStyle, WebsiteLayout } from "@/types/ai-studio";
import { cn } from "@/lib/utils";

// ── Style options ─────────────────────────────────────────────────────────────

const STYLES: { value: WebsiteStyle; label: string; description: string; emoji: string }[] = [
  { value: "modern", label: "Modern", description: "Clean, bold, contemporary", emoji: "⚡" },
  { value: "corporate", label: "Corporate", description: "Professional, trustworthy, structured", emoji: "🏢" },
  { value: "luxury", label: "Luxury", description: "Elegant, premium, high-end", emoji: "💎" },
  { value: "startup", label: "Startup", description: "Dynamic, innovative, energetic", emoji: "🚀" },
  { value: "minimal", label: "Minimal", description: "Simple, focused, whitespace-driven", emoji: "◻️" },
  { value: "creative", label: "Creative", description: "Bold, expressive, artistic", emoji: "🎨" },
];

const LAYOUTS: { value: WebsiteLayout; label: string; description: string; pages: string }[] = [
  { value: "service-business", label: "Service Business", description: "For agencies, clinics, consultancies", pages: "Home, Services, About, Contact" },
  { value: "saas", label: "SaaS / Product", description: "For software and digital products", pages: "Home, Pricing, Features, Blog" },
  { value: "ecommerce", label: "E-commerce", description: "For online stores and retail", pages: "Home, Products, About, Contact" },
  { value: "portfolio", label: "Portfolio", description: "For freelancers and creatives", pages: "Home, Work, About, Contact" },
  { value: "blog", label: "Blog / Media", description: "For content and publishing", pages: "Home, Blog, About, Contact" },
];

const TYPOGRAPHY_OPTIONS = [
  "Modern & Sans-serif",
  "Classic & Serif",
  "Geometric & Bold",
  "Humanist & Friendly",
  "Minimal & Clean",
];

const VISUAL_STYLES = [
  "Clean & White",
  "Dark & Bold",
  "Gradient & Vibrant",
  "Earthy & Warm",
  "Cool & Professional",
];

const SWATCH_PRESETS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#f97316",
  "#eab308", "#22c55e", "#14b8a6", "#0ea5e9", "#64748b",
  "#000000", "#ffffff",
];

// ── Mini color picker ─────────────────────────────────────────────────────────

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top?: number; bottom?: number; left: number }>({ left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  function toggle() {
    if (!open && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      const left = Math.min(r.left, window.innerWidth - 220);
      setCoords(
        window.innerHeight - r.bottom >= 310
          ? { top: r.bottom + 4, left }
          : { bottom: window.innerHeight - r.top + 4, left },
      );
    }
    setOpen((v) => !v);
  }

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!triggerRef.current?.contains(t) && !popRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  return (
    <div>
      <label className="block text-xs font-semibold text-foreground mb-1.5">{label}</label>
      <div ref={triggerRef}>
        <button
          type="button"
          onClick={toggle}
          className="w-full flex items-center gap-2.5 border border-border rounded-lg px-3 h-10 hover:border-primary/60 transition-colors bg-background"
        >
          <span className="w-6 h-6 rounded-md border border-black/10 shrink-0 shadow-sm" style={{ backgroundColor: value }} />
          <span className="text-xs font-mono text-foreground uppercase flex-1 text-left">{value}</span>
          <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", open && "rotate-180")} />
        </button>
      </div>
      {open && typeof document !== "undefined" && createPortal(
        <div
          ref={popRef}
          style={{
            position: "fixed",
            ...(coords.top !== undefined ? { top: coords.top } : { bottom: coords.bottom }),
            left: coords.left,
            zIndex: 99999,
          }}
          className="drop-shadow-xl rounded-md overflow-hidden border border-border"
        >
          <Sketch
            color={value}
            presetColors={SWATCH_PRESETS}
            onChange={(c) => onChange(c.hex)}
            style={{ "--sketch-background": "hsl(var(--card))" } as React.CSSProperties}
          />
        </div>,
        document.body,
      )}
    </div>
  );
}

// ── Step component ────────────────────────────────────────────────────────────

export function Step2DesignPreferences({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  const { wizard, setDesignPreferences } = useAIStudioStore();
  const prefs = wizard.designPreferences;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
          <div>
            <h2 className="text-xl font-bold text-foreground">Design Preferences</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Choose the visual direction and layout for your website.
            </p>
          </div>

          {/* Style */}
          <div>
            <p className="text-xs font-semibold text-foreground mb-3">Website Style</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {STYLES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setDesignPreferences({ style: s.value })}
                  className={cn(
                    "flex flex-col gap-1.5 p-4 rounded-xl border text-left transition-all",
                    prefs.style === s.value
                      ? "bg-primary/10 border-primary ring-1 ring-primary/30"
                      : "border-border hover:border-primary/40",
                  )}
                >
                  <span className="text-2xl">{s.emoji}</span>
                  <span className={cn("text-sm font-bold", prefs.style === s.value ? "text-primary" : "text-foreground")}>
                    {s.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{s.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Layout */}
          <div>
            <p className="text-xs font-semibold text-foreground mb-3">Website Layout</p>
            <div className="flex flex-col gap-2">
              {LAYOUTS.map((l) => (
                <button
                  key={l.value}
                  type="button"
                  onClick={() => setDesignPreferences({ layout: l.value })}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border text-left transition-all",
                    prefs.layout === l.value
                      ? "bg-primary/10 border-primary ring-1 ring-primary/30"
                      : "border-border hover:border-primary/40",
                  )}
                >
                  <div>
                    <p className={cn("text-sm font-bold", prefs.layout === l.value ? "text-primary" : "text-foreground")}>
                      {l.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{l.description}</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground text-right max-w-[140px] leading-relaxed">
                    {l.pages}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <p className="text-xs font-semibold text-foreground mb-3">Brand Colors</p>
            <div className="grid grid-cols-2 gap-4">
              <ColorPicker label="Primary Color" value={prefs.primaryColor} onChange={(v) => setDesignPreferences({ primaryColor: v })} />
              <ColorPicker label="Secondary Color" value={prefs.secondaryColor} onChange={(v) => setDesignPreferences({ secondaryColor: v })} />
            </div>
          </div>

          {/* Typography */}
          <div>
            <p className="text-xs font-semibold text-foreground mb-3">Typography Preference</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TYPOGRAPHY_OPTIONS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setDesignPreferences({ typographyPreference: t })}
                  className={cn(
                    "px-3 py-2.5 rounded-lg border text-xs font-medium text-left transition-colors",
                    prefs.typographyPreference === t
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Visual Style */}
          <div>
            <p className="text-xs font-semibold text-foreground mb-3">Visual Style</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {VISUAL_STYLES.map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setDesignPreferences({ visualStyle: v })}
                  className={cn(
                    "px-3 py-2.5 rounded-lg border text-xs font-medium text-left transition-colors",
                    prefs.visualStyle === v
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40",
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 border-t border-border px-6 py-4 flex justify-between">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <MoveLeft className="w-4 h-4" />
          Back
        </Button>
        <Button onClick={onNext} className="gap-2">
          Select Pages
          <MoveRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
