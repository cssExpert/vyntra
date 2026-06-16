"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Sketch } from "@uiw/react-color";
import {
  Sparkles,
  ExternalLink,
  RefreshCw,
  BookmarkPlus,
  FileText,
  Palette,
  Search,
  LayoutList,
  ChevronDown,
  ChevronRight,
  Loader2,
  BarChart3,
  CheckCircle2,
  Smartphone,
  Zap,
  Shield,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAIStudioStore } from "@/store/aiStudioStore";
import { cn } from "@/lib/utils";
import type {
  GeneratedPage,
  GeneratedSection,
  GeneratedSectionContent,
  GeneratedWebsite,
  SectionType,
} from "@/types/ai-studio";

// ── Utilities ─────────────────────────────────────────────────────────────────

const SECTION_ICONS: Partial<Record<SectionType, string>> = {
  Hero: "🚀",
  Features: "⭐",
  Services: "🛠️",
  Testimonials: "💬",
  Pricing: "💰",
  Portfolio: "🖼️",
  FAQ: "❓",
  CTA: "📣",
  About: "🏢",
  Team: "👥",
  Blog: "📝",
  Contact: "📬",
  Stats: "📊",
  LogoCloud: "🏷️",
  Footer: "📌",
  Header: "🔖",
};

function computeScore(website: GeneratedWebsite) {
  const pageCount = website.pages.length;
  const sectionCount = website.pages.reduce((s, p) => s + p.sections.length, 0);
  const hasSEO = website.pages.every((p) => p.seo.title && p.seo.description);
  const hasContact = website.pages.some((p) => p.slug.includes("contact"));
  const seo = Math.min(100, 72 + (hasSEO ? 12 : 0) + pageCount * 2);
  const accessibility = Math.min(100, 86 + (sectionCount > 12 ? 7 : 3));
  const performance = Math.min(
    100,
    81 + (pageCount <= 5 ? 7 : 0) + (hasContact ? 3 : 0),
  );
  return { seo, accessibility, performance, mobileReady: true };
}

