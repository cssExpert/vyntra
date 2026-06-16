// ─── Business Info (Step 1) ───────────────────────────────────────────────────

export interface BusinessInfo {
  businessName: string;
  industry: string;
  location: string;
  websiteGoal: string;
  targetAudience: string;
  description: string;
  competitors: string;
  existingUrl: string;
}

// ─── Design Preferences (Step 2) ─────────────────────────────────────────────

export type WebsiteStyle =
  | "modern"
  | "corporate"
  | "luxury"
  | "startup"
  | "minimal"
  | "creative";

export type WebsiteLayout =
  | "service-business"
  | "saas"
  | "ecommerce"
  | "portfolio"
  | "blog";

export interface DesignPreferences {
  style: WebsiteStyle;
  layout: WebsiteLayout;
  primaryColor: string;
  secondaryColor: string;
  typographyPreference: string;
  visualStyle: string;
}

// ─── Page Selection (Step 3) ──────────────────────────────────────────────────

export type StandardPage =
  | "home"
  | "about"
  | "services"
  | "pricing"
  | "portfolio"
  | "case-studies"
  | "blog"
  | "faq"
  | "contact";

export interface CustomPage {
  id: string;
  name: string;
  slug: string;
}

export interface PageSelection {
  standard: StandardPage[];
  custom: CustomPage[];
}

// ─── Generation Pipeline ──────────────────────────────────────────────────────

export type GenerationTaskId =
  | "sitemap"
  | "content"
  | "brand-kit"
  | "sections"
  | "seo"
  | "layouts"
  | "editor-structure";

export type GenerationTaskStatus = "pending" | "running" | "completed" | "error";

export interface GenerationTask {
  id: GenerationTaskId;
  label: string;
  description: string;
  status: GenerationTaskStatus;
  durationMs?: number;
}

// ─── Generated Output ─────────────────────────────────────────────────────────

export type SectionType =
  | "Hero"
  | "Features"
  | "Services"
  | "Testimonials"
  | "Pricing"
  | "Portfolio"
  | "FAQ"
  | "CTA"
  | "About"
  | "Team"
  | "Blog"
  | "Contact"
  | "Stats"
  | "LogoCloud"
  | "Footer"
  | "Header";

export interface GeneratedSectionContent {
  headline?: string;
  subheadline?: string;
  body?: string;
  cta?: string;
  items?: Array<{ title: string; description: string; icon?: string }>;
}

export interface GeneratedSection {
  id: string;
  type: SectionType;
  content: GeneratedSectionContent;
  order: number;
}

export interface GeneratedPageSEO {
  title: string;
  description: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
}

export interface GeneratedPage {
  id: string;
  name: string;
  slug: string;
  isStandard: boolean;
  sections: GeneratedSection[];
  seo: GeneratedPageSEO;
}

export interface GeneratedBrandKit {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontHeading: string;
  fontBody: string;
  buttonStyle: "rounded" | "pill" | "sharp";
}

export interface GeneratedNavItem {
  label: string;
  href: string;
}

export interface GeneratedWebsite {
  id: string;
  projectName: string;
  createdAt: string;
  businessInfo: BusinessInfo;
  designPreferences: DesignPreferences;
  brandKit: GeneratedBrandKit;
  pages: GeneratedPage[];
  navigation: GeneratedNavItem[];
  globalSEO: {
    siteName: string;
    siteDescription: string;
    keywords: string[];
  };
}

// ─── Saved AI Project ─────────────────────────────────────────────────────────

export type AIProjectStatus =
  | "generating"
  | "preview"
  | "in-editor"
  | "published"
  | "template";

export interface AIProject {
  id: string;
  name: string;
  industry: string;
  status: AIProjectStatus;
  createdAt: string;
  updatedAt: string;
  website: GeneratedWebsite | null;
  thumbnailColor: string;
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

export interface AIStudioStats {
  websitesGenerated: number;
  pagesGenerated: number;
  creditsRemaining: number;
  creditsTotal: number;
  contentGenerated: number;
  savedTemplates: number;
}

// ─── Prompt Parser Result ─────────────────────────────────────────────────────

export interface ParsedPrompt {
  businessType: string;
  industry: string;
  location: string;
  goal: string;
  targetAudience: string;
  description: string;
  suggestedPages: StandardPage[];
  suggestedStyle: WebsiteStyle;
  suggestedLayout: WebsiteLayout;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

export interface QuickFlowState {
  isOpen: boolean;
  parsed: ParsedPrompt | null;
}

// ─── Wizard State ─────────────────────────────────────────────────────────────

export type WizardStep = 1 | 2 | 3 | 4;

export interface WizardState {
  isOpen: boolean;
  currentStep: WizardStep;
  businessInfo: BusinessInfo;
  designPreferences: DesignPreferences;
  pageSelection: PageSelection;
  generationTasks: GenerationTask[];
  generatedWebsite: GeneratedWebsite | null;
  isGenerating: boolean;
  generationComplete: boolean;
  currentProjectId: string | null;
}
