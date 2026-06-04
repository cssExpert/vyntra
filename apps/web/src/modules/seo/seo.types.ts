export interface Notification {
  message: string;
  type: "success" | "error";
}

export interface ViewProps {
  showNotification: (message: string, type?: "success" | "error") => void;
  handleCopy: (text: string, message?: string) => void;
}

export interface Keyword {
  keyword: string;
  volume: number;
  difficulty: number;
  cpc: number;
  intent: string;
  relevance: number;
}

export interface Cluster {
  title: string;
  pages: string[];
  value: string;
}

export interface SitemapPage {
  path: string;
  priority: string;
  changefreq: string;
}

export interface AuditReport {
  estimated_rank: number;
  authority_score: number;
  recommendations: {
    ai_overview_readiness: string;
    topical_depth_checklist: string[];
    schema_markup_needed: string;
    technical_optimization_priority: string;
  };
}

export const TABS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "keywords", label: "Keyword Explorer" },
  { id: "metatags", label: "Meta Tag Architect" },
  { id: "sitemaps", label: "Sitemap Creator" },
  { id: "serp", label: "SERP Simulator" },
] as const;

export type TabId = (typeof TABS)[number]["id"];
