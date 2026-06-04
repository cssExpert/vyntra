export interface AuditResults {
  scores: { perf: number; a11y: number; best: number; seo: number };
  metrics: { fcp: string; si: string; lcp: string; tbt: string; cls: string };
  info: { url: string; timestamp: string; device: string; throttling: string };
}

export interface Opportunity {
  id: string;
  category: string;
  title: string;
  savings: string;
  description: string;
  impact: "high" | "med" | "low";
  nextSteps: string;
}

export type TabId = "dashboard" | "ai-optimizer";
export type DeviceType = "desktop" | "mobile";