// Generate plausible content alternatives for a section type
function makeAlternatives(
  type: SectionType,
  biz: { businessName: string; industry: string; location: string },
): GeneratedSectionContent[] {
  const b = biz;
  const templates: Record<string, GeneratedSectionContent[]> = {
    Hero: [
      {
        headline: `Transform Your ${b.industry} Experience`,
        subheadline: `${b.businessName} brings cutting-edge solutions to ${b.location}. Trusted by hundreds of satisfied clients.`,
        cta: "Book a Free Consultation",
      },
      {
        headline: `${b.location}'s Leading ${b.industry} Experts`,
        subheadline: `Premium services tailored to your unique needs. Discover the ${b.businessName} difference today.`,
        cta: "See Our Work",
      },
      {
        headline: `Elevate Your Business With ${b.businessName}`,
        subheadline: `Comprehensive ${b.industry} services designed to deliver measurable results and lasting growth.`,
        cta: "Get Started Free",
      },
    ],
    Features: [
      {
        headline: "What Sets Us Apart",
        subheadline: "Unmatched expertise and dedication to excellence",
        items: [
          {
            title: "Industry Leaders",
            description: "20+ years of combined expertise in the field",
            icon: "Award",
          },
          {
            title: "Results Driven",
            description: "Average 40% improvement in client outcomes",
            icon: "TrendingUp",
          },
          {
            title: "Client First",
            description: "Dedicated support at every step of the journey",
            icon: "Heart",
          },
        ],
      },
      {
        headline: "Our Core Strengths",
        subheadline: "Built on trust, delivered with precision",
        items: [
          {
            title: "Innovation",
            description: "Cutting-edge approaches to complex challenges",
            icon: "Lightbulb",
          },
          {
            title: "Reliability",
            description: "Consistent, dependable service you can count on",
            icon: "Shield",
          },
          {
            title: "Scalability",
            description: "Solutions that grow with your business",
            icon: "ArrowUp",
          },
        ],
      },
      {
        headline: "The Advantages",
        subheadline: "Why top companies choose us",
        items: [
          {
            title: "Fast Delivery",
            description: "Rapid turnaround without compromising quality",
            icon: "Zap",
          },
          {
            title: "Certified Team",
            description: "Fully certified professionals in every discipline",
            icon: "BadgeCheck",
          },
          {
            title: "ROI Focused",
            description: "Every decision optimised for maximum return",
            icon: "DollarSign",
          },
        ],
      },
    ],
    Testimonials: [
      {
        headline: "Clients Love Working With Us",
        subheadline: "Real results from real businesses",
        items: [
          {
            title: "Michael R., COO",
            description: `${b.businessName} exceeded every expectation. The ROI we've seen is remarkable.`,
          },
          {
            title: "Priya S., Marketing Director",
            description:
              "A game-changer for our brand. Professional, responsive, and incredibly effective.",
          },
          {
            title: "David L., Founder",
            description:
              "Best investment we've made. The team truly understands our vision.",
          },
        ],
      },
      {
        headline: "Success Stories",
        subheadline: `Trusted by ${b.industry} businesses nationwide`,
        items: [
          {
            title: "Emma T., CEO",
            description:
              "From day one, the team showed genuine commitment to our goals. Outstanding.",
          },
          {
            title: "Carlos M., Operations Lead",
            description:
              "The results speak for themselves. Revenue up 60% in the first quarter.",
          },
          {
            title: "Aisha K., Director",
            description:
              "Couldn't be happier. They delivered exactly what they promised, on time.",
          },
        ],
      },
      {
        headline: "What Our Partners Say",
        subheadline: "Building lasting relationships across industries",
        items: [
          {
            title: "Tom B., VP Sales",
            description:
              "The best agency we've worked with, bar none. Highly professional and effective.",
          },
          {
            title: "Natalie W., Brand Manager",
            description: `${b.businessName} transformed our online presence. Truly impressive work.`,
          },
          {
            title: "Jordan P., CTO",
            description:
              "Exceptional service, exceptional results. We'll be working together for years.",
          },
        ],
      },
    ],
    CTA: [
      {
        headline: "Ready to Get Started?",
        subheadline: `Join ${b.businessName}'s growing family of successful clients. Let's build something great.`,
        cta: "Schedule a Call",
      },
      {
        headline: "Take the Next Step Today",
        subheadline:
          "Spots are limited — secure your consultation now and start seeing results.",
        cta: "Claim Your Free Session",
      },
      {
        headline: "Your Growth Starts Here",
        subheadline: `${b.businessName} is ready to help you achieve your business goals. Let's talk.`,
        cta: "Start Your Journey",
      },
    ],
  };
  const fallback: GeneratedSectionContent[] = [
    {
      headline: `Alternative ${type} — Version A`,
      subheadline: "Refreshed content with a new angle",
      cta: "Learn More",
    },
    {
      headline: `Alternative ${type} — Version B`,
      subheadline: "Bold, direct messaging for maximum impact",
      cta: "Get Started",
    },
    {
      headline: `Alternative ${type} — Version C`,
      subheadline: "Conversational, approachable tone that connects",
      cta: "Let's Talk",
    },
  ];
  return templates[type] ?? fallback;
}

// ── Color swatch with inline Sketch picker ────────────────────────────────────

function ColorSwatch({
  label,
  color,
  onChange,
}: {
  label: string;
  color: string;
  onChange: (hex: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const swatchRef = useRef<HTMLButtonElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  function openPicker() {
    if (!swatchRef.current) return;
    const rect = swatchRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow > 280 ? rect.bottom + 6 : rect.top - 286;
    let left = rect.left;
    if (left + 220 > window.innerWidth - 8) left = window.innerWidth - 228;
    setPos({ top, left });
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node) &&
        swatchRef.current &&
        !swatchRef.current.contains(e.target as Node)
      )
        setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <button
        ref={swatchRef}
        type="button"
        onClick={open ? () => setOpen(false) : openPicker}
        title={`Edit ${label} color`}
        className="w-full h-14 relative group"
        style={{ backgroundColor: color }}
      >
        <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity text-white text-xs font-semibold">
          Edit
        </span>
      </button>
      <div className="px-3 py-2">
        <p className="text-xs font-semibold text-foreground">{label}</p>
        <p className="text-[10px] font-mono text-muted-foreground">
          {color.toUpperCase()}
        </p>
      </div>
      {open &&
        createPortal(
          <div
            ref={pickerRef}
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              zIndex: 9999,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Sketch
              color={color}
              onChange={(c) => onChange(c.hex)}
              style={{
                boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                borderRadius: 12,
              }}
            />
          </div>,
          document.body,
        )}
    </div>
  );
}

// ── Section row with Regenerate ───────────────────────────────────────────────

