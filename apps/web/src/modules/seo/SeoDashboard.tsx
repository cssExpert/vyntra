"use client";

import { useState } from "react";
import { Sparkles, Search, FileCode, Map, TrendingUp, ChevronRight, Layers, FileText, Sliders, ThumbsUp, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TabId } from "./seo.types";

export function SeoDashboard({ setActiveTab }: { setActiveTab: (tab: TabId) => void }) {
  const [selectedRegion, setSelectedRegion] = useState("US");

  const stats = [
    { label: "Overall SEO Health", value: "94/100", change: "+1.8%", desc: "Based on 24 technical checkpoints", color: "from-emerald-500 to-teal-500" },
    { label: "Tracked Keywords in Top 3", value: "38", change: "+4 this week", desc: "Leading key commercial terms", color: "from-primary to-primary/60" },
    { label: "Est. Organic Search Traffic", value: "84.3k/mo", change: "+12.4%", desc: "Sustained post-update recovery", color: "from-sky-500 to-indigo-500" },
    { label: "XML Index Coverage", value: "98.2%", change: "1,248 Pages", desc: "0 crawl errors in Search Console", color: "from-amber-500 to-orange-500" },
  ];

  const keyRules = [
    { title: "E-E-A-T Gatekeeper Priority", text: "Google core indexing systems strictly assess transparency: visible expert authors, credible citations, and original non-templated statistics.", icon: ThumbsUp, tag: "Essential" },
    { title: "INP (Interaction to Next Paint) Shift", text: "Smooth scrolling and latency-free interactive inputs are now heavily favored under page experience, bypassing basic speed metrics.", icon: Sliders, tag: "Technical" },
    { title: "Contextual Topical Clusters", text: "Single landing pages fail without highly detailed surrounding content clusters. Deep interlinking of sub-topics proves category authority.", icon: Layers, tag: "On-Page" },
    { title: "Citable Snippet Structures", text: "Structure headings with direct, quotable QA formats to satisfy Gemini, Perplexity, and Google Search Generative Experiences (SGE).", icon: FileText, tag: "AI Search" },
  ];

  const quickActions = [
    { tab: "keywords" as TabId, icon: Search, label: "Expand Semantic Base", desc: "Discover low-competition content ideas." },
    { tab: "metatags" as TabId, icon: FileCode, label: "Audit Click-Through-Rates", desc: "Optimize meta titles & social headers." },
    { tab: "sitemaps" as TabId, icon: Map, label: "Align Crawler Pipelines", desc: "Build dynamic XML sitemaps safely." },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/50 p-6 rounded-2xl border border-border backdrop-blur-md">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            SEO Overview Hub{" "}
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-primary">
              Stable
            </span>
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Real-time analysis dashboard for 2026 organic algorithm guidelines.
          </p>
        </div>
        <button
          onClick={() => setActiveTab("serp")}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm transition-all shadow-glow-brand"
        >
          <Sparkles className="w-4 h-4" /> Run Quick Audit
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((item, idx) => (
          <div
            key={idx}
            className="bg-card border border-border p-5 rounded-2xl relative overflow-hidden hover:border-border/80 transition-all duration-300"
          >
            <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${item.color}`} />
            <div className="flex items-start justify-between">
              <span className="text-xs text-muted-foreground font-semibold tracking-wider uppercase">
                {item.label}
              </span>
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                {item.change}
              </span>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-extrabold text-foreground">{item.value}</span>
            </div>
            <p className="text-xs text-muted-foreground/60 mt-2 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Chart + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-border p-6 rounded-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
            <div>
              <h3 className="font-bold text-foreground text-lg">Share of Voice & SERP Positions</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Average visibility percentage based on tracked focus keywords.
              </p>
            </div>
            <div className="flex items-center gap-1 bg-background p-1 rounded-lg border border-border text-xs font-medium">
              {["US", "UK", "EU", "GLOBAL"].map((reg) => (
                <button
                  key={reg}
                  onClick={() => setSelectedRegion(reg)}
                  className={cn(
                    "px-3 py-1.5 rounded-md transition-colors",
                    selectedRegion === reg
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {reg}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 relative h-48 w-full">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M 0 100 Q 100 60 200 80 T 400 30 T 500 10" fill="none" stroke="hsl(var(--primary))" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 0 100 Q 100 60 200 80 T 400 30 T 500 10 L 500 150 L 0 150 Z" fill="url(#chartGradient)" />
              <circle cx="200" cy="80" r="5" fill="hsl(var(--primary))" stroke="white" strokeWidth="2" className="animate-pulse" />
              <circle cx="400" cy="30" r="5" fill="hsl(var(--primary))" stroke="white" strokeWidth="2" className="animate-pulse" />
            </svg>
            <div className="absolute top-4 left-[35%] bg-card border border-border px-3 py-1.5 rounded-lg text-[11px] shadow-glass pointer-events-none">
              <div className="font-semibold text-foreground">Topical Authority Check</div>
              <div className="text-primary mt-0.5">
                Average Rank: <strong className="text-foreground">#3.2</strong>
              </div>
            </div>
          </div>

          <div className="flex justify-between text-[11px] text-muted-foreground/60 mt-4 font-semibold tracking-wider">
            <span>WEEK 1</span><span>WEEK 2</span><span>WEEK 3</span><span>WEEK 4</span><span>CURRENT</span>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-foreground text-lg">Instant Actions</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Quickly construct and optimize key ranking factors.</p>
            <div className="mt-5 space-y-3.5">
              {quickActions.map((item) => (
                <button
                  key={item.tab}
                  onClick={() => setActiveTab(item.tab)}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-background/50 border border-border hover:border-primary/50 transition-all duration-200 text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-all">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {item.label}
                      </h4>
                      <p className="text-[11px] text-muted-foreground/60">{item.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/60 group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
          </div>
          <div className="text-[11px] text-muted-foreground/50 mt-6 pt-4 border-t border-border text-center">
            Tip: Clean up broken URLs before updating sitemaps.
          </div>
        </div>
      </div>

      {/* 2026 Checklist */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-foreground text-lg tracking-tight flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          The 2026 Algorithmic Priority Checklist
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {keyRules.map((rule, idx) => (
            <div key={idx} className="p-5 bg-card border border-border rounded-2xl flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <rule.icon className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-foreground">{rule.title}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold">
                    {rule.tag}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{rule.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
