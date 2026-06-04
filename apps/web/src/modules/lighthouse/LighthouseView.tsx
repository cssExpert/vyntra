"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Terminal,
  Monitor,
  Smartphone,
  Settings,
  RefreshCw,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Play,
  Activity,
  Compass,
  Cpu,
  Wifi,
  Award,
  FileText,
  AlertTriangle,
  Code,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import SectionTitle from "@/components/common/SectionTitle";

// ── Types ──────────────────────────────────────────────────────────────────────

interface AuditResults {
  scores: { perf: number; a11y: number; best: number; seo: number };
  metrics: { fcp: string; si: string; lcp: string; tbt: string; cls: string };
  info: { url: string; timestamp: string; device: string; throttling: string };
}

interface Opportunity {
  id: string;
  category: string;
  title: string;
  savings: string;
  description: string;
  impact: "high" | "med" | "low";
  nextSteps: string;
}

interface OpportunityCardProps {
  opt: Opportunity;
  onSolveClick: () => void;
}

// ── Component ──────────────────────────────────────────────────────────────────

export function LighthouseView() {
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [url, setUrl] = useState("https://example.com");
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState<"dashboard" | "ai-optimizer">(
    "dashboard",
  );
  const [networkThrottling, setNetworkThrottling] = useState("fast3g");
  const [cpuThrottling, setCpuThrottling] = useState("4x");
  const [showSettings, setShowSettings] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState(
    "Optimize React re-renders with heavy array manipulation",
  );
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [auditResults, setAuditResults] = useState<AuditResults | null>(null);

  const consoleLogs = [
    "Initializing Lighthouse auditor engine...",
    "Connecting to target browser context via DevTools Protocol...",
    "Clearing browser cache & storage to establish clean benchmark...",
    "Applying network throttle: Throttling bandwidth & latency...",
    "Applying CPU emulation: Establishing processor constraints...",
    "Navigating to page. Dispatching visual events...",
    "Measuring First Contentful Paint (FCP)...",
    "Measuring Speed Index (SI)...",
    "Measuring Largest Contentful Paint (LCP)...",
    "Measuring Total Blocking Time (TBT)...",
    "Analyzing Cumulative Layout Shift (CLS)...",
    "Extracting DOM structures, checking Accessibility guidelines...",
    "Auditing passive event listeners & security vulnerabilities (Best Practices)...",
    "Parsing metadata, indexing headers, and evaluating crawls (SEO)...",
    "Assembling unified JSON performance audit matrix...",
    "Scan complete. Rendering results.",
  ];

  const runAuditSimulation = () => {
    setIsScanning(true);
    setScanStep(0);
    setAuditResults(null);
  };

  useEffect(() => {
    if (!isScanning) return;
    const interval = setInterval(() => {
      setScanStep((prev) => {
        if (prev >= consoleLogs.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            const seed = url.length + (device === "mobile" ? 12 : 37);
            const r = (min: number, max: number, offset = 0) =>
              Math.floor(((seed * 31 + offset) % (max - min + 1)) + min);

            setAuditResults({
              scores: {
                perf: device === "mobile" ? r(45, 78, 1) : r(82, 99, 2),
                a11y: r(85, 100, 3),
                best: r(75, 100, 4),
                seo: r(80, 100, 5),
              },
              metrics: {
                fcp:
                  (device === "mobile"
                    ? r(21, 45, 6) / 10
                    : r(8, 18, 7) / 10
                  ).toFixed(1) + " s",
                si:
                  (device === "mobile"
                    ? r(35, 62, 8) / 10
                    : r(12, 28, 9) / 10
                  ).toFixed(1) + " s",
                lcp:
                  (device === "mobile"
                    ? r(32, 58, 10) / 10
                    : r(15, 30, 11) / 10
                  ).toFixed(1) + " s",
                tbt:
                  (device === "mobile" ? r(300, 800, 12) : r(40, 220, 13)) +
                  " ms",
                cls: (device === "mobile"
                  ? r(12, 38, 14) / 100
                  : r(1, 15, 15) / 100
                ).toFixed(3),
              },
              info: {
                url,
                timestamp: new Date().toLocaleString(),
                device,
                throttling: `${
                  networkThrottling === "none"
                    ? "None"
                    : networkThrottling === "fast3g"
                      ? "Fast 3G"
                      : "Slow 4G"
                } / CPU ${cpuThrottling}`,
              },
            });
            setIsScanning(false);
            showToast("Performance report successfully generated!");
          }, 800);
          return prev;
        }
        return prev + 1;
      });
    }, 220);
    return () => clearInterval(interval);
  }, [isScanning, url, device, networkThrottling, cpuThrottling]);

  const isMounted = useRef(false);

  useEffect(() => {
    runAuditSimulation();
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    runAuditSimulation();
  }, [device]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopy = (text: string, message = "Copied to clipboard!") => {
    const el = document.createElement("textarea");
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    showToast(message);
  };

  const callGeminiAPI = async (prompt: string) => {
    setIsAiLoading(true);
    setAiError("");
    setAiResponse("");

    const systemPrompt = `You are Lighthouse Keeper, an elite NextJS, React, and web performance engineer.
Your goal is to optimize files, modules, and strategies to reach a perfect 100 score in Google Lighthouse.
Provide clean, production-ready optimizations with comparative code diffs or explanations. Use Markdown syntax.`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
    };

    let delay = 1000;
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );
        if (!response.ok)
          throw new Error(`HTTP Error Status: ${response.status}`);
        const data = await response.json();
        const contentText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (contentText) {
          setAiResponse(contentText);
          setIsAiLoading(false);
          return;
        } else {
          throw new Error("Empty response payload from Gemini API.");
        }
      } catch {
        if (attempt === 5) {
          setAiError(
            "Optimizations currently offline. Please verify network access or try again shortly.",
          );
          setIsAiLoading(false);
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
  };

  const parsedAiMarkdown = useMemo(() => {
    if (!aiResponse) return null;
    const lines = aiResponse.split("\n");
    let insideCodeBlock = false;
    let currentCodeLanguage = "";
    let currentCodeLines: string[] = [];
    const elements: React.ReactNode[] = [];

    lines.forEach((line, index) => {
      if (line.trim().startsWith("```")) {
        if (insideCodeBlock) {
          elements.push(
            <div
              key={`code-${index}`}
              className="relative my-4 rounded-xl border border-border overflow-hidden bg-neutral-950 font-mono text-sm leading-relaxed text-neutral-200"
            >
              <div className="flex items-center justify-between px-4 py-2 bg-neutral-900 border-b border-neutral-800">
                <span className="text-xs font-semibold text-primary tracking-wider uppercase">
                  {currentCodeLanguage || "Code"}
                </span>
                <button
                  onClick={() =>
                    handleCopy(
                      currentCodeLines.join("\n"),
                      "Code block copied!",
                    )
                  }
                  className="p-1 hover:bg-neutral-800 rounded transition-colors text-neutral-400 hover:text-neutral-200"
                >
                  <Copy size={14} />
                </button>
              </div>
              <pre className="p-4 overflow-x-auto select-text">
                <code>{currentCodeLines.join("\n")}</code>
              </pre>
            </div>,
          );
          currentCodeLines = [];
          insideCodeBlock = false;
        } else {
          insideCodeBlock = true;
          currentCodeLanguage = line.replace("```", "").trim();
        }
      } else if (insideCodeBlock) {
        currentCodeLines.push(line);
      } else {
        const boldRegex = /\*\*(.*?)\*\*/g;
        const lineParts: React.ReactNode[] = [];
        let lastIndex = 0;
        let match;

        while ((match = boldRegex.exec(line)) !== null) {
          if (match.index > lastIndex) {
            lineParts.push(line.substring(lastIndex, match.index));
          }
          lineParts.push(
            <strong
              key={`bold-${match.index}`}
              className="font-extrabold text-foreground"
            >
              {match[1]}
            </strong>,
          );
          lastIndex = boldRegex.lastIndex;
        }
        if (lastIndex < line.length) {
          lineParts.push(line.substring(lastIndex));
        }

        const finalParts: React.ReactNode[] = [];
        lineParts.forEach((part, partIndex) => {
          if (typeof part === "string") {
            const inlineCodeRegex = /`(.*?)`/g;
            let codeLastIdx = 0;
            let codeMatch;
            while ((codeMatch = inlineCodeRegex.exec(part)) !== null) {
              if (codeMatch.index > codeLastIdx) {
                finalParts.push(part.substring(codeLastIdx, codeMatch.index));
              }
              finalParts.push(
                <code
                  key={`inline-${partIndex}-${codeMatch.index}`}
                  className="px-1.5 py-0.5 rounded bg-neutral-800 text-amber-400 font-mono text-xs"
                >
                  {codeMatch[1]}
                </code>,
              );
              codeLastIdx = inlineCodeRegex.lastIndex;
            }
            if (codeLastIdx < part.length) {
              finalParts.push(part.substring(codeLastIdx));
            }
          } else {
            finalParts.push(part);
          }
        });

        if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
          elements.push(
            <li
              key={index}
              className="ml-6 list-disc text-muted-foreground my-1 leading-relaxed"
            >
              {finalParts.length > 0 ? finalParts : line.substring(2)}
            </li>,
          );
        } else if (line.trim() === "") {
          elements.push(<div key={index} className="h-3" />);
        } else {
          elements.push(
            <p
              key={index}
              className="text-muted-foreground my-1 leading-relaxed"
            >
              {finalParts.length > 0 ? finalParts : line}
            </p>,
          );
        }
      }
    });

    return <div className="space-y-1 text-muted-foreground">{elements}</div>;
  }, [aiResponse]);

  const getScoreColorClass = (score: number) => {
    if (score >= 90)
      return {
        text: "text-emerald-500",
        stroke: "stroke-emerald-500",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
      };
    if (score >= 50)
      return {
        text: "text-amber-500",
        stroke: "stroke-amber-500",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
      };
    return {
      text: "text-rose-500",
      stroke: "stroke-rose-500",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
    };
  };

  const getMetricIndicator = (value: string, type: string) => {
    const raw = parseFloat(value);
    if (type === "fcp" || type === "si") {
      if (raw <= 1.8)
        return { color: "text-emerald-500", bg: "bg-emerald-500" };
      if (raw <= 3.0) return { color: "text-amber-500", bg: "bg-amber-500" };
      return { color: "text-rose-500", bg: "bg-rose-500" };
    }
    if (type === "lcp") {
      if (raw <= 2.5)
        return { color: "text-emerald-500", bg: "bg-emerald-500" };
      if (raw <= 4.0) return { color: "text-amber-500", bg: "bg-amber-500" };
      return { color: "text-rose-500", bg: "bg-rose-500" };
    }
    if (type === "tbt") {
      if (raw <= 150)
        return { color: "text-emerald-500", bg: "bg-emerald-500" };
      if (raw <= 600) return { color: "text-amber-500", bg: "bg-amber-500" };
      return { color: "text-rose-500", bg: "bg-rose-500" };
    }
    if (type === "cls") {
      if (raw <= 0.1)
        return { color: "text-emerald-500", bg: "bg-emerald-500" };
      if (raw <= 0.25) return { color: "text-amber-500", bg: "bg-amber-500" };
      return { color: "text-rose-500", bg: "bg-rose-500" };
    }
    return { color: "text-emerald-500", bg: "bg-emerald-500" };
  };

  return (
    <div className="font-sans text-foreground transition-colors duration-300">
      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-glass-lg border border-border bg-card text-foreground"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full pb-5">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between pb-5 mb-5 gap-4">
          <div className="flex items-center gap-4">
            <SectionTitle
              mb="0"
              title="Lighthouse Keeper"
              paragraph="Next-gen performance diagnostic suite & optimizer"
              className="max-w-full"
              width="100%"
            />
          </div>

          <nav className="flex rounded-xl bg-card/80 p-1 border border-border w-fit">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={cn(
                "px-4 py-2 text-xs font-semibold rounded-lg transition-all",
                activeTab === "dashboard"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("ai-optimizer")}
              className={cn(
                "px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all",
                activeTab === "ai-optimizer"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Sparkles size={13} />
              AI Optimizer
            </button>
          </nav>
        </header>

        {/* Audit URL input */}
        <section className="mb-10 p-6 rounded-2xl border border-border bg-card/50 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-10 left-10 w-80 h-80 rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-4 justify-between relative z-10">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                Audit Target URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground/60">
                  <Compass size={18} className="animate-spin-slow" />
                </div>
                <input
                  type="url"
                  placeholder="e.g. https://my-portfolio-site.vercel.app"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={isScanning}
                  className="w-full pl-11 pr-32 py-3 rounded-xl bg-background border border-border outline-none focus:outline-none focus-visible:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-[border-color,box-shadow] duration-200"
                />
                <div className="absolute inset-y-1.5 right-1.5 flex items-center gap-1 bg-card rounded-lg p-1 border border-border">
                  <button
                    onClick={() => setDevice("desktop")}
                    disabled={isScanning}
                    className={cn(
                      "p-1.5 rounded transition",
                      device === "desktop"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    title="Emulate Desktop"
                  >
                    <Monitor size={15} />
                  </button>
                  <button
                    onClick={() => setDevice("mobile")}
                    disabled={isScanning}
                    className={cn(
                      "p-1.5 rounded transition",
                      device === "mobile"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                    title="Emulate Mobile"
                  >
                    <Smartphone size={15} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="w-full sm:w-auto">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  disabled={isScanning}
                  className={cn(
                    "w-full md:min-w-[200px] text-nowrap px-4 py-3.5 rounded-xl border bg-background hover:bg-muted text-foreground transition-all text-sm flex items-center justify-center gap-2",
                    showSettings
                      ? "border-primary text-primary"
                      : "border-border",
                  )}
                >
                  <Settings size={16} />
                  <span>Emulation Settings</span>
                </button>
              </div>

              <button
                onClick={runAuditSimulation}
                disabled={isScanning || !url}
                className="w-full md:min-w-[230px] text-nowrap px-6 py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold shadow-glow-brand flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isScanning ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Auditing...</span>
                  </>
                ) : (
                  <>
                    <Play size={16} className="fill-current" />
                    <span>Generate Audit Report</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-4 pt-4 border-t border-border"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                  <div>
                    <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                      <Wifi size={14} className="text-primary" />
                      Network Throttling
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        {
                          id: "none",
                          label: "No Throttling",
                          desc: "Raw Connection",
                        },
                        {
                          id: "fast3g",
                          label: "Fast 3G",
                          desc: "1.6 Mbps, 150ms RTT",
                        },
                        {
                          id: "slow4g",
                          label: "Slow 4G",
                          desc: "4 Mbps, 40ms RTT",
                        },
                      ].map((n) => (
                        <button
                          key={n.id}
                          onClick={() => setNetworkThrottling(n.id)}
                          className={cn(
                            "p-3 text-left rounded-xl border text-xs transition",
                            networkThrottling === n.id
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background text-muted-foreground hover:text-foreground",
                          )}
                        >
                          <div className="font-bold">{n.label}</div>
                          <div className="text-[10px] text-muted-foreground/60 mt-1">
                            {n.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                      <Cpu size={14} className="text-primary" />
                      CPU Throttling
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        {
                          id: "none",
                          label: "No Throttling",
                          desc: "Host CPU Speed",
                        },
                        {
                          id: "4x",
                          label: "4x Slowdown",
                          desc: "Mid-range Mobile",
                        },
                        {
                          id: "6x",
                          label: "6x Slowdown",
                          desc: "Low-end Mobile",
                        },
                      ].map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setCpuThrottling(c.id)}
                          className={cn(
                            "p-3 text-left rounded-xl border text-xs transition",
                            cpuThrottling === c.id
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-background text-muted-foreground hover:text-foreground",
                          )}
                        >
                          <div className="font-bold">{c.label}</div>
                          <div className="text-[10px] text-muted-foreground/60 mt-1">
                            {c.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Scanning modal */}
        <AnimatePresence>
          {isScanning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-10 rounded-2xl border border-primary/30 overflow-hidden bg-card/80 backdrop-blur-xl relative"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12">
                <div className="lg:col-span-5 p-8 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-border bg-background/60 relative">
                  <div className="relative w-48 h-48 flex items-end justify-center mb-6">
                    <svg
                      className="w-32 h-44 drop-shadow-[0_0_20px_rgba(56,189,248,0.2)]"
                      viewBox="0 0 100 150"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M 0,140 Q 25,130 50,140 T 100,140 L 100,150 L 0,150 Z"
                        fill="#0c4a6e"
                        className="animate-pulse"
                      />
                      <path
                        d="M 10,140 L 25,120 L 45,135 L 65,122 L 90,140 Z"
                        fill="#1e293b"
                      />
                      <path
                        d="M 38,130 L 42,40 L 58,40 L 62,130 Z"
                        fill="#e2e8f0"
                      />
                      <path
                        d="M 40.2,105 L 59.8,105 L 59.1,95 L 40.9,95 Z"
                        fill="#ef4444"
                      />
                      <path
                        d="M 41.1,75 L 58.9,75 L 58.2,65 L 41.8,65 Z"
                        fill="#ef4444"
                      />
                      <path
                        d="M 36,40 L 64,40 L 62,37 L 38,37 Z"
                        fill="#0f172a"
                      />
                      <rect
                        x="42"
                        y="27"
                        width="16"
                        height="10"
                        fill="#334155"
                      />
                      <rect
                        x="45"
                        y="27"
                        width="10"
                        height="10"
                        fill="#38bdf8"
                        opacity="0.3"
                      />
                      <path d="M 40,27 Q 50,12 60,27 Z" fill="#ef4444" />
                      <circle cx="50" cy="11" r="2" fill="#ef4444" />
                      <circle
                        cx="50"
                        cy="32"
                        r="6"
                        className="fill-amber-400 animate-ping opacity-75"
                      />
                      <circle
                        cx="50"
                        cy="32"
                        r="3"
                        className="fill-amber-300"
                      />
                    </svg>
                    <div className="absolute top-8 left-4 w-3.5 h-3.5 rounded-full bg-primary animate-bounce" />
                    <div className="absolute top-24 right-4 w-2.5 h-2.5 rounded-full bg-primary/70 animate-pulse" />
                    <div className="absolute bottom-16 left-6 w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping" />
                  </div>

                  <h3 className="text-lg font-extrabold text-foreground mb-1">
                    Scanning Target Page
                  </h3>
                  <p className="text-xs text-primary font-mono tracking-wider">
                    {url}
                  </p>
                </div>

                {/* Terminal console — intentionally dark */}
                <div className="lg:col-span-7 p-6 flex flex-col justify-between bg-neutral-950 font-mono text-xs text-emerald-400">
                  <div className="flex items-center justify-between border-b border-neutral-900 pb-3 mb-4">
                    <span className="flex items-center gap-2">
                      <Terminal size={14} className="animate-pulse" />
                      <span>Diagnostics Console</span>
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      Thread: worker-01
                    </span>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                    {consoleLogs.slice(0, scanStep + 1).map((log, idx) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <span className="text-neutral-600">
                          [{idx.toString().padStart(2, "0")}]
                        </span>
                        {idx === scanStep ? (
                          <span className="text-white font-semibold flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            {log}
                          </span>
                        ) : (
                          <span className="text-neutral-400">{log}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 border-t border-neutral-900 pt-3 flex items-center justify-between text-neutral-500 text-[10px]">
                    <span>
                      Emulated latency:{" "}
                      {networkThrottling === "none" ? "0ms" : "150ms"}
                    </span>
                    <span>CPU: Intel Threaded Emulation</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard */}
        {activeTab === "dashboard" && auditResults && (
          <div className="space-y-8">
            {/* Meta context */}
            <div className="p-4 rounded-xl border border-border bg-white dark:bg-muted flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground font-mono">
                <div>
                  <span className="text-muted-foreground/60">AUDIT TIME:</span>{" "}
                  <span className="text-foreground">
                    {auditResults.info.timestamp}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground/60">ENVIRONMENT:</span>{" "}
                  <span className="text-foreground">
                    {auditResults.info.device.toUpperCase()} EMULATION
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground/60">THROTTLING:</span>{" "}
                  <span className="text-foreground">
                    {auditResults.info.throttling}
                  </span>
                </div>
              </div>
              <button
                onClick={() =>
                  handleCopy(
                    JSON.stringify(auditResults, null, 2),
                    "Audit data JSON copied!",
                  )
                }
                className="text-xs text-primary hover:text-primary/80 font-semibold flex items-center gap-1 transition"
              >
                <FileText size={13} />
                Export Raw Report JSON
              </button>
            </div>

            {/* Score gauges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  id: "perf",
                  label: "Performance",
                  score: auditResults.scores.perf,
                },
                {
                  id: "a11y",
                  label: "Accessibility",
                  score: auditResults.scores.a11y,
                },
                {
                  id: "best",
                  label: "Best Practices",
                  score: auditResults.scores.best,
                },
                { id: "seo", label: "SEO", score: auditResults.scores.seo },
              ].map((category) => {
                const isSelected = selectedCategory === category.id;
                const scoreColors = getScoreColorClass(category.score);
                const radius = 40;
                const circumference = 2 * Math.PI * radius;
                const strokeDashoffset =
                  circumference - (category.score / 100) * circumference;

                return (
                  <button
                    key={category.id}
                    onClick={() =>
                      setSelectedCategory(
                        selectedCategory === category.id ? "all" : category.id,
                      )
                    }
                    className={cn(
                      "p-6 rounded-2xl border text-center flex flex-col items-center justify-center transition-all duration-300 relative group overflow-hidden",
                      isSelected
                        ? "border-primary bg-primary/5 shadow-xl shadow-primary/5 ring-1 ring-primary/20"
                        : "border-border bg-card/30 hover:bg-card/60",
                    )}
                  >
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary/25 to-transparent opacity-0 group-hover:opacity-100 transition" />

                    <div className="relative w-28 h-28 flex items-center justify-center mb-4">
                      <svg
                        className="w-full h-full transform -rotate-90"
                        viewBox="0 0 112 112"
                      >
                        <circle
                          cx="56"
                          cy="56"
                          r={radius}
                          className="stroke-border"
                          strokeWidth="8"
                          fill="none"
                        />
                        <motion.circle
                          cx="56"
                          cy="56"
                          r={radius}
                          className={scoreColors.stroke}
                          strokeWidth="8"
                          strokeLinecap="round"
                          fill="none"
                          strokeDasharray={circumference}
                          initial={{ strokeDashoffset: circumference }}
                          animate={{ strokeDashoffset }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                      </svg>
                      <span
                        className={cn(
                          "absolute text-2xl font-black font-mono tracking-tighter",
                          scoreColors.text,
                        )}
                      >
                        {category.score}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-sm mb-1 text-foreground">
                      {category.label}
                    </h3>
                    <span
                      className={cn(
                        "text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full border",
                        scoreColors.text,
                        scoreColors.bg,
                        scoreColors.border,
                      )}
                    >
                      {category.score >= 90
                        ? "Excellent"
                        : category.score >= 50
                          ? "Fair"
                          : "Poor"}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Metrics grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 p-6 rounded-2xl border border-border bg-card/30">
                <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
                  <div>
                    <h3 className="text-base font-extrabold text-foreground">
                      Performance Metrics
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Core Web Vitals analyzed during current page generation
                      cycle
                    </p>
                  </div>
                  <HelpCircle
                    size={16}
                    className="text-muted-foreground/60 cursor-pointer"
                    aria-label="Lighthouse performance calculations are based on weighting"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      id: "fcp",
                      label: "First Contentful Paint",
                      value: auditResults.metrics.fcp,
                      weight: "10%",
                      desc: "FCP marks the time at which the first text or image is painted.",
                    },
                    {
                      id: "si",
                      label: "Speed Index",
                      value: auditResults.metrics.si,
                      weight: "10%",
                      desc: "Speed Index shows how quickly the contents of a page are visibly populated.",
                    },
                    {
                      id: "lcp",
                      label: "Largest Contentful Paint",
                      value: auditResults.metrics.lcp,
                      weight: "25%",
                      desc: "LCP marks the time at which the main content of a page has likely loaded.",
                    },
                    {
                      id: "tbt",
                      label: "Total Blocking Time",
                      value: auditResults.metrics.tbt,
                      weight: "30%",
                      desc: "Sum of all time periods between FCP and Time to Interactive.",
                    },
                    {
                      id: "cls",
                      label: "Cumulative Layout Shift",
                      value: auditResults.metrics.cls,
                      weight: "25%",
                      desc: "CLS measures the movement of visible elements in the viewport.",
                    },
                  ].map((m) => {
                    const status = getMetricIndicator(m.value, m.id);
                    return (
                      <div
                        key={m.id}
                        className="p-4 rounded-xl border border-border bg-background/50 overflow-hidden"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <span className="text-[10px] text-muted-foreground/60 font-mono tracking-wider uppercase">
                              Weight: {m.weight}
                            </span>
                            <h4 className="text-sm font-extrabold text-foreground mt-0.5">
                              {m.label}
                            </h4>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={cn(
                                "text-base font-black font-mono",
                                status.color,
                              )}
                            >
                              {m.value}
                            </span>
                            <span
                              className={cn(
                                "w-2.5 h-2.5 rounded-full",
                                status.bg,
                              )}
                            />
                          </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-normal">
                          {m.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 pt-4 border-t border-border flex flex-wrap items-center justify-end gap-4 text-xs font-mono text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />{" "}
                    Good (0–2.5s)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" /> Needs
                    Improvement
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" /> Poor
                  </span>
                </div>
              </div>

              {/* Audit health */}
              <div className="p-6 rounded-2xl border border-border bg-card/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="text-primary" size={18} />
                    <h3 className="text-base font-extrabold text-foreground">
                      Audit Health Timeline
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-6">
                    Historical trends and consistency records for the monitored
                    environment
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-muted-foreground">
                        Average Performance Trend
                      </span>
                      <span className="text-emerald-400 font-bold">
                        +8.4% improvement
                      </span>
                    </div>
                    <div className="h-28 w-full border border-border rounded-xl bg-background p-2 overflow-hidden">
                      <svg
                        className="w-full h-full overflow-visible"
                        viewBox="0 0 100 40"
                      >
                        <path
                          d="M 0,35 Q 20,28 40,32 T 80,18 T 100,8"
                          fill="none"
                          className="stroke-primary"
                          strokeWidth="2"
                        />
                        <path
                          d="M 0,35 Q 20,28 40,32 T 80,18 T 100,8 L 100,40 L 0,40 Z"
                          className="fill-primary/10"
                        />
                        <circle
                          cx="100"
                          cy="8"
                          r="3"
                          className="fill-primary animate-ping"
                        />
                        <circle
                          cx="100"
                          cy="8"
                          r="1.5"
                          className="fill-primary"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-border text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Performance Target:</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      Lighthouse Perfect 100
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Opportunities */}
            <div className="p-6 rounded-2xl border border-border bg-card/30">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-border mb-6 gap-4">
                <div>
                  <h3 className="text-base font-extrabold text-foreground">
                    Opportunities & Diagnostics
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Actionable advice to accelerate page loading and performance
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 w-fit">
                  High Priority Fixes
                </span>
              </div>

              <div className="space-y-3">
                {(
                  [
                    {
                      id: "opt-1",
                      category: "perf",
                      title: "Serve images in next-gen formats (WebP/AVIF)",
                      savings: "1.45 s",
                      description:
                        "Image formats like WebP and AVIF often provide better compression than PNG or JPEG, which means faster downloads and less data consumption.",
                      impact: "high",
                      nextSteps:
                        "Configure next/image package optimizations or implement responsive srcset tags",
                    },
                    {
                      id: "opt-2",
                      category: "perf",
                      title: "Eliminate render-blocking resources",
                      savings: "0.82 s",
                      description:
                        "Resources are blocking the first paint of your page. Consider delivering critical JS/CSS inline and deferring all non-critical JS/styles.",
                      impact: "high",
                      nextSteps:
                        "Use modern async/defer tags or dynamic imports inside NextJS pages",
                    },
                    {
                      id: "opt-3",
                      category: "best",
                      title: "Ensure CSP is structured to limit security risks",
                      savings: "0 ms",
                      description:
                        "A strong Content Security Policy protects against cross-site scripting (XSS) and other code-injection vulnerabilities.",
                      impact: "med",
                      nextSteps:
                        "Audit custom server configurations and security headers",
                    },
                    {
                      id: "opt-4",
                      category: "seo",
                      title: "Explicit dimensions on layout container objects",
                      savings: "0.12 s",
                      description:
                        "Set explicit width and height constraints on images, media, and dynamic advertising containers to limit layout instability issues (CLS).",
                      impact: "med",
                      nextSteps:
                        "Provide explicit aspect-ratio attributes to CSS",
                    },
                  ] as Opportunity[]
                )
                  .filter(
                    (opt) =>
                      selectedCategory === "all" ||
                      opt.category === selectedCategory,
                  )
                  .map((opt) => (
                    <OpportunityCard
                      key={opt.id}
                      opt={opt}
                      onSolveClick={() => {
                        setAiPrompt(
                          `Provide optimizations for Lighthouse audit error: "${opt.title}". Focus on: ${opt.description}`,
                        );
                        setActiveTab("ai-optimizer");
                      }}
                    />
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* AI Optimizer */}
        {activeTab === "ai-optimizer" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-2xl border border-border bg-card/30">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <Sparkles size={16} />
                  </div>
                  <h3 className="text-base font-extrabold text-foreground">
                    Ask the Lighthouse Keeper
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground mb-6">
                  Paste sluggish components, layout bottlenecks, or audit
                  feedback below. The Gemini engine will instantly refactor code
                  for high performance.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                      Performance Bottleneck / Issue
                    </label>
                    <textarea
                      rows={5}
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="e.g. Next.js server side rendering taking long, image shifts on load..."
                      className="w-full p-4 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-xs font-mono text-foreground resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                      Quick Tuning Presets
                    </label>
                    <div className="space-y-2">
                      {[
                        "Fix cumulative layout shifts (CLS) on dynamic NextJS assets",
                        "Optimize heavy client-side list rendering in React",
                        "Improve CSS bundle load weight",
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          onClick={() => setAiPrompt(preset)}
                          className="w-full text-left p-2.5 rounded-lg border border-border bg-background/50 hover:bg-muted text-xs text-muted-foreground hover:text-foreground transition flex items-center justify-between group"
                        >
                          <span className="truncate mr-2">{preset}</span>
                          <ChevronRight
                            size={14}
                            className="text-muted-foreground/60 group-hover:text-primary transition"
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => callGeminiAPI(aiPrompt)}
                    disabled={isAiLoading || !aiPrompt}
                    className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-glow-brand flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    {isAiLoading ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>AI Generating Fixes...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        <span>Generate Instant Fix</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-5 rounded-2xl border border-border/60 bg-card/30 text-xs text-muted-foreground space-y-3">
                <h4 className="font-bold text-foreground flex items-center gap-1.5">
                  <Award size={14} className="text-emerald-400" />
                  Keeper's Guarantee
                </h4>
                <p className="leading-relaxed">
                  All optimized blocks generated contain best-practice patterns
                  compliant with current Google Lighthouse core rules.
                </p>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="p-6 rounded-2xl border border-border bg-card/30 h-full flex flex-col min-h-[500px]">
                <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
                  <div>
                    <h3 className="text-base font-extrabold text-foreground">
                      Lighthouse Code Refactoring
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Automated performance optimizations directly generated by
                      AI
                    </p>
                  </div>
                  {aiResponse && (
                    <button
                      onClick={() => handleCopy(aiResponse)}
                      className="text-xs text-primary hover:text-primary/80 font-semibold flex items-center gap-1.5 transition"
                    >
                      <Copy size={13} />
                      Copy Report
                    </button>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  {isAiLoading ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4 py-12">
                      <div className="relative w-24 h-24 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
                        <div className="absolute inset-2 rounded-full border-2 border-primary/30 animate-pulse" />
                        <Sparkles
                          size={32}
                          className="text-primary animate-bounce"
                        />
                      </div>
                      <p className="text-sm font-semibold text-foreground animate-pulse text-center">
                        Analyzing bottleneck patterns...
                        <br />
                        <span className="text-xs font-normal text-muted-foreground font-mono">
                          Generating perfect score implementations
                        </span>
                      </p>
                    </div>
                  ) : aiError ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                      <AlertCircle size={40} className="text-rose-500 mb-4" />
                      <p className="text-sm text-foreground font-semibold">
                        {aiError}
                      </p>
                    </div>
                  ) : parsedAiMarkdown ? (
                    <div className="text-sm overflow-y-auto max-h-[600px] pr-2">
                      {parsedAiMarkdown}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-muted-foreground space-y-3">
                      <Code size={40} className="text-border" />
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground">
                          Ready for Optimization Input
                        </p>
                        <p className="text-xs text-muted-foreground/60 max-w-sm mt-1">
                          Click any preset on the left or type your dynamic
                          audit issue to receive optimized refactor
                          instructions.
                        </p>
                      </div>
                    </div>
                  )}

                  {aiResponse && !isAiLoading && (
                    <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                      <span>Engine: Gemini-2.5-Flash</span>
                      <span className="flex items-center gap-1 text-emerald-400">
                        <CheckCircle2 size={13} strokeWidth={2.5} /> Double
                        Checked Optimizations
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── OpportunityCard ────────────────────────────────────────────────────────────

function OpportunityCard({ opt, onSolveClick }: OpportunityCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className={cn(
        "rounded-xl border transition-all",
        isOpen
          ? "border-border/80 bg-card/60"
          : "border-border bg-background/50 hover:border-border/80",
      )}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between gap-4 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={cn(
              "p-1.5 rounded-lg flex-shrink-0",
              opt.impact === "high"
                ? "bg-rose-500/10 text-rose-400"
                : "bg-amber-500/10 text-amber-400",
            )}
          >
            <AlertTriangle size={15} />
          </span>
          <span className="text-sm font-extrabold text-foreground truncate">
            {opt.title}
          </span>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          {opt.savings !== "0 ms" && (
            <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/5 px-2.5 py-1 rounded border border-rose-500/10">
              Est Savings: {opt.savings}
            </span>
          )}
          {isOpen ? (
            <ChevronUp size={16} className="text-muted-foreground" />
          ) : (
            <ChevronDown size={16} className="text-muted-foreground" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border/60 px-4 pb-4 pt-3 text-xs"
          >
            <div className="space-y-4">
              <div>
                <span className="block text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-1">
                  Issue Context
                </span>
                <p className="text-foreground/80 leading-relaxed font-sans">
                  {opt.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div>
                  <span className="block text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider mb-1">
                    Recommended Fix
                  </span>
                  <p className="text-muted-foreground leading-relaxed font-sans">
                    {opt.nextSteps}
                  </p>
                </div>

                <div className="flex items-end justify-end">
                  <button
                    onClick={onSolveClick}
                    className="px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition flex items-center gap-1.5 border border-primary/25"
                  >
                    <Sparkles size={13} />
                    Auto-Generate Optimized Code with AI
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