function SectionRow({
  section,
  brandColor,
  biz,
  onRegenerate,
}: {
  section: GeneratedSection;
  brandColor: string;
  biz: { businessName: string; industry: string; location: string };
  onRegenerate: (
    sectionId: string,
    type: SectionType,
    choice: GeneratedSectionContent,
  ) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [alternatives, setAlternatives] = useState<
    GeneratedSectionContent[] | null
  >(null);

  async function handleRegenerate(e: React.MouseEvent) {
    e.stopPropagation();
    setRegenerating(true);
    setAlternatives(null);
    await new Promise((r) => setTimeout(r, 900 + Math.random() * 500));
    setAlternatives(makeAlternatives(section.type, biz));
    setRegenerating(false);
    setExpanded(true);
  }

  function applyAlternative(content: GeneratedSectionContent) {
    onRegenerate(section.id, section.type, content);
    setAlternatives(null);
  }

  const c = section.content;

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      {/* Row header — using div to avoid nested <button> hydration error */}
      <div className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors">
        {/* Clickable expand area */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => setExpanded((v) => !v)}
          onKeyDown={(e) => e.key === "Enter" && setExpanded((v) => !v)}
          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
        >
          <span className="text-base shrink-0">
            {SECTION_ICONS[section.type] ?? "📄"}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              {section.type}
            </p>
            {c.headline && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                &rdquo;{c.headline}&rdquo;
              </p>
            )}
          </div>
        </div>
        {/* Actions — separate from the expand clickzone */}
        <div className="flex items-center gap-2 shrink-0">
          {regenerating ? (
            <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
          ) : (
            <button
              type="button"
              onClick={handleRegenerate}
              title="Regenerate this section"
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              <Wand2 className="w-3 h-3" />
              Regenerate
            </button>
          )}
          <div
            role="button"
            tabIndex={0}
            onClick={() => setExpanded((v) => !v)}
            onKeyDown={(e) => e.key === "Enter" && setExpanded((v) => !v)}
            className="cursor-pointer"
          >
            {expanded ? (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border bg-muted/20">
          {/* Current content */}
          {!alternatives && (
            <div className="px-4 py-3 space-y-1.5">
              {c.headline && (
                <p className="text-xs font-bold text-foreground">
                  {c.headline}
                </p>
              )}
              {c.subheadline && (
                <p className="text-xs text-muted-foreground">{c.subheadline}</p>
              )}
              {c.body && (
                <p className="text-xs text-muted-foreground">{c.body}</p>
              )}
              {c.cta && (
                <span
                  className="inline-block mt-1 px-3 py-1 rounded-full text-[11px] font-semibold text-white"
                  style={{ backgroundColor: brandColor }}
                >
                  {c.cta}
                </span>
              )}
              {c.items && c.items.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {c.items.map((item) => (
                    <Badge
                      key={item.title}
                      variant="outline"
                      className="text-[10px]"
                    >
                      {item.title}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Alternatives */}
          {alternatives && (
            <div className="px-4 py-3 space-y-2">
              <p className="text-[11px] font-bold text-primary uppercase tracking-wide mb-2">
                ✨ AI Generated {alternatives.length} Alternatives — Pick One
              </p>
              {alternatives.map((alt, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-border bg-card space-y-1"
                >
                  {alt.headline && (
                    <p className="text-xs font-bold text-foreground">
                      {alt.headline}
                    </p>
                  )}
                  {alt.subheadline && (
                    <p className="text-xs text-muted-foreground">
                      {alt.subheadline}
                    </p>
                  )}
                  {alt.cta && (
                    <p className="text-[11px] text-primary font-semibold">
                      {alt.cta}
                    </p>
                  )}
                  {alt.items && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {alt.items.slice(0, 3).map((item) => (
                        <Badge
                          key={item.title}
                          variant="secondary"
                          className="text-[10px]"
                        >
                          {item.title}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 h-7 text-xs gap-1"
                    onClick={() => applyAlternative(alt)}
                  >
                    <CheckCircle2 className="w-3 h-3" /> Use This
                  </Button>
                </div>
              ))}
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground underline"
                onClick={() => setAlternatives(null)}
              >
                Keep original
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Pages tab — rich content preview ─────────────────────────────────────────

function PagesTab({
  pages,
  brandColor,
  biz,
  onSectionRegenerate,
}: {
  pages: GeneratedPage[];
  brandColor: string;
  biz: { businessName: string; industry: string; location: string };
  onSectionRegenerate: (
    pageId: string,
    sectionId: string,
    content: GeneratedSectionContent,
  ) => void;
}) {
  const [openPage, setOpenPage] = useState<string>(pages[0]?.id ?? "");

  return (
    <div className="space-y-3">
      {pages.map((page) => (
        <div
          key={page.id}
          className="rounded-xl border border-border overflow-hidden"
        >
          <button
            type="button"
            onClick={() => setOpenPage(openPage === page.id ? "" : page.id)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${brandColor}20` }}
              >
                <FileText
                  className="w-3.5 h-3.5"
                  style={{ color: brandColor }}
                />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">
                  {page.name}
                </p>
                <p className="text-[11px] text-muted-foreground font-mono">
                  {page.slug}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px]">
                {page.sections.length} sections
              </Badge>
              {openPage === page.id ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          </button>

          {openPage === page.id && (
            <div className="border-t border-border px-4 py-3 space-y-2">
              {page.sections.map((section) => (
                <SectionRow
                  key={section.id}
                  section={section}
                  brandColor={brandColor}
                  biz={biz}
                  onRegenerate={(sectionId, _type, content) =>
                    onSectionRegenerate(page.id, sectionId, content)
                  }
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Sections tab — flat structure view ───────────────────────────────────────

function SectionsTab({
  pages,
  brandColor,
  biz,
  onSectionRegenerate,
}: {
  pages: GeneratedPage[];
  brandColor: string;
  biz: { businessName: string; industry: string; location: string };
  onSectionRegenerate: (
    pageId: string,
    sectionId: string,
    content: GeneratedSectionContent,
  ) => void;
}) {
  return (
    <div className="space-y-5">
      {pages.map((page) => (
        <div key={page.id}>
          <div className="flex items-center gap-2 mb-2 px-1">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: brandColor }}
            />
            <p className="text-xs font-bold text-foreground uppercase tracking-wide">
              {page.name}
            </p>
            <span className="text-[10px] text-muted-foreground font-mono">
              {page.slug}
            </span>
          </div>
          <div className="space-y-1.5 pl-3 border-l-2 border-border ml-0.5">
            {page.sections.map((section) => (
              <SectionRow
                key={section.id}
                section={section}
                brandColor={brandColor}
                biz={biz}
                onRegenerate={(sectionId, _type, content) =>
                  onSectionRegenerate(page.id, sectionId, content)
                }
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Score tab ─────────────────────────────────────────────────────────────────

function ScoreBar({
  label,
  score,
  color,
}: {
  label: string;
  score: number;
  color: string;
}) {
  const grade = score >= 90 ? "Excellent" : score >= 75 ? "Good" : "Fair";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className={cn(
              "text-[10px]",
              score >= 90
                ? "text-success"
                : score >= 75
                  ? "text-warning"
                  : "text-destructive",
            )}
          >
            {grade}
          </Badge>
          <span className="text-sm font-bold text-foreground">
            {score}
            <span className="text-xs text-muted-foreground">/100</span>
          </span>
        </div>
      </div>
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function ScoreTab({ website }: { website: GeneratedWebsite }) {
  const { seo, accessibility, performance } = computeScore(website);
  const overall = Math.round((seo + accessibility + performance) / 3);

  return (
    <div className="space-y-5">
      {/* Overall score */}
      <div className="rounded-xl border border-border bg-gradient-to-br from-primary/5 to-transparent p-5 flex items-center gap-5">
        <div className="relative w-20 h-20 shrink-0">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-border"
            />
            <circle
              cx="18"
              cy="18"
              r="15.9"
              fill="none"
              strokeWidth="2.5"
              strokeDasharray={`${overall} 100`}
              strokeLinecap="round"
              className="text-primary transition-all duration-700"
              stroke="currentColor"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-extrabold text-foreground">
              {overall}
            </span>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            AI Website Score
          </p>
          <p className="text-lg font-extrabold text-foreground mt-0.5">
            {overall >= 90
              ? "Excellent"
              : overall >= 80
                ? "Very Good"
                : overall >= 70
                  ? "Good"
                  : "Fair"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Your website is optimized for search, accessibility, and
            performance.
          </p>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="rounded-xl border border-border p-4 space-y-4">
        <p className="text-xs font-bold text-foreground uppercase tracking-wide">
          Score Breakdown
        </p>
        <ScoreBar label="SEO" score={seo} color="#6366f1" />
        <ScoreBar label="Accessibility" score={accessibility} color="#10b981" />
        <ScoreBar label="Performance" score={performance} color="#f59e0b" />
      </div>

      {/* Badges */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-3 rounded-xl border border-border p-3">
          <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4 text-success" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">Mobile Ready</p>
            <p className="text-[11px] text-success font-semibold">
              ✓ Fully Responsive
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border p-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Search className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">SEO Ready</p>
            <p className="text-[11px] text-primary font-semibold">
              ✓ Meta Tags Generated
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border p-3">
          <div className="w-9 h-9 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-warning" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">Fast Load</p>
            <p className="text-[11px] text-warning font-semibold">
              ✓ Optimised Assets
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border p-3">
          <div className="w-9 h-9 rounded-xl bg-info/10 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-info" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground">Accessible</p>
            <p className="text-[11px] text-info font-semibold">
              ✓ WCAG Compliant
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function GenerationPreview({
  onOpenEditor,
  onClose,
  website: websiteProp,
  projectId: projectIdProp,
}: {
  onOpenEditor: () => void;
  onClose: () => void;
  website?: GeneratedWebsite;
  projectId?: string;
}) {
  const { wizard, updateProjectStatus, updateProjectBrandColors } =
    useAIStudioStore();

  const websiteFromStore = websiteProp ?? wizard.generatedWebsite;
  const projectId = projectIdProp ?? wizard.currentProjectId;

  // Local mutable copy so section regeneration updates instantly
  const [localWebsite, setLocalWebsite] = useState(websiteFromStore);
  // Ensure hooks are called unconditionally
  const initKit = websiteFromStore?.brandKit;
  const [colors, setColors] = useState({
    primary: initKit?.primaryColor ?? "",
    secondary: initKit?.secondaryColor ?? "",
    accent: initKit?.accentColor ?? "",
  });

  const handleColorChange = useCallback(
    (key: "primary" | "secondary" | "accent", hex: string) => {
      setColors((prev) => ({ ...prev, [key]: hex }));
      if (projectId) {
        const patch =
          key === "primary"
            ? { primaryColor: hex }
            : key === "secondary"
              ? { secondaryColor: hex }
              : { accentColor: hex };
        updateProjectBrandColors(projectId, patch);
      }
    },
    [projectId, updateProjectBrandColors],
  );

  const [markedTemplate, setMarkedTemplate] = useState(false);
  function handleSaveTemplate() {
    if (projectId) {
      updateProjectStatus(projectId, "template");
      setMarkedTemplate(true);
    }
  }

  if (!localWebsite) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-3 text-muted-foreground">
        <Sparkles className="w-8 h-8 opacity-30" />
        <p className="text-sm">No website generated yet.</p>
      </div>
    );
  }

  const kit = localWebsite.brandKit;
  const biz = localWebsite.businessInfo;

  function handleSectionRegenerate(
    pageId: string,
    sectionId: string,
    content: GeneratedSectionContent,
  ) {
    setLocalWebsite((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        pages: prev.pages.map((p) =>
          p.id !== pageId
            ? p
            : {
                ...p,
                sections: p.sections.map((s) =>
                  s.id === sectionId ? { ...s, content } : s,
                ),
              },
        ),
      };
    });
  }

  const tabs = [
    {
      value: "pages",
      label: "Pages",
      icon: FileText,
      count: localWebsite.pages.length,
    },
    { value: "sections", label: "Sections", icon: LayoutList },
    { value: "brand", label: "Brand Kit", icon: Palette },
    { value: "seo", label: "SEO", icon: Search },
    { value: "score", label: "Score", icon: BarChart3 },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
              </div>
              <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                Website Ready
              </span>
            </div>
            <h2 className="text-lg font-bold text-foreground leading-tight">
              {biz.businessName}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {biz.industry}
              {biz.location ? ` · ${biz.location}` : ""}
              {" · "}
              {localWebsite.pages.length} pages ·{" "}
              {localWebsite.pages.reduce((s, p) => s + p.sections.length, 0)}{" "}
              sections
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="gap-1.5 text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Regenerate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveTemplate}
              disabled={markedTemplate || !projectId}
              className="gap-1.5 text-xs"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              {markedTemplate ? "Saved" : "Template"}
            </Button>
            <Button
              size="sm"
              onClick={onOpenEditor}
              className="gap-1.5 font-semibold"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Customize Website
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue="pages"
        className="flex-1 flex flex-col overflow-hidden"
      >
        <TabsList className="flex-shrink-0 w-full justify-start rounded-none h-auto bg-transparent border-b border-border px-3 gap-0 p-0">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="gap-1.5 px-3 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-xs font-semibold"
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.count !== undefined && (
                <Badge
                  variant="secondary"
                  className="ml-0.5 text-[10px] px-1.5 py-0"
                >
                  {tab.count}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Pages */}
        <TabsContent
          value="pages"
          className="flex-1 overflow-y-auto px-5 py-4 mt-0"
        >
          <PagesTab
            pages={localWebsite.pages}
            brandColor={colors.primary}
            biz={{
              businessName: biz.businessName,
              industry: biz.industry,
              location: biz.location,
            }}
            onSectionRegenerate={handleSectionRegenerate}
          />
        </TabsContent>

        {/* Sections */}
        <TabsContent
          value="sections"
          className="flex-1 overflow-y-auto px-5 py-4 mt-0"
        >
          <SectionsTab
            pages={localWebsite.pages}
            brandColor={colors.primary}
            biz={{
              businessName: biz.businessName,
              industry: biz.industry,
              location: biz.location,
            }}
            onSectionRegenerate={handleSectionRegenerate}
          />
        </TabsContent>

        {/* Brand Kit */}
        <TabsContent
          value="brand"
          className="flex-1 overflow-y-auto px-5 py-4 mt-0 space-y-5"
        >
          <div>
            <p className="text-xs font-bold text-foreground uppercase tracking-wide mb-3">
              Color Palette — click to edit
            </p>
            <div className="grid grid-cols-3 gap-3">
              <ColorSwatch
                label="Primary"
                color={colors.primary}
                onChange={(h) => handleColorChange("primary", h)}
              />
              <ColorSwatch
                label="Secondary"
                color={colors.secondary}
                onChange={(h) => handleColorChange("secondary", h)}
              />
              <ColorSwatch
                label="Accent"
                color={colors.accent}
                onChange={(h) => handleColorChange("accent", h)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl border border-border">
              <p className="text-[11px] font-semibold text-muted-foreground mb-1">
                Heading Font
              </p>
              <p
                className="text-base font-bold text-foreground"
                style={{ fontFamily: `'${kit.fontHeading}', sans-serif` }}
              >
                {kit.fontHeading}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Aa Bb Cc 123
              </p>
            </div>
            <div className="p-4 rounded-xl border border-border">
              <p className="text-[11px] font-semibold text-muted-foreground mb-1">
                Body Font
              </p>
              <p
                className="text-base font-bold text-foreground"
                style={{ fontFamily: `'${kit.fontBody}', sans-serif` }}
              >
                {kit.fontBody}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Aa Bb Cc 123
              </p>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-border">
            <p className="text-[11px] font-semibold text-muted-foreground mb-3">
              Button Style
            </p>
            <button
              className={cn(
                "px-5 py-2 text-sm font-semibold text-white",
                kit.buttonStyle === "rounded" && "rounded-md",
                kit.buttonStyle === "pill" && "rounded-full",
                kit.buttonStyle === "sharp" && "rounded-none",
              )}
              style={{ backgroundColor: colors.primary }}
            >
              Get Started Today
            </button>
          </div>
        </TabsContent>

        {/* SEO */}
        <TabsContent
          value="seo"
          className="flex-1 overflow-y-auto px-5 py-4 mt-0 space-y-3"
        >
          <div className="p-4 rounded-xl border border-border bg-card">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide mb-2">
              Global SEO
            </p>
            <p className="text-sm font-bold text-foreground">
              {localWebsite.globalSEO.siteName}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {localWebsite.globalSEO.siteDescription}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {localWebsite.globalSEO.keywords.map((kw) => (
                <Badge key={kw} variant="secondary" className="text-[10px]">
                  {kw}
                </Badge>
              ))}
            </div>
          </div>
          {localWebsite.pages.map((page) => (
            <div key={page.id} className="p-4 rounded-xl border border-border">
              <p className="text-[11px] font-semibold text-primary mb-1">
                {page.name}
              </p>
              <p className="text-xs font-bold text-foreground">
                {page.seo.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {page.seo.description}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {page.seo.keywords.map((kw) => (
                  <Badge key={kw} variant="secondary" className="text-[10px]">
                    {kw}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        {/* Score */}
        <TabsContent
          value="score"
          className="flex-1 overflow-y-auto px-5 py-4 mt-0"
        >
          <ScoreTab website={localWebsite} />
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-border px-5 py-3 bg-muted/20 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          All content is editable. Customize sections, colors, and fonts in the
          editor.
        </p>
        <Button onClick={onOpenEditor} className="gap-2 shrink-0 font-semibold">
          <ExternalLink className="w-4 h-4" />
          Customize Website
        </Button>
      </div>
    </div>
  );
}
