"use client";

import { useState } from "react";
import { Sparkles, FileCode, RefreshCw, Copy, Eye, Share2, Monitor, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ViewProps } from "./seo.types";
import { callGemini } from "./seo.utils";

export function SeoMetaTags({ showNotification, handleCopy }: ViewProps) {
  const [form, setForm] = useState({
    title: "Acme Premium Coffee - Handcrafted Organic Brews & Accessories",
    description: "Discover the world of responsibly sourced handcrafted organic coffee. Explore specialty beans, premium accessories, and direct trade subscriptions.",
    url: "https://acmepremiumcoffee.com",
    keywords: "organic coffee, specialty coffee beans, trade subscription",
    ogImage: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=1200",
    author: "Alex CoffeeMaster",
    robots: "index, follow",
  });
  const [aiOptimizing, setAiOptimizing] = useState(false);
  const [previewMode, setPreviewMode] = useState<"google" | "facebook" | "code">("google");

  const handleAiOptimize = async () => {
    setAiOptimizing(true);
    try {
      const prompt = `Optimize this title and description for 2026 SEO. Title: "${form.title}", Description: "${form.description}", Keywords: "${form.keywords}". Keep title under 60 chars, description under 155. Reply with JSON: {"title": "...", "description": "..."}`;
      const response = (await callGemini(prompt, "You are an expert CTR marketing copywriter. Reply ONLY in valid JSON.", true)) as { title?: string; description?: string };
      if (response.title && response.description) {
        setForm((prev) => ({ ...prev, title: response.title!, description: response.description! }));
        showNotification("AI Meta Optimization Applied Successfully!", "success");
      }
    } catch {
      showNotification("AI optimizations timed out. Please review manually.", "error");
    } finally {
      setAiOptimizing(false);
    }
  };

  const getHtmlCode = () => `<!-- SEO Primary Meta Tags -->
<title>${form.title}</title>
<meta name="title" content="${form.title}">
<meta name="description" content="${form.description}">
<meta name="keywords" content="${form.keywords}">
<meta name="author" content="${form.author}">
<meta name="robots" content="${form.robots}">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="${form.url}">
<meta property="og:title" content="${form.title}">
<meta property="og:description" content="${form.description}">
<meta property="og:image" content="${form.ogImage}">

<!-- Twitter Card -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="${form.url}">
<meta property="twitter:title" content="${form.title}">
<meta property="twitter:description" content="${form.description}">
<meta property="twitter:image" content="${form.ogImage}">`;

  const safeHostname = () => {
    try { return new URL(form.url).hostname; } catch { return "website"; }
  };

  const inputCls = "w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs text-foreground transition-colors";

  return (
    <div className="space-y-8">
      <div className="bg-card/50 p-6 rounded-2xl border border-border backdrop-blur-md">
        <h2 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
          <FileCode className="w-6 h-6 text-primary" /> Meta Tag Architect
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Design, preview, and optimize search and social graph parameters.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Editor */}
        <div className="bg-card border border-border p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="font-bold text-foreground text-base">Meta Parameters</h3>
            <button
              onClick={handleAiOptimize}
              disabled={aiOptimizing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/30 text-xs font-semibold transition-all disabled:opacity-50"
            >
              {aiOptimizing ? (
                <><RefreshCw className="w-3 h-3 animate-spin" /> Rewriting...</>
              ) : (
                <><Sparkles className="w-3 h-3" /> AI Optimise</>
              )}
            </button>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="text-xs text-muted-foreground font-semibold block mb-1">Target URL</label>
              <input type="text" value={form.url} onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                <label className="font-semibold">Page Title</label>
                <span className={cn("text-[10px] font-bold", form.title.length > 60 ? "text-amber-500" : "text-muted-foreground/60")}>
                  {form.title.length} / 60
                </span>
              </div>
              <input type="text" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                <label className="font-semibold">Meta Description</label>
                <span className={cn("text-[10px] font-bold", form.description.length > 155 ? "text-amber-500" : "text-muted-foreground/60")}>
                  {form.description.length} / 155
                </span>
              </div>
              <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={3} className={cn(inputCls, "resize-none")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground font-semibold block mb-1">Primary Keywords</label>
                <input type="text" value={form.keywords} onChange={(e) => setForm((p) => ({ ...p, keywords: e.target.value }))} className={inputCls} placeholder="Separated with commas" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-semibold block mb-1">Author</label>
                <input type="text" value={form.author} onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))} className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground font-semibold block mb-1">OG Image URL</label>
                <input type="text" value={form.ogImage} onChange={(e) => setForm((p) => ({ ...p, ogImage: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground font-semibold block mb-1">Robots</label>
                <select value={form.robots} onChange={(e) => setForm((p) => ({ ...p, robots: e.target.value }))} className={cn(inputCls, "text-foreground")}>
                  <option value="index, follow">index, follow</option>
                  <option value="noindex, follow">noindex, follow</option>
                  <option value="index, nofollow">index, nofollow</option>
                  <option value="noindex, nofollow">noindex, nofollow</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-4 bg-background/40 border-b border-border flex items-center justify-between gap-2">
            <div className="flex gap-1.5">
              {([
                { id: "google" as const, label: "Google SERP", icon: Eye },
                { id: "facebook" as const, label: "Facebook OG", icon: Share2 },
                { id: "code" as const, label: "Export Code", icon: FileCode },
              ]).map((view) => (
                <button
                  key={view.id}
                  onClick={() => setPreviewMode(view.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                    previewMode === view.id
                      ? "bg-muted text-foreground border border-border shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <view.icon className="w-3.5 h-3.5" />
                  {view.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => handleCopy(getHtmlCode(), "Copied complete Meta markup!")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary hover:text-primary/80"
            >
              <Copy className="w-3.5 h-3.5" /> Copy
            </button>
          </div>

          <div className="p-6">
            {previewMode === "google" && (
              <div className="space-y-4">
                <div className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5" /> Desktop Search Mockup
                </div>
                <div className="p-5 bg-white border border-slate-200 rounded-xl text-left select-text max-w-lg shadow-sm">
                  <div className="text-[12px] text-slate-800 flex items-center gap-1.5">
                    <span className="font-medium text-slate-900">Acme Coffee</span>
                    <span className="text-slate-400 text-[10px]">›</span>
                    <span className="text-slate-500">shop</span>
                  </div>
                  <h4 className="text-[19px] text-blue-800 font-sans hover:underline cursor-pointer font-medium leading-snug mt-1">
                    {form.title.length > 60 ? `${form.title.substring(0, 57)}...` : form.title}
                  </h4>
                  <div className="text-[13px] text-slate-500 leading-none mt-0.5 truncate">{form.url}</div>
                  <p className="text-[13px] text-slate-600 leading-relaxed mt-1">
                    {form.description.length > 155 ? `${form.description.substring(0, 152)}...` : form.description}
                  </p>
                </div>
                {form.title.length > 60 && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span><strong>Warning:</strong> Title exceeds 60 characters and may get truncated by Google.</span>
                  </div>
                )}
              </div>
            )}

            {previewMode === "facebook" && (
              <div className="space-y-4">
                <div className="text-[11px] text-muted-foreground font-semibold flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5" /> Social Graph Appearance
                </div>
                <div className="border border-border rounded-xl overflow-hidden max-w-sm bg-card">
                  <div className="h-44 bg-muted relative">
                    <img
                      src={form.ogImage}
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=1200"; }}
                      alt="OG Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 border-t border-border space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{safeHostname()}</span>
                    <h4 className="font-extrabold text-sm text-foreground line-clamp-1">{form.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{form.description}</p>
                  </div>
                </div>
              </div>
            )}

            {previewMode === "code" && (
              <div className="space-y-3 select-text">
                <div className="text-[11px] text-muted-foreground font-semibold">
                  Copy and paste inside your website&apos;s &lt;head&gt; tags:
                </div>
                <pre className="p-4 bg-neutral-950 border border-border rounded-xl overflow-x-auto text-[11px] leading-relaxed text-primary font-mono">
                  {getHtmlCode()}
                </pre>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border bg-background/30 text-xs text-muted-foreground leading-relaxed">
            Ensure correct viewport settings & meta UTF-8 markers exist globally.
          </div>
        </div>
      </div>
    </div>
  );
}
