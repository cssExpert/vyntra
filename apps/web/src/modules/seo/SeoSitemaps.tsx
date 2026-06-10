"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  Map,
  RefreshCw,
  Copy,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ViewProps, SitemapPage } from "./seo.types";
import { callGemini } from "./seo.utils";

export function SeoSitemaps({ showNotification, handleCopy }: ViewProps) {
  const [domain, setDomain] = useState("https://mysite.com");
  const [pages, setPages] = useState<SitemapPage[]>([
    { path: "/", priority: "1.0", changefreq: "daily" },
    { path: "/about", priority: "0.6", changefreq: "weekly" },
    { path: "/pricing", priority: "0.8", changefreq: "daily" },
    { path: "/blog", priority: "0.8", changefreq: "daily" },
    { path: "/contact", priority: "0.4", changefreq: "monthly" },
  ]);
  const [newPage, setNewPage] = useState<SitemapPage>({
    path: "",
    priority: "0.5",
    changefreq: "weekly",
  });
  const [xmlResult, setXmlResult] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [siteDesc, setSiteDesc] = useState("");

  const generateXml = useCallback(() => {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    pages.forEach((p) => {
      const fullUrl = `${domain.replace(/\/$/, "")}${p.path.startsWith("/") ? p.path : "/" + p.path}`;
      xml += `  <url>\n    <loc>${fullUrl}</loc>\n    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>\n`;
    });
    xml += `</urlset>`;
    setXmlResult(xml);
  }, [domain, pages]);

  useEffect(() => {
    generateXml();
  }, [generateXml]);

  const handleAddPage = () => {
    if (!newPage.path.trim()) {
      showNotification("Please provide a valid page route path", "error");
      return;
    }
    const cleanPath = newPage.path.startsWith("/")
      ? newPage.path
      : "/" + newPage.path;
    if (pages.some((p) => p.path === cleanPath)) {
      showNotification("This route path already exists", "error");
      return;
    }
    setPages((prev) => [...prev, { ...newPage, path: cleanPath }]);
    setNewPage({ path: "", priority: "0.5", changefreq: "weekly" });
    showNotification("Added page to URL listing.", "success");
  };

  const handleDeletePage = (index: number) => {
    if (pages.length <= 1) {
      showNotification("At least one indexable route is required", "error");
      return;
    }
    setPages((prev) => prev.filter((_, idx) => idx !== index));
    showNotification("Removed route.", "success");
  };

  const validateSitemap = () => {
    const errors: string[] = [];
    try {
      const parsed = new URL(domain);
      if (!["http:", "https:"].includes(parsed.protocol))
        errors.push("Invalid domain format: Use http/https.");
    } catch {
      errors.push(
        "Invalid domain format: Ensure domain is valid (e.g. https://domain.com).",
      );
    }
    if (pages.length > 50000)
      errors.push(
        "Size limitation: Single sitemaps must remain under 50,000 URLs.",
      );
    pages.forEach((p) => {
      if (!p.path) errors.push("Pathing warning: Empty page path detected.");
    });
    setValidationErrors(errors);
    if (errors.length === 0)
      showNotification(
        "Sitemap completely valid! 0 errors detected.",
        "success",
      );
    else showNotification("Sitemap has validation warnings.", "error");
  };

  const handleAiSitemap = async () => {
    if (!siteDesc.trim()) {
      showNotification("Describe your business profile first", "error");
      return;
    }
    setAiGenerating(true);
    try {
      const prompt = `Generate a sitemap for: "${siteDesc}", domain: "${domain}". Reply with JSON: {"pages": [{"path": "/", "priority": "1.0", "changefreq": "daily"}]}`;
      const response = (await callGemini(
        prompt,
        "You are a professional sitemap planner. Respond ONLY with valid JSON.",
        true,
      )) as { pages?: SitemapPage[] };
      if (response.pages && Array.isArray(response.pages)) {
        setPages(response.pages);
        showNotification("AI Sitemap Structure Generated!", "success");
      }
    } catch {
      showNotification("AI generator had trouble. Modify manually.", "error");
    } finally {
      setAiGenerating(false);
    }
  };

  const inputCls =
    "w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs text-foreground transition-colors";

  return (
    <div className="space-y-8">
      <div className="bg-card/50 p-6 rounded-2xl border border-border backdrop-blur-md">
        <h2 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
          <Map className="w-6 h-6 text-primary" /> Sitemap Architect & Validator
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Configure automated indexing structures and execute real-time syntax
          validations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-card border border-border p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-foreground text-base">
              Domain Context
            </h3>
            <div>
              <label className="text-xs text-muted-foreground font-semibold block mb-1">
                Target Website Domain
              </label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="https://yourbrand.com"
                className={inputCls}
              />
            </div>
          </div>

          <div className="bg-card border border-border p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-foreground text-base flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> AI Sitemap Builder
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Let AI design your entire URL directory mapping.
            </p>
            <div className="space-y-3">
              <textarea
                value={siteDesc}
                onChange={(e) => setSiteDesc(e.target.value)}
                placeholder="e.g. Modern e-commerce storefront retailing handcrafted organic apparel..."
                rows={3}
                className={cn(inputCls, "resize-none")}
              />
              <button
                onClick={handleAiSitemap}
                disabled={aiGenerating}
                className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-600 text-primary-foreground font-semibold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {aiGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />{" "}
                    Structuring...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> Auto-Map URLs
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-card border border-border p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-foreground text-base">Add New URL</h3>
            <div className="space-y-3.5">
              <div>
                <label className="text-xs text-muted-foreground font-semibold block mb-1">
                  Route Path
                </label>
                <input
                  type="text"
                  value={newPage.path}
                  onChange={(e) =>
                    setNewPage((p) => ({ ...p, path: e.target.value }))
                  }
                  placeholder="/blog/seo-best-practices"
                  className={inputCls}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground font-semibold block mb-1">
                    Change Frequency
                  </label>
                  <select
                    value={newPage.changefreq}
                    onChange={(e) =>
                      setNewPage((p) => ({ ...p, changefreq: e.target.value }))
                    }
                    className={cn(inputCls, "text-foreground")}
                  >
                    {[
                      "always",
                      "hourly",
                      "daily",
                      "weekly",
                      "monthly",
                      "yearly",
                      "never",
                    ].map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground font-semibold block mb-1">
                    Priority ({newPage.priority})
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={newPage.priority}
                    onChange={(e) =>
                      setNewPage((p) => ({ ...p, priority: e.target.value }))
                    }
                    className="w-full mt-2 accent-primary"
                  />
                </div>
              </div>
              <button
                onClick={handleAddPage}
                className="w-full py-2.5 rounded-xl bg-background border border-border hover:border-border/80 text-foreground font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Page
              </button>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-foreground text-base">
                Crawled Site Directories
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-bold">
                {pages.length} Pages
              </span>
            </div>
            <div className="max-h-64 overflow-y-auto divide-y divide-border/60 text-xs">
              {pages.map((p, idx) => (
                <div
                  key={idx}
                  className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">
                        {p.path}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60">
                        priority: {p.priority}
                      </span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Freq:{" "}
                      <span className="text-foreground font-semibold">
                        {p.changefreq}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeletePage(idx)}
                    className="p-1.5 rounded hover:bg-background text-muted-foreground/60 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-foreground text-base">
                XML Sitemap Output
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={validateSitemap}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/20 text-emerald-500 hover:text-white text-xs font-semibold transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Validate
                </button>
                <button
                  onClick={() => handleCopy(xmlResult, "Copied sitemap XML!")}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-background hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-semibold transition-all border border-border"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy
                </button>
              </div>
            </div>

            {validationErrors.length > 0 && (
              <div className="p-4 bg-destructive/10 border-b border-destructive/20 space-y-2">
                <div className="text-xs text-destructive font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" /> Warnings Found:
                </div>
                <ul className="list-disc list-inside text-[11px] text-destructive/80 pl-1">
                  {validationErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-6 select-text">
              <pre className="p-4 bg-neutral-950 border border-border rounded-xl overflow-x-auto text-[11px] leading-relaxed text-primary font-mono max-h-60">
                {xmlResult}
              </pre>
            </div>
            <div className="p-4 border-t border-border bg-background/30 text-xs text-muted-foreground">
              Include sitemap index declarations in your{" "}
              <strong className="text-foreground">robots.txt</strong> file.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
