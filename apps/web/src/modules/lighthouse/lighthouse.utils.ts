import type { Opportunity } from "./lighthouse.types";

export const CONSOLE_LOGS = [
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

export const OPPORTUNITIES: Opportunity[] = [
  {
    id: "opt-1",
    category: "perf",
    title: "Serve images in next-gen formats (WebP/AVIF)",
    savings: "1.45 s",
    description: "Image formats like WebP and AVIF often provide better compression than PNG or JPEG, which means faster downloads and less data consumption.",
    impact: "high",
    nextSteps: "Configure next/image package optimizations or implement responsive srcset tags",
  },
  {
    id: "opt-2",
    category: "perf",
    title: "Eliminate render-blocking resources",
    savings: "0.82 s",
    description: "Resources are blocking the first paint of your page. Consider delivering critical JS/CSS inline and deferring all non-critical JS/styles.",
    impact: "high",
    nextSteps: "Use modern async/defer tags or dynamic imports inside NextJS pages",
  },
  {
    id: "opt-3",
    category: "best",
    title: "Ensure CSP is structured to limit security risks",
    savings: "0 ms",
    description: "A strong Content Security Policy protects against cross-site scripting (XSS) and other code-injection vulnerabilities.",
    impact: "med",
    nextSteps: "Audit custom server configurations and security headers",
  },
  {
    id: "opt-4",
    category: "seo",
    title: "Explicit dimensions on layout container objects",
    savings: "0.12 s",
    description: "Set explicit width and height constraints on images, media, and dynamic advertising containers to limit layout instability issues (CLS).",
    impact: "med",
    nextSteps: "Provide explicit aspect-ratio attributes to CSS",
  },
];

export const getScoreColorClass = (score: number) => {
  if (score >= 90)
    return { text: "text-emerald-500", stroke: "stroke-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
  if (score >= 50)
    return { text: "text-amber-500", stroke: "stroke-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" };
  return { text: "text-rose-500", stroke: "stroke-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" };
};

export const getMetricIndicator = (value: string, type: string) => {
  const raw = parseFloat(value);
  if (type === "fcp" || type === "si") {
    if (raw <= 1.8) return { color: "text-emerald-500", bg: "bg-emerald-500" };
    if (raw <= 3.0) return { color: "text-amber-500", bg: "bg-amber-500" };
    return { color: "text-rose-500", bg: "bg-rose-500" };
  }
  if (type === "lcp") {
    if (raw <= 2.5) return { color: "text-emerald-500", bg: "bg-emerald-500" };
    if (raw <= 4.0) return { color: "text-amber-500", bg: "bg-amber-500" };
    return { color: "text-rose-500", bg: "bg-rose-500" };
  }
  if (type === "tbt") {
    if (raw <= 150) return { color: "text-emerald-500", bg: "bg-emerald-500" };
    if (raw <= 600) return { color: "text-amber-500", bg: "bg-amber-500" };
    return { color: "text-rose-500", bg: "bg-rose-500" };
  }
  if (type === "cls") {
    if (raw <= 0.1) return { color: "text-emerald-500", bg: "bg-emerald-500" };
    if (raw <= 0.25) return { color: "text-amber-500", bg: "bg-amber-500" };
    return { color: "text-rose-500", bg: "bg-rose-500" };
  }
  return { color: "text-emerald-500", bg: "bg-emerald-500" };
};

export const copyToClipboard = (text: string) => {
  const el = document.createElement("textarea");
  el.value = text;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
};
