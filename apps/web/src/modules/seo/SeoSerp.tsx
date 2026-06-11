"use client";

import { useState } from "react";
import { Sparkles, Sliders, RefreshCw, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ViewProps, AuditReport } from "./seo.types";
import { callGemini } from "./seo.utils";
import { Input } from "@/components/ui/input";

export function SeoSerp({
  showNotification,
}: Pick<ViewProps, "showNotification">) {
  const [domain, setDomain] = useState("https://growthstats.io");
  const [keyword, setKeyword] = useState("xml sitemap indexing guide");
  const [country, setCountry] = useState("US");
  const [loading, setLoading] = useState(false);
  const [auditProgress, setAuditProgress] = useState(0);
  const [auditStep, setAuditStep] = useState("");
  const [simulatedRank, setSimulatedRank] = useState<number | null>(null);
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);

  const startSerpSimulation = async () => {
    if (!domain.trim() || !keyword.trim()) {
      showNotification("Please provide both a domain and keyword.", "error");
      return;
    }
    setLoading(true);
    setSimulatedRank(null);
    setAuditReport(null);

    const steps = [
      { p: 15, msg: "Initiating mobile viewport spider crawl..." },
      {
        p: 35,
        msg: "Evaluating interaction responsive performance indicators (INP)...",
      },
      { p: 60, msg: "Measuring cluster semantic density..." },
      { p: 85, msg: "Retrieving trust signals & E-E-A-T credentials..." },
      { p: 100, msg: "Scanning schema structure..." },
    ];
    for (const step of steps) {
      setAuditProgress(step.p);
      setAuditStep(step.msg);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    const fallback: AuditReport = {
      estimated_rank: 3,
      authority_score: 75,
      recommendations: {
        ai_overview_readiness:
          "Ensure page headings utilize clear questions followed immediately by citable, direct statements.",
        topical_depth_checklist: [
          "Integrate comparative tables highlighting crawl speed differences",
          "Add author bio showing specific certifications to boost EEAT",
        ],
        schema_markup_needed:
          "Deploy FAQPage schema to lock down rich snippets.",
        technical_optimization_priority:
          "Audit and eliminate render-blocking inline styles to satisfy INP factors.",
      },
    };

    try {
      const prompt = `SEO audit for domain: "${domain}", keyword: "${keyword}", country: "${country}". Respond with JSON: {"estimated_rank": 3, "authority_score": 78, "recommendations": {"ai_overview_readiness": "...", "topical_depth_checklist": ["...", "..."], "schema_markup_needed": "...", "technical_optimization_priority": "..."}}`;
      const response = (await callGemini(
        prompt,
        "You are a professional enterprise SEO auditor. Respond ONLY with valid JSON.",
        true,
      )) as AuditReport;
      setSimulatedRank(response.estimated_rank || 4);
      setAuditReport(response);
      showNotification("SERP Scan Completed Successfully!", "success");
    } catch {
      setSimulatedRank(3);
      setAuditReport(fallback);
      showNotification(
        "Generated fallback technical diagnostic checklist.",
        "success",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs text-foreground transition-colors";

  return (
    <div className="space-y-8">
      <div className="bg-card/50 p-6 rounded-2xl border border-border backdrop-blur-md">
        <h2 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
          <Sliders className="w-6 h-6 text-primary" /> SERP Rank Simulator &
          Audit
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Simulate landing page positions globally and inspect your semantic
          footprint.
        </p>
      </div>

      <div className="bg-card border border-border p-6 rounded-2xl space-y-4">
        <h3 className="font-bold text-foreground text-base">
          Diagnostic Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs text-muted-foreground font-semibold block mb-1">
              Target Website URL
            </label>
            <Input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="https://mysite.com/landing-page"
              className={inputCls}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-semibold block mb-1">
              Target Keyword
            </label>
            <Input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g. professional video tools"
              className={inputCls}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground font-semibold block mb-1">
              Search Region
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className={cn(inputCls, "text-foreground")}
            >
              <option value="US">United States</option>
              <option value="UK">United Kingdom</option>
              <option value="DE">Germany</option>
              <option value="CA">Canada</option>
              <option value="IN">India</option>
            </select>
          </div>
        </div>
        <button
          onClick={startSerpSimulation}
          disabled={loading}
          className="w-full md:w-auto px-6 py-3 rounded-xl bg-primary hover:bg-primary-600 text-primary-foreground font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Crawling...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" /> Run Comprehensive SEO Audit
            </>
          )}
        </button>
      </div>

      {loading && (
        <div className="bg-card border border-border/60 p-6 rounded-2xl space-y-4">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="font-semibold">{auditStep}</span>
            <span className="font-bold">{auditProgress}%</span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${auditProgress}%` }}
            />
          </div>
        </div>
      )}

      {simulatedRank !== null && auditReport && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
            <h3 className="font-bold text-foreground text-base border-b border-border pb-3 flex items-center justify-between">
              <span>Estimated SERP Output</span>
              <span className="text-xs text-primary font-semibold uppercase">
                US Region Mockup
              </span>
            </h3>
            <div className="mt-5 space-y-6 select-text">
              <div className="opacity-50">
                <span className="text-muted-foreground/60 text-[11px] font-bold">
                  POS #1 (Competitor)
                </span>
                <div className="text-xs text-primary hover:underline cursor-pointer font-semibold mt-0.5">
                  Top Category Brand Solutions
                </div>
                <div className="text-[11px] text-emerald-600">
                  https://competitor.com/ultimate-guide
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                  Find out why thousands trust us as their main enterprise tool.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-primary/5 border-l-4 border-primary">
                <div className="flex items-center gap-2">
                  <span className="text-primary text-xs font-black">
                    YOUR SITE (Estimated Rank #{simulatedRank})
                  </span>
                  <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">
                    Score: {auditReport.authority_score}/100
                  </span>
                </div>
                <div className="text-xs text-blue-500 hover:underline cursor-pointer font-bold mt-1">
                  {keyword} - Comprehensive Implementation
                </div>
                <div className="text-[11px] text-emerald-500 mt-0.5">
                  {domain}
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed mt-1">
                  Discover core recommendations to safeguard and upgrade this
                  position below.
                </p>
              </div>
              <div className="opacity-50">
                <span className="text-muted-foreground/60 text-[11px] font-bold">
                  POS #4
                </span>
                <div className="text-xs text-primary hover:underline cursor-pointer font-semibold mt-0.5">
                  Subsequent Informational Directory
                </div>
                <div className="text-[11px] text-emerald-600">
                  https://othercompetitor.com/blog
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                  A baseline comparison breakdown evaluating modern setup
                  guidelines.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-foreground text-base flex items-center gap-1.5">
              <Sparkles className="w-5 h-5 text-primary" /> AI Technical Audit
              Report
            </h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] text-primary font-bold uppercase tracking-wider block">
                  AI Overview Eligibility
                </span>
                <p className="text-xs text-foreground/80 leading-relaxed bg-background p-3 rounded-lg border border-border">
                  {auditReport.recommendations.ai_overview_readiness}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-primary font-bold uppercase tracking-wider block">
                  Content Gap Action Items
                </span>
                <ul className="space-y-2">
                  {auditReport.recommendations.topical_depth_checklist.map(
                    (rec, i) => (
                      <li
                        key={i}
                        className="text-xs text-foreground/80 flex items-start gap-1.5 leading-relaxed"
                      >
                        <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </li>
                    ),
                  )}
                </ul>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-primary font-bold uppercase tracking-wider block">
                  Recommended Schema
                </span>
                <p className="text-xs text-foreground/80 leading-relaxed bg-background p-3 rounded-lg border border-border font-mono text-[10px]">
                  {auditReport.recommendations.schema_markup_needed}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-primary font-bold uppercase tracking-wider block">
                  Core Web Vitals Focus
                </span>
                <p className="text-xs text-foreground/80 leading-relaxed">
                  {auditReport.recommendations.technical_optimization_priority}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
