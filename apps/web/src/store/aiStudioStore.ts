import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import type { EditorNode } from "@/types/editor";
import type {
  AIProject,
  AIStudioStats,
  BusinessInfo,
  DesignPreferences,
  GeneratedBrandKit,
  GeneratedNavItem,
  GeneratedPage,
  GeneratedSection,
  GeneratedSectionContent,
  GeneratedWebsite,
  GenerationTask,
  GenerationTaskId,
  GenerationTaskStatus,
  PageSelection,
  ParsedPrompt,
  QuickFlowState,
  SectionType,
  StandardPage,
  WizardState,
  WizardStep,
} from "@/types/ai-studio";

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_BUSINESS_INFO: BusinessInfo = {
  businessName: "",
  industry: "",
  location: "",
  websiteGoal: "",
  targetAudience: "",
  description: "",
  competitors: "",
  existingUrl: "",
};

const DEFAULT_DESIGN_PREFS: DesignPreferences = {
  style: "modern",
  layout: "service-business",
  primaryColor: "#6366f1",
  secondaryColor: "#8b5cf6",
  typographyPreference: "Inter",
  visualStyle: "clean",
};

const DEFAULT_PAGE_SELECTION: PageSelection = {
  standard: ["home", "about", "services", "contact"],
  custom: [],
};

const GENERATION_TASKS: GenerationTask[] = [
  { id: "sitemap", label: "Generating Sitemap", description: "Building page structure and navigation", status: "pending" },
  { id: "content", label: "Generating Content", description: "Writing copy for each section", status: "pending" },
  { id: "brand-kit", label: "Generating Brand Kit", description: "Creating colors, fonts, and style guide", status: "pending" },
  { id: "sections", label: "Generating Sections", description: "Building reusable page sections", status: "pending" },
  { id: "seo", label: "Generating SEO", description: "Writing meta titles, descriptions, and schema", status: "pending" },
  { id: "layouts", label: "Generating Responsive Layouts", description: "Optimizing for mobile and desktop", status: "pending" },
  { id: "editor-structure", label: "Generating Editor Structure", description: "Preparing components for visual editor", status: "pending" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SECTION_MAPS: Record<StandardPage, SectionType[]> = {
  home: ["Header", "Hero", "Features", "Services", "Stats", "Testimonials", "CTA", "Footer"],
  about: ["Header", "Hero", "About", "Team", "Stats", "CTA", "Footer"],
  services: ["Header", "Hero", "Services", "Features", "Pricing", "CTA", "Footer"],
  pricing: ["Header", "Hero", "Pricing", "FAQ", "CTA", "Footer"],
  portfolio: ["Header", "Hero", "Portfolio", "Testimonials", "CTA", "Footer"],
  "case-studies": ["Header", "Hero", "Portfolio", "Testimonials", "CTA", "Footer"],
  blog: ["Header", "Hero", "Blog", "CTA", "Footer"],
  faq: ["Header", "Hero", "FAQ", "CTA", "Footer"],
  contact: ["Header", "Hero", "Contact", "Footer"],
};

const CONTENT_TEMPLATES: Record<SectionType, (biz: BusinessInfo) => GeneratedSectionContent> = {
  Header: (b) => ({ headline: b.businessName }),
  Hero: (b) => ({
    headline: `Grow Your ${b.industry} Business`,
    subheadline: `${b.businessName} delivers exceptional results for ${b.targetAudience}. ${b.description.slice(0, 80)}`,
    cta: "Get Started Today",
  }),
  Features: () => ({
    headline: "Why Choose Us",
    subheadline: "Built for businesses that demand excellence",
    items: [
      { title: "Expert Team", description: "Seasoned professionals with years of industry experience", icon: "Users" },
      { title: "Proven Results", description: "Track record of delivering measurable outcomes", icon: "TrendingUp" },
      { title: "24/7 Support", description: "Always available when you need us most", icon: "HeadphonesIcon" },
      { title: "Custom Solutions", description: "Tailored strategies designed around your goals", icon: "Settings" },
    ],
  }),
  Services: (b) => ({
    headline: "Our Services",
    subheadline: `Comprehensive ${b.industry} solutions for modern businesses`,
    items: [
      { title: "Strategy & Planning", description: "Develop a roadmap that aligns with your vision and goals" },
      { title: "Implementation", description: "Execute with precision using industry best practices" },
      { title: "Optimization", description: "Continuously improve performance and outcomes" },
      { title: "Analytics & Reporting", description: "Data-driven insights to guide every decision" },
    ],
  }),
  Testimonials: (b) => ({
    headline: "What Our Clients Say",
    subheadline: `Trusted by businesses in ${b.location} and beyond`,
    items: [
      { title: "Sarah M., CEO", description: `Working with ${b.businessName} transformed our business completely. Outstanding results.` },
      { title: "James K., Director", description: "The team delivered beyond our expectations. Highly professional and results-oriented." },
      { title: "Lisa T., Founder", description: `${b.businessName} understood exactly what we needed and delivered on every promise.` },
    ],
  }),
  Pricing: () => ({
    headline: "Simple, Transparent Pricing",
    subheadline: "Choose the plan that fits your business needs",
    items: [
      { title: "Starter", description: "Perfect for small businesses just getting started" },
      { title: "Professional", description: "Ideal for growing businesses ready to scale" },
      { title: "Enterprise", description: "Full-service solution for established companies" },
    ],
  }),
  Portfolio: () => ({
    headline: "Our Work",
    subheadline: "A selection of projects we're proud of",
    items: [
      { title: "Project Alpha", description: "A complete digital transformation for a leading retailer" },
      { title: "Project Beta", description: "Brand overhaul and market positioning strategy" },
      { title: "Project Gamma", description: "End-to-end website build and launch campaign" },
    ],
  }),
  FAQ: () => ({
    headline: "Frequently Asked Questions",
    subheadline: "Everything you need to know",
    items: [
      { title: "How do I get started?", description: "Simply contact us for a free consultation. We'll assess your needs and propose a tailored solution." },
      { title: "What is your turnaround time?", description: "Project timelines vary but we always commit to clear deadlines and deliver on time." },
      { title: "Do you offer ongoing support?", description: "Yes, we offer comprehensive support packages to keep your business running smoothly." },
    ],
  }),
  CTA: (b) => ({
    headline: "Ready to Grow Your Business?",
    subheadline: `Join hundreds of ${b.industry} businesses that trust ${b.businessName}`,
    cta: "Schedule a Free Consultation",
  }),
  About: (b) => ({
    headline: `About ${b.businessName}`,
    subheadline: b.description || `A trusted ${b.industry} partner in ${b.location}`,
    body: `We are a dedicated team of professionals passionate about helping ${b.targetAudience} achieve their goals. With deep expertise in ${b.industry}, we deliver results that matter.`,
  }),
  Team: () => ({
    headline: "Meet Our Team",
    subheadline: "The people behind your success",
    items: [
      { title: "Alex Johnson", description: "Chief Executive Officer" },
      { title: "Maya Patel", description: "Head of Strategy" },
      { title: "Ryan Chen", description: "Lead Designer" },
    ],
  }),
  Blog: () => ({
    headline: "Latest Insights",
    subheadline: "Stay updated with industry news and tips",
  }),
  Contact: (b) => ({
    headline: "Get In Touch",
    subheadline: `Reach out to ${b.businessName} in ${b.location}. We'd love to hear from you.`,
    cta: "Send Message",
  }),
  Stats: (b) => ({
    headline: "Our Numbers",
    items: [
      { title: "500+", description: "Happy Clients" },
      { title: "10+", description: "Years Experience" },
      { title: "98%", description: "Satisfaction Rate" },
      { title: b.location, description: "Primary Market" },
    ],
  }),
  LogoCloud: () => ({ headline: "Trusted By" }),
  Footer: (b) => ({ headline: b.businessName }),
};

function buildSectionContent(type: SectionType, biz: BusinessInfo): GeneratedSectionContent {
  return CONTENT_TEMPLATES[type]?.(biz) ?? {};
}

function buildSEO(pageName: string, biz: BusinessInfo) {
  return {
    title: `${pageName} | ${biz.businessName}`,
    description: `${biz.description.slice(0, 155) || `${biz.businessName} — ${biz.industry} specialists in ${biz.location}.`}`,
    keywords: [biz.industry.toLowerCase(), biz.location.toLowerCase(), biz.businessName.toLowerCase(), pageName.toLowerCase()],
    ogTitle: `${pageName} | ${biz.businessName}`,
    ogDescription: biz.description.slice(0, 120) || `${biz.businessName} delivers expert ${biz.industry} services.`,
  };
}

function buildBrandKit(biz: BusinessInfo, prefs: DesignPreferences): GeneratedBrandKit {
  const fontMap: Record<string, { heading: string; body: string }> = {
    modern: { heading: "Plus Jakarta Sans", body: "Inter" },
    corporate: { heading: "Raleway", body: "Source Sans 3" },
    luxury: { heading: "Cormorant Garamond", body: "Lato" },
    startup: { heading: "Space Grotesk", body: "DM Sans" },
    minimal: { heading: "Sora", body: "Manrope" },
    creative: { heading: "Righteous", body: "Nunito" },
  };
  const fonts = fontMap[prefs.style] ?? { heading: "Inter", body: "Inter" };
  const accentMap: Record<string, string> = {
    modern: "#f59e0b",
    corporate: "#0ea5e9",
    luxury: "#d4af37",
    startup: "#10b981",
    minimal: "#6b7280",
    creative: "#f43f5e",
  };
  return {
    name: `${biz.businessName} Brand`,
    primaryColor: prefs.primaryColor,
    secondaryColor: prefs.secondaryColor,
    accentColor: accentMap[prefs.style] ?? "#f59e0b",
    fontHeading: fonts.heading,
    fontBody: fonts.body,
    buttonStyle: prefs.style === "luxury" ? "sharp" : prefs.style === "startup" || prefs.style === "creative" ? "pill" : "rounded",
  };
}

function buildNavigation(pages: StandardPage[]): GeneratedNavItem[] {
  const labelMap: Record<StandardPage, string> = {
    home: "Home",
    about: "About",
    services: "Services",
    pricing: "Pricing",
    portfolio: "Portfolio",
    "case-studies": "Case Studies",
    blog: "Blog",
    faq: "FAQ",
    contact: "Contact",
  };
  return pages.map((p) => ({
    label: labelMap[p],
    href: p === "home" ? "/" : `/${p}`,
  }));
}

function generateWebsiteStructure(
  biz: BusinessInfo,
  prefs: DesignPreferences,
  pages: PageSelection,
): GeneratedWebsite {
  const brandKit = buildBrandKit(biz, prefs);
  const navigation = buildNavigation(pages.standard);

  const generatedPages: GeneratedPage[] = pages.standard.map((pageSlug) => {
    const sectionTypes = SECTION_MAPS[pageSlug] ?? ["Header", "Hero", "CTA", "Footer"];
    const sections: GeneratedSection[] = sectionTypes.map((type, idx) => ({
      id: nanoid(),
      type,
      content: buildSectionContent(type, biz),
      order: idx,
    }));
    const pageName = pageSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return {
      id: nanoid(),
      name: pageName,
      slug: pageSlug === "home" ? "/" : `/${pageSlug}`,
      isStandard: true,
      sections,
      seo: buildSEO(pageName, biz),
    };
  });

  // Add custom pages
  for (const cp of pages.custom) {
    generatedPages.push({
      id: nanoid(),
      name: cp.name,
      slug: `/${cp.slug}`,
      isStandard: false,
      sections: [
        { id: nanoid(), type: "Header", content: buildSectionContent("Header", biz), order: 0 },
        { id: nanoid(), type: "Hero", content: buildSectionContent("Hero", biz), order: 1 },
        { id: nanoid(), type: "CTA", content: buildSectionContent("CTA", biz), order: 2 },
        { id: nanoid(), type: "Footer", content: buildSectionContent("Footer", biz), order: 3 },
      ],
      seo: buildSEO(cp.name, biz),
    });
  }

  return {
    id: nanoid(),
    projectName: biz.businessName,
    createdAt: new Date().toISOString(),
    businessInfo: biz,
    designPreferences: prefs,
    brandKit,
    pages: generatedPages,
    navigation,
    globalSEO: {
      siteName: biz.businessName,
      siteDescription: biz.description || `${biz.businessName} — ${biz.industry} specialists`,
      keywords: [biz.industry, biz.location, biz.businessName],
    },
  };
}

// ─── Section → EditorNode converter ──────────────────────────────────────────

const SECTION_TO_BLOCK: Partial<Record<SectionType, string>> = {
  Hero:         "hero-carousel",
  Features:     "features-banner",
  Services:     "features-banner",
  Stats:        "features-banner",
  Team:         "features-banner",
  Testimonials: "promo-banner",
  Pricing:      "promo-banner",
  CTA:          "promo-banner",
  About:        "text-image",
  Portfolio:    "text-image",
  Blog:         "blog-section",
  Contact:      "contact-form",
  Header:       "page-header",
  LogoCloud:    "brand-carousel",
  FAQ:          "text-image",
  Footer:       "custom-html",
};

function sectionToEditorNode(section: GeneratedSection): EditorNode {
  const blockType = SECTION_TO_BLOCK[section.type];
  const c = section.content;

  if (!blockType) {
    return {
      id: nanoid(),
      type: "section",
      tag: "section",
      className: "py-16 px-6",
      content: c.headline ?? section.type,
      children: [],
    };
  }

  // Build typed-block data per blockType
  let data: Record<string, unknown> = {};

  if (blockType === "hero-carousel") {
    data = {
      slides: [{
        title: c.headline ?? "",
        subtitle: c.subheadline ?? "",
        badge: "",
        ctaText: c.cta ?? "Get Started",
        ctaUrl: "/contact",
        image: "",
      }],
      autoPlayMs: 0,
    };
  } else if (blockType === "features-banner") {
    data = {
      features: (c.items ?? []).map((item) => ({
        icon: item.icon ?? "Star",
        title: item.title,
        description: item.description,
      })),
    };
  } else if (blockType === "promo-banner") {
    data = {
      title: c.headline ?? "",
      subtitle: c.subheadline ?? "",
      description: c.body ?? "",
      primaryCtaText: c.cta ?? "Learn More",
      primaryCtaUrl: "/contact",
      secondaryCtaText: "",
      secondaryCtaUrl: "",
      image: "",
      badge: "",
    };
  } else if (blockType === "text-image") {
    data = {
      heading: c.headline ?? "",
      paragraphs: [c.subheadline ?? "", c.body ?? ""].filter(Boolean),
      image: "",
      imagePosition: "right",
      ctaText: c.cta ?? "",
      ctaUrl: "/contact",
    };
  } else if (blockType === "blog-section") {
    data = {
      title: c.headline ?? "Latest Insights",
      subtitle: c.subheadline ?? "",
      posts: [],
      displayMode: "grid",
    };
  } else if (blockType === "contact-form") {
    data = {
      formTitle: c.headline ?? "Get In Touch",
      formSubtitle: c.subheadline ?? "",
      subjects: ["General Inquiry", "Quote Request", "Support"],
    };
  } else if (blockType === "page-header") {
    data = {
      title: c.headline ?? "",
      subtitle: c.subheadline ?? "",
    };
  } else if (blockType === "brand-carousel") {
    data = { title: c.headline ?? "", brands: [] };
  } else if (blockType === "custom-html") {
    data = { html: `<!-- ${section.type} -->` };
  }

  return {
    id: nanoid(),
    type: "typed-block",
    tag: "div",
    className: "",
    blockType,
    blockData: data,
    children: [],
  } as EditorNode;
}

export function convertPageToEditorNodes(page: GeneratedPage): EditorNode[] {
  return page.sections
    .sort((a, b) => a.order - b.order)
    .map(sectionToEditorNode);
}

// ─── Store ────────────────────────────────────────────────────────────────────

interface AIStudioState {
  // Stats
  stats: AIStudioStats;

  // Projects history
  projects: AIProject[];

  // Wizard (Advanced Setup — 4 steps)
  wizard: WizardState;

  // Quick Flow (Prompt-First generation)
  quickFlow: QuickFlowState;

  // Actions — wizard lifecycle
  openWizard: () => void;
  openWizardKeepData: () => void;
  closeWizard: () => void;
  setWizardStep: (step: WizardStep) => void;
  setBusinessInfo: (info: Partial<BusinessInfo>) => void;
  setDesignPreferences: (prefs: Partial<DesignPreferences>) => void;
  setPageSelection: (selection: Partial<PageSelection>) => void;

  // Actions — quick flow
  openQuickFlow: (parsed: ParsedPrompt) => void;
  closeQuickFlow: () => void;
  prefillWizardFromPrompt: (parsed: ParsedPrompt) => void;

  // Actions — generation
  startGeneration: () => Promise<void>;
  setTaskStatus: (id: GenerationTaskId, status: GenerationTaskStatus) => void;

  // Actions — projects
  saveProject: (website: GeneratedWebsite) => string;
  updateProjectStatus: (id: string, status: AIProject["status"]) => void;
  updateProjectBrandColors: (id: string, colors: { primaryColor?: string; secondaryColor?: string; accentColor?: string }) => void;
  deleteProject: (id: string) => void;
}

const THUMBNAIL_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
  "#10b981", "#0ea5e9", "#f43f5e", "#14b8a6",
];

export const useAIStudioStore = create<AIStudioState>()(
  persist(
    (set, get) => ({
      stats: {
        websitesGenerated: 0,
        pagesGenerated: 0,
        creditsRemaining: 100,
        creditsTotal: 100,
        contentGenerated: 0,
        savedTemplates: 0,
      },

      projects: [],

      quickFlow: {
        isOpen: false,
        parsed: null,
      },

      wizard: {
        isOpen: false,
        currentStep: 1,
        businessInfo: DEFAULT_BUSINESS_INFO,
        designPreferences: DEFAULT_DESIGN_PREFS,
        pageSelection: DEFAULT_PAGE_SELECTION,
        generationTasks: GENERATION_TASKS.map((t) => ({ ...t })),
        generatedWebsite: null,
        isGenerating: false,
        generationComplete: false,
        currentProjectId: null,
      },

      openWizard: () =>
        set((s) => ({
          wizard: {
            ...s.wizard,
            isOpen: true,
            currentStep: 1,
            businessInfo: DEFAULT_BUSINESS_INFO,
            designPreferences: DEFAULT_DESIGN_PREFS,
            pageSelection: DEFAULT_PAGE_SELECTION,
            generationTasks: GENERATION_TASKS.map((t) => ({ ...t })),
            generatedWebsite: null,
            isGenerating: false,
            generationComplete: false,
            currentProjectId: null,
          },
        })),

      openWizardKeepData: () =>
        set((s) => ({ wizard: { ...s.wizard, isOpen: true } })),

      closeWizard: () =>
        set((s) => ({ wizard: { ...s.wizard, isOpen: false } })),

      setWizardStep: (step) =>
        set((s) => ({ wizard: { ...s.wizard, currentStep: step } })),

      setBusinessInfo: (info) =>
        set((s) => ({
          wizard: {
            ...s.wizard,
            businessInfo: { ...s.wizard.businessInfo, ...info },
          },
        })),

      setDesignPreferences: (prefs) =>
        set((s) => ({
          wizard: {
            ...s.wizard,
            designPreferences: { ...s.wizard.designPreferences, ...prefs },
          },
        })),

      setPageSelection: (selection) =>
        set((s) => ({
          wizard: {
            ...s.wizard,
            pageSelection: { ...s.wizard.pageSelection, ...selection },
          },
        })),

      openQuickFlow: (parsed) =>
        set((s) => ({
          quickFlow: { isOpen: true, parsed },
          // Pre-fill wizard data so startGeneration() uses it
          wizard: {
            ...s.wizard,
            businessInfo: {
              businessName: parsed.businessType,
              industry: parsed.industry,
              location: parsed.location,
              websiteGoal: parsed.goal,
              targetAudience: parsed.targetAudience,
              description: parsed.description,
              competitors: "",
              existingUrl: "",
            },
            designPreferences: {
              style: parsed.suggestedStyle,
              layout: parsed.suggestedLayout,
              primaryColor: parsed.primaryColor,
              secondaryColor: parsed.secondaryColor,
              typographyPreference: "Inter",
              visualStyle: "clean",
            },
            pageSelection: {
              standard: parsed.suggestedPages,
              custom: [],
            },
            generatedWebsite: null,
            isGenerating: false,
            generationComplete: false,
            currentProjectId: null,
            generationTasks: GENERATION_TASKS.map((t) => ({ ...t })),
          },
        })),

      closeQuickFlow: () =>
        set((s) => ({ quickFlow: { ...s.quickFlow, isOpen: false } })),

      prefillWizardFromPrompt: (parsed) =>
        set((s) => ({
          wizard: {
            ...s.wizard,
            businessInfo: {
              businessName: parsed.businessType,
              industry: parsed.industry,
              location: parsed.location,
              websiteGoal: parsed.goal,
              targetAudience: parsed.targetAudience,
              description: parsed.description,
              competitors: "",
              existingUrl: "",
            },
            designPreferences: {
              style: parsed.suggestedStyle,
              layout: parsed.suggestedLayout,
              primaryColor: parsed.primaryColor,
              secondaryColor: parsed.secondaryColor,
              typographyPreference: "Inter",
              visualStyle: "clean",
            },
            pageSelection: {
              standard: parsed.suggestedPages,
              custom: [],
            },
          },
        })),

      setTaskStatus: (id, status) =>
        set((s) => ({
          wizard: {
            ...s.wizard,
            generationTasks: s.wizard.generationTasks.map((t) =>
              t.id === id ? { ...t, status } : t,
            ),
          },
        })),

      startGeneration: async () => {
        const { wizard, setTaskStatus } = get();
        const tasks = GENERATION_TASKS.map((t) => ({ ...t, status: "pending" as const }));

        set((s) => ({
          wizard: {
            ...s.wizard,
            isGenerating: true,
            generationComplete: false,
            generationTasks: tasks,
            generatedWebsite: null,
          },
        }));

        const taskDelays: Record<GenerationTaskId, number> = {
          sitemap: 900,
          content: 1400,
          "brand-kit": 800,
          sections: 1200,
          seo: 700,
          layouts: 900,
          "editor-structure": 1000,
        };

        for (const task of GENERATION_TASKS) {
          setTaskStatus(task.id, "running");
          await new Promise((r) => setTimeout(r, taskDelays[task.id]));
          setTaskStatus(task.id, "completed");
        }

        const website = generateWebsiteStructure(
          wizard.businessInfo,
          wizard.designPreferences,
          wizard.pageSelection,
        );

        const pageCount = website.pages.length;
        const sectionCount = website.pages.reduce((sum, p) => sum + p.sections.length, 0);

        // Auto-save the project so it appears in the list immediately
        const projectId = nanoid();
        const color = THUMBNAIL_COLORS[Math.floor(Math.random() * THUMBNAIL_COLORS.length)];
        const project: AIProject = {
          id: projectId,
          name: website.projectName,
          industry: website.businessInfo.industry,
          status: "preview",
          createdAt: website.createdAt,
          updatedAt: new Date().toISOString(),
          website,
          thumbnailColor: color,
        };

        set((s) => ({
          wizard: {
            ...s.wizard,
            isGenerating: false,
            generationComplete: true,
            generatedWebsite: website,
            currentProjectId: projectId,
          },
          projects: [project, ...s.projects],
          stats: {
            ...s.stats,
            websitesGenerated: s.stats.websitesGenerated + 1,
            pagesGenerated: s.stats.pagesGenerated + pageCount,
            contentGenerated: s.stats.contentGenerated + sectionCount,
            creditsRemaining: Math.max(0, s.stats.creditsRemaining - 5),
          },
        }));
      },

      saveProject: (website) => {
        const id = nanoid();
        const color = THUMBNAIL_COLORS[Math.floor(Math.random() * THUMBNAIL_COLORS.length)];
        const project: AIProject = {
          id,
          name: website.projectName,
          industry: website.businessInfo.industry,
          status: "preview",
          createdAt: website.createdAt,
          updatedAt: new Date().toISOString(),
          website,
          thumbnailColor: color,
        };
        set((s) => ({ projects: [project, ...s.projects] }));
        return id;
      },

      updateProjectStatus: (id, status) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p,
          ),
        })),

      updateProjectBrandColors: (id, colors) =>
        set((s) => ({
          projects: s.projects.map((p) => {
            if (p.id !== id || !p.website) return p;
            return {
              ...p,
              updatedAt: new Date().toISOString(),
              website: {
                ...p.website,
                brandKit: { ...p.website.brandKit, ...colors },
              },
            };
          }),
          wizard: s.wizard.currentProjectId === id && s.wizard.generatedWebsite
            ? {
                ...s.wizard,
                generatedWebsite: {
                  ...s.wizard.generatedWebsite,
                  brandKit: { ...s.wizard.generatedWebsite.brandKit, ...colors },
                },
              }
            : s.wizard,
        })),

      deleteProject: (id) =>
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),
    }),
    { name: "ervflow-ai-studio" },
  ),
);
