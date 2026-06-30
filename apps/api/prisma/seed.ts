import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Default dev password for all seeded accounts. Override via SEED_PASSWORD.
const PASSWORD = process.env.SEED_PASSWORD ?? "ChangeMe123!";

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  // ── I18N (Internationalization) & LOCALE/TIMEZONE SUPPORT ──
  // DATABASE SCHEMA CHANGES (migrations applied):
  // 1. Added User.locale (nullable) - per-user UI language preference
  // 2. Added Organization.defaultLocale - company-wide default (default: "en")
  // 3. Added AdminSettings.timezone - global timezone (default: "UTC")
  // 4. Added Organization.timezone - org-specific timezone (nullable)
  //
  // FRONTEND MESSAGE FILES (apps/web/src/i18n/messages/):
  // - en.json: 400+ English message keys (master catalog)
  // - hi.json: 400+ Hindi translations (machine-translated)
  // - fr.json: 400+ French translations (machine-translated)
  //
  // MESSAGE NAMESPACES (organized by feature):
  // admin.settingsNav, admin.appSettings, admin.payment, admin.storage,
  // admin.email, admin.companies, admin.dashboard, admin.packages,
  // admin.modules, admin.users, admin.themes, admin.crm, admin.store, admin.cms
  //
  // LOCALE RESOLUTION (frontend):
  // Priority: NEXT_LOCALE cookie → Accept-Language header → "en" default
  // Per-user locale (User.locale) overrides organization defaultLocale
  //
  // TO CONTINUE I18N IMPLEMENTATION:
  // 1. Wire remaining view files following the 5-minute pattern:
  //    - Import: import { useTranslations } from "next-intl"
  //    - Hook: const t = useTranslations("admin.namespace")
  //    - Replace: hardcoded strings → t("key")
  //    - Translate: Add keys to en.json, hi.json, fr.json
  // 2. Validate: npx tsc --noEmit && JSON.parse all message files
  // 3. Test: Open app with ?locale=hi or ?locale=fr to verify
  //
  // OPTIONAL: DATABASE-BACKED I18N (future):
  // If moving beyond static JSON files, create Prisma model:
  //   model Message {
  //     id        String @id @default(cuid())
  //     namespace String
  //     key       String
  //     en        String
  //     hi        String?
  //     fr        String?
  //     @@unique([namespace, key])
  //   }
  // Then seed: await prisma.message.createMany({ data: allMessages })
  //
  // REFERENCE FILES:
  // - apps/web/src/i18n/request.ts - server-side locale resolution
  // - apps/web/src/i18n/routing.ts - next-intl routing config
  // - apps/web/src/i18n/config.ts - locale & translation configuration
  // - I18N_STATUS.md - complete team guide (28 wired files, 400+ keys, wiring pattern)

  // ── Module catalog (every product feature is a module) ──
  const MODULES: Array<{ key: string; name: string; description: string }> = [
    {
      key: "CMS",
      name: "CMS / Editor",
      description: "Pages, blogs, media & comments",
    },
    {
      key: "CRM",
      name: "CRM",
      description: "Leads, contacts, campaigns & tasks",
    },
    {
      key: "EMAIL",
      name: "Email Automations",
      description: "Campaigns & workflows",
    },
    { key: "CALLING", name: "Calling", description: "Voice & call management" },
    {
      key: "SEO",
      name: "SEO Tools",
      description: "SEO analysis & optimization",
    },
    {
      key: "LIGHTHOUSE",
      name: "Lighthouse",
      description: "Performance audits",
    },
    { key: "MAIL", name: "Mail", description: "Email management" },
    { key: "STORE", name: "Store", description: "Products & order management" },
    {
      key: "PAYMENTS",
      name: "Payments",
      description: "Payment gateway integrations",
    },
    { key: "REPORTS", name: "Reports", description: "Analytics & reporting" },
  ];
  const moduleIdByKey: Record<string, string> = {};
  for (const m of MODULES) {
    const mod = await prisma.module.upsert({
      where: { key: m.key },
      update: { name: m.name, description: m.description },
      create: m,
    });
    moduleIdByKey[m.key] = mod.id;
  }

  // ── Packages (plans) + module entitlements ──────────────
  const packages: Array<{
    name: string;
    slug: string;
    description: string;
    priceCents: number;
    maxUsers: number;
    modules: string[];
  }> = [
    {
      name: "Free",
      slug: "free",
      description: "CMS only — get started for free",
      priceCents: 0,
      maxUsers: 3,
      modules: ["CMS"],
    },
    {
      name: "Pro",
      slug: "pro",
      description: "Content, CRM & marketing for growing teams",
      priceCents: 4900,
      maxUsers: 10,
      modules: [
        "CMS",
        "CRM",
        "EMAIL",
        "SEO",
        "LIGHTHOUSE",
        "MAIL",
        "STORE",
        "REPORTS",
      ],
    },
    {
      name: "Enterprise",
      slug: "enterprise",
      description: "Every module, with a high user cap",
      priceCents: 19900,
      maxUsers: 100,
      modules: MODULES.map((m) => m.key),
    },
    {
      name: "CMS Only",
      slug: "cms-only",
      description: "Just the CMS module",
      priceCents: 1000,
      maxUsers: 5,
      modules: ["CMS"],
    },
  ];

  const bySlug: Record<string, string> = {};
  for (const p of packages) {
    const pkg = await prisma.package.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        priceCents: p.priceCents,
        maxUsers: p.maxUsers,
      },
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        priceCents: p.priceCents,
        maxUsers: p.maxUsers,
      },
    });
    bySlug[p.slug] = pkg.id;
    // Reset module assignments idempotently.
    await prisma.packageModule.deleteMany({ where: { packageId: pkg.id } });
    await prisma.packageModule.createMany({
      data: p.modules.map((key) => ({
        packageId: pkg.id,
        moduleId: moduleIdByKey[key],
      })),
    });
  }

  // ── Super admin (platform-level, no organization) ───────
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@vyntra.com" },
    update: { superAdmin: true, password: passwordHash },
    create: {
      email: "superadmin@vyntra.com",
      name: "Super Admin",
      password: passwordHash,
      superAdmin: true,
    },
  });
  // organizationId is null for the platform-wide SUPER_ADMIN role; Postgres
  // treats NULLs as distinct in the composite unique, so find-or-create.
  const existingSuperRole = await prisma.userRole.findFirst({
    where: {
      userId: superAdmin.id,
      role: Role.SUPER_ADMIN,
      organizationId: null,
    },
  });
  if (!existingSuperRole) {
    await prisma.userRole.create({
      data: { userId: superAdmin.id, role: Role.SUPER_ADMIN },
    });
  }

  // ── Sample company on the Pro plan ──────────────────────
  const org = await prisma.organization.upsert({
    where: { slug: "acme-corp" },
    update: { subdomain: "acme" },
    create: {
      name: "Acme Corp",
      slug: "acme-corp",
      email: "admin@acme.com",
      subdomain: "acme",
      maxUsers: 10,
      subscription: {
        create: { packageId: bySlug["pro"], billingEmail: "admin@acme.com" },
      },
    },
  });

  const orgAdmin = await prisma.user.upsert({
    where: { email: "admin@acme.com" },
    update: { password: passwordHash, organizationId: org.id },
    create: {
      email: "admin@acme.com",
      name: "Acme Admin",
      password: passwordHash,
      organizationId: org.id,
    },
  });
  const existingAdminRole = await prisma.userRole.findFirst({
    where: { userId: orgAdmin.id, organizationId: org.id },
  });
  if (!existingAdminRole) {
    await prisma.userRole.create({
      data: {
        userId: orgAdmin.id,
        organizationId: org.id,
        role: Role.ORG_ADMIN,
      },
    });
  }

  // Helper: ensure a user exists in an org with a given role (idempotent).
  const ensureMember = async (
    email: string,
    name: string,
    organizationId: string,
    role: Role,
  ) => {
    const u = await prisma.user.upsert({
      where: { email },
      update: { password: passwordHash, organizationId },
      create: { email, name, password: passwordHash, organizationId },
    });
    const existing = await prisma.userRole.findFirst({
      where: { userId: u.id, organizationId },
    });
    if (!existing) {
      await prisma.userRole.create({
        data: { userId: u.id, organizationId, role },
      });
    }
  };

  // One user per role inside Acme (Pro plan).
  await ensureMember("editor@acme.com", "Acme Editor", org.id, Role.EDITOR);
  await ensureMember("user@acme.com", "Acme User", org.id, Role.USER);
  await ensureMember("viewer@acme.com", "Acme Viewer", org.id, Role.VIEWER);

  // ── Second company on the Free plan (shows package-based nav gating) ──
  const bloom = await prisma.organization.upsert({
    where: { slug: "bloom-studio" },
    update: { subdomain: "bloom" },
    create: {
      name: "Bloom Studio",
      slug: "bloom-studio",
      email: "admin@bloom.com",
      subdomain: "bloom",
      maxUsers: 3,
      subscription: {
        create: { packageId: bySlug["free"], billingEmail: "admin@bloom.com" },
      },
    },
  });
  await ensureMember(
    "admin@bloom.com",
    "Bloom Admin",
    bloom.id,
    Role.ORG_ADMIN,
  );

  // ── Third company on the Free plan ──────────────────────
  const startup = await prisma.organization.upsert({
    where: { slug: "startup-io" },
    update: {},
    create: {
      name: "Startup IO",
      slug: "startup-io",
      email: "founder@startup.io",
      maxUsers: 3,
      subscription: {
        create: {
          packageId: bySlug["free"],
          billingEmail: "founder@startup.io",
        },
      },
    },
  });
  await ensureMember(
    "founder@startup.io",
    "Founder",
    startup.id,
    Role.ORG_ADMIN,
  );

  // ── Fourth company on the CMS Only plan ─────────────────
  const ekam = await prisma.organization.upsert({
    where: { slug: "ekam-infotech" },
    update: {},
    create: {
      name: "Ekam Infotech",
      slug: "ekam-infotech",
      email: "ekam@company.com",
      maxUsers: 5,
      subscription: {
        create: {
          packageId: bySlug["cms-only"],
          billingEmail: "ekam@company.com",
        },
      },
    },
  });
  await ensureMember(
    "simranjeet1012@gmail.com",
    "Simranjeet Singh",
    ekam.id,
    Role.ORG_ADMIN,
  );

  // ── CMS pages for Acme Corp ─────────────────────────────
  const acmePages = [
    {
      slug: "home",
      title: "Home",
      content: "<h1>Welcome to Acme Corp</h1><p>We build world-class products.</p>",
      metaDesc: "Welcome to Acme Corp",
      isLandingPage: true,
    },
    {
      slug: "about-us",
      title: "About Us",
      content: "<h1>About Acme Corp</h1><p>Founded in 2020, Acme Corp is on a mission to simplify business operations.</p>",
      metaDesc: "Learn about Acme Corp",
      isLandingPage: false,
    },
  ];
  for (const p of acmePages) {
    await prisma.page.upsert({
      where: { organizationId_slug: { organizationId: org.id, slug: p.slug } },
      update: { title: p.title, content: p.content, metaDesc: p.metaDesc, isLandingPage: p.isLandingPage, published: true, publishedAt: new Date("2026-01-01") },
      create: { ...p, organizationId: org.id, published: true, publishedAt: new Date("2026-01-01") },
    });
  }

  // ── CMS pages for Bloom Studio ───────────────────────────
  const bloomPages = [
    {
      slug: "home",
      title: "Home",
      content: "<h1>Welcome to Bloom Studio</h1><p>We craft beautiful digital experiences.</p>",
      metaDesc: "Welcome to Bloom Studio",
      isLandingPage: true,
    },
    {
      slug: "about-us",
      title: "About Us",
      content: "<h1>About Bloom Studio</h1><p>A creative studio focused on design and storytelling.</p>",
      metaDesc: "About Bloom Studio",
      isLandingPage: false,
    },
  ];
  for (const p of bloomPages) {
    await prisma.page.upsert({
      where: { organizationId_slug: { organizationId: bloom.id, slug: p.slug } },
      update: { title: p.title, content: p.content, metaDesc: p.metaDesc, isLandingPage: p.isLandingPage, published: true, publishedAt: new Date("2026-01-01") },
      create: { ...p, organizationId: bloom.id, published: true, publishedAt: new Date("2026-01-01") },
    });
  }

  // ── Global themes (managed by superadmin, available to all orgs) ──────────
  const GLOBAL_THEMES: Array<{
    id: string;
    name: string;
    description: string;
    thumbnail: string;
    category: string;
    tags: string[];
    variables: Record<string, string>;
  }> = [
    {
      id: "LUMIERE",
      name: "LUMIÈRE",
      description: "Luxury cosmetics brand template with teal and gold accents. Bold hero, product grid, commitment cards, and elegant typography for premium beauty brands.",
      thumbnail: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80",
      category: "Cosmetics",
      tags: ["Luxury", "Cosmetics", "Teal", "Gold"],
      variables: {
        "--primary": "#0d9488",
        "--primary-foreground": "#ffffff",
        "--secondary": "#d97706",
        "--accent": "#f59e0b",
        "--background": "#faf9f7",
        "--foreground": "#1c1917",
        "--muted": "#f5f4f2",
        "--muted-foreground": "#78716c",
        "--card": "#ffffff",
        "--border": "#e7e5e4",
        "--radius": "0.25rem",
        "--font-heading": "'Cormorant Garamond', Georgia, serif",
        "--font-body": "'Jost', system-ui, sans-serif",
      },
    },
    {
      id: "porto-lando",
      name: "Lando",
      description: "Vibrant portfolio with a rose-to-orange gradient hero. Perfect for creative professionals showcasing work, testimonials, and newsletter sections.",
      thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80",
      category: "Portfolio",
      tags: ["Creative", "Gradient", "Rose", "Orange"],
      variables: {
        "--primary": "#f43f5e",
        "--primary-foreground": "#ffffff",
        "--secondary": "#f97316",
        "--accent": "#fb923c",
        "--background": "#fff7f5",
        "--foreground": "#1c1917",
        "--muted": "#ffeae6",
        "--muted-foreground": "#9a3412",
        "--card": "#ffffff",
        "--border": "#fecaca",
        "--radius": "0.75rem",
        "--font-heading": "'Playfair Display', Georgia, serif",
        "--font-body": "'Inter', system-ui, sans-serif",
      },
    },
    {
      id: "porto-florent",
      name: "Florent S.",
      description: "Dark editorial portfolio with bold orange-red accents on deep black. Ideal for photographers and visual artists seeking dramatic, high-impact presentation.",
      thumbnail: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80",
      category: "Portfolio",
      tags: ["Dark", "Editorial", "Bold", "Black"],
      variables: {
        "--primary": "#ef4444",
        "--primary-foreground": "#ffffff",
        "--secondary": "#f97316",
        "--accent": "#fbbf24",
        "--background": "#0a0a0a",
        "--foreground": "#fafafa",
        "--muted": "#1a1a1a",
        "--muted-foreground": "#a3a3a3",
        "--card": "#141414",
        "--border": "#262626",
        "--radius": "0.5rem",
        "--font-heading": "'Bebas Neue', 'Arial Black', sans-serif",
        "--font-body": "'Inter', system-ui, sans-serif",
      },
    },
    {
      id: "porto-minimal",
      name: "Minimal Folio",
      description: "Clean, typography-driven portfolio with stark black-and-white contrasts. Lets your work speak without distraction — ideal for minimalist-minded creatives.",
      thumbnail: "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&w=800&q=80",
      category: "Portfolio",
      tags: ["Minimal", "Clean", "Monochrome", "Typography"],
      variables: {
        "--primary": "#000000",
        "--primary-foreground": "#ffffff",
        "--secondary": "#525252",
        "--accent": "#737373",
        "--background": "#ffffff",
        "--foreground": "#000000",
        "--muted": "#f5f5f5",
        "--muted-foreground": "#737373",
        "--card": "#fafafa",
        "--border": "#e5e5e5",
        "--radius": "0rem",
        "--font-heading": "'DM Serif Display', Georgia, serif",
        "--font-body": "'DM Sans', system-ui, sans-serif",
      },
    },
    {
      id: "biz-talentify",
      name: "Talentify",
      description: "SaaS and HR platform template with strong primary-to-violet gradients. Built for talent management, recruitment platforms, and B2B business showcases.",
      thumbnail: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=80",
      category: "Business",
      tags: ["SaaS", "HR", "Violet", "Gradient"],
      variables: {
        "--primary": "#6366f1",
        "--primary-foreground": "#ffffff",
        "--secondary": "#8b5cf6",
        "--accent": "#a78bfa",
        "--background": "#f8f9ff",
        "--foreground": "#1e1b4b",
        "--muted": "#eef2ff",
        "--muted-foreground": "#6366f1",
        "--card": "#ffffff",
        "--border": "#c7d2fe",
        "--radius": "0.75rem",
        "--font-heading": "'Plus Jakarta Sans', system-ui, sans-serif",
        "--font-body": "'Inter', system-ui, sans-serif",
      },
    },
    {
      id: "biz-noora",
      name: "Noora",
      description: "Light, professional business template with a neutral palette. Clean sections for features, testimonials, and pricing — suits consulting and service companies.",
      thumbnail: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
      category: "Business",
      tags: ["Professional", "Light", "Neutral", "Clean"],
      variables: {
        "--primary": "#3b82f6",
        "--primary-foreground": "#ffffff",
        "--secondary": "#64748b",
        "--accent": "#0ea5e9",
        "--background": "#f8fafc",
        "--foreground": "#0f172a",
        "--muted": "#f1f5f9",
        "--muted-foreground": "#64748b",
        "--card": "#ffffff",
        "--border": "#e2e8f0",
        "--radius": "0.5rem",
        "--font-heading": "'Manrope', system-ui, sans-serif",
        "--font-body": "'Inter', system-ui, sans-serif",
      },
    },
    {
      id: "biz-pixend",
      name: "Pixend",
      description: "Deep blue tech startup template with gradient hero and feature grids. Polished and professional for SaaS products, apps, and technology companies.",
      thumbnail: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&q=80",
      category: "Business",
      tags: ["Tech", "Blue", "SaaS", "Startup"],
      variables: {
        "--primary": "#3b82f6",
        "--primary-foreground": "#ffffff",
        "--secondary": "#1d4ed8",
        "--accent": "#60a5fa",
        "--background": "#0f172a",
        "--foreground": "#f8fafc",
        "--muted": "#1e293b",
        "--muted-foreground": "#94a3b8",
        "--card": "#1e293b",
        "--border": "#334155",
        "--radius": "0.5rem",
        "--font-heading": "'Space Grotesk', system-ui, sans-serif",
        "--font-body": "'Inter', system-ui, sans-serif",
      },
    },
    {
      id: "agency-portfolite",
      name: "Portfolite",
      description: "Bold, all-black creative agency template that makes a powerful statement. High-contrast design with gallery-forward layouts for ambitious creative studios.",
      thumbnail: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80",
      category: "Agency",
      tags: ["Dark", "Agency", "Bold", "Black"],
      variables: {
        "--primary": "#ffffff",
        "--primary-foreground": "#000000",
        "--secondary": "#f59e0b",
        "--accent": "#fbbf24",
        "--background": "#000000",
        "--foreground": "#ffffff",
        "--muted": "#111111",
        "--muted-foreground": "#a3a3a3",
        "--card": "#0d0d0d",
        "--border": "#1f1f1f",
        "--radius": "0rem",
        "--font-heading": "'Syne', 'Arial Black', sans-serif",
        "--font-body": "'Inter', system-ui, sans-serif",
      },
    },
    {
      id: "agency-finito",
      name: "Finito",
      description: "Navy and deep blue agency template with a polished corporate feel. Clean feature sections and case study layouts suited for established creative agencies.",
      thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
      category: "Agency",
      tags: ["Navy", "Corporate", "Blue", "Agency"],
      variables: {
        "--primary": "#1e3a5f",
        "--primary-foreground": "#ffffff",
        "--secondary": "#3b82f6",
        "--accent": "#60a5fa",
        "--background": "#f0f4f8",
        "--foreground": "#0f172a",
        "--muted": "#dce5ef",
        "--muted-foreground": "#1e3a5f",
        "--card": "#ffffff",
        "--border": "#bfcfe0",
        "--radius": "0.5rem",
        "--font-heading": "'Fraunces', Georgia, serif",
        "--font-body": "'Inter', system-ui, sans-serif",
      },
    },
    {
      id: "agency-limitless",
      name: "Limitless",
      description: "Vibrant violet-to-fuchsia gradient agency template that radiates creativity. Bold, energetic design for digital studios and forward-thinking creative agencies.",
      thumbnail: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80",
      category: "Agency",
      tags: ["Violet", "Fuchsia", "Gradient", "Creative"],
      variables: {
        "--primary": "#7c3aed",
        "--primary-foreground": "#ffffff",
        "--secondary": "#d946ef",
        "--accent": "#e879f9",
        "--background": "#faf5ff",
        "--foreground": "#2e1065",
        "--muted": "#f3e8ff",
        "--muted-foreground": "#7c3aed",
        "--card": "#ffffff",
        "--border": "#ddd6fe",
        "--radius": "1rem",
        "--font-heading": "'Clash Display', 'Arial Black', sans-serif",
        "--font-body": "'Satoshi', system-ui, sans-serif",
      },
    },
    {
      id: "resume-magnetto",
      name: "Magnetto",
      description: "Striking black and amber resume template with high-contrast typography. Makes a memorable impression — ideal for senior professionals who want to stand out.",
      thumbnail: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80",
      category: "Resume",
      tags: ["Black", "Amber", "High-Contrast", "Resume"],
      variables: {
        "--primary": "#f59e0b",
        "--primary-foreground": "#000000",
        "--secondary": "#fbbf24",
        "--accent": "#fcd34d",
        "--background": "#0a0a0a",
        "--foreground": "#fafafa",
        "--muted": "#1a1a1a",
        "--muted-foreground": "#a3a3a3",
        "--card": "#111111",
        "--border": "#292929",
        "--radius": "0.25rem",
        "--font-heading": "'Unbounded', 'Arial Black', sans-serif",
        "--font-body": "'Inter', system-ui, sans-serif",
      },
    },
    {
      id: "resume-classic",
      name: "Classic CV",
      description: "Traditional, professional CV template with neutral tones and timeless layout. Structured sections present credentials with understated elegance.",
      thumbnail: "https://images.unsplash.com/photo-1604871000636-074fa5117945?auto=format&fit=crop&w=800&q=80",
      category: "Resume",
      tags: ["Classic", "Neutral", "Professional", "CV"],
      variables: {
        "--primary": "#374151",
        "--primary-foreground": "#ffffff",
        "--secondary": "#6b7280",
        "--accent": "#9ca3af",
        "--background": "#f9fafb",
        "--foreground": "#111827",
        "--muted": "#f3f4f6",
        "--muted-foreground": "#6b7280",
        "--card": "#ffffff",
        "--border": "#e5e7eb",
        "--radius": "0.375rem",
        "--font-heading": "'Lora', Georgia, serif",
        "--font-body": "'Source Sans 3', system-ui, sans-serif",
      },
    },
    {
      id: "resume-vivid",
      name: "Vivid",
      description: "Emerald green resume template with a fresh, modern edge. Combines a strong personal brand with clean content sections for creative professionals.",
      thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
      category: "Resume",
      tags: ["Emerald", "Green", "Modern", "Fresh"],
      variables: {
        "--primary": "#059669",
        "--primary-foreground": "#ffffff",
        "--secondary": "#10b981",
        "--accent": "#34d399",
        "--background": "#f0fdf4",
        "--foreground": "#064e3b",
        "--muted": "#d1fae5",
        "--muted-foreground": "#065f46",
        "--card": "#ffffff",
        "--border": "#a7f3d0",
        "--radius": "0.5rem",
        "--font-heading": "'Outfit', system-ui, sans-serif",
        "--font-body": "'Inter', system-ui, sans-serif",
      },
    },
    {
      id: "shopingo",
      name: "Shopingo",
      description: "Sharp-corner e-commerce design with charcoal primary, clean white background, and bold red accents. Raleway typography throughout.",
      thumbnail: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80",
      category: "E-Commerce",
      tags: ["Shop", "E-Commerce", "Charcoal", "Red"],
      variables: {
        "--primary": "#212529",
        "--primary-foreground": "#ffffff",
        "--secondary": "#f9f9f9",
        "--accent": "#ff2c2c",
        "--background": "#ffffff",
        "--foreground": "#212529",
        "--muted": "#f9f9f9",
        "--muted-foreground": "#797979",
        "--card": "#ffffff",
        "--border": "#e1e1e1",
        "--radius": "0rem",
        "--font-heading": "'Raleway', system-ui, sans-serif",
        "--font-body": "'Raleway', system-ui, sans-serif",
      },
    },
  ];

  for (const t of GLOBAL_THEMES) {
    await prisma.theme.upsert({
      where: { id: t.id },
      update: {
        name: t.name,
        description: t.description,
        thumbnail: t.thumbnail,
        isGlobal: true,
      },
      create: {
        id: t.id,
        name: t.name,
        description: t.description,
        thumbnail: t.thumbnail,
        isGlobal: true,
        orgId: null,
      },
    });
  }
  console.log(`   Seeded ${GLOBAL_THEMES.length} global themes`);

  // ── Platform admin settings (email + storage configuration) ──────────────
  // Single global settings row read via findFirst by AdminSettingsService.
  // Seeded so teammates get a working email/storage setup out of the box.
  const ADMIN_SETTINGS = {
    siteName: "ERVFlow",
    supportEmail: "support@ervflow.com",
    logoUrl:
      "https://nag4pufb5s.ufs.sh/f/f56ClkdSwBjYaTmIN19ebHtVsi3B0zuyYpKFDvw46QGI15EO",
    faviconUrl:
      "http://localhost:3001/uploads/__superadmin__/branding/testlogo-1780808090328.png",
    primaryColor: "#f97316",
    secondaryColor: "#22c55e",
    accentColor: "#ec4899",
    // Email — Gmail SMTP
    emailProvider: "smtp",
    smtpConfig: {
      host: "smtp.gmail.com",
      port: 587,
      secure: true,
      username: "ervflowapp@gmail.com",
      password: "zpba lkwk mfiu rjow",
      fromEmail: "ervflowapp@gmail.com",
    } as object,
    // Storage — Uploadthing
    storageProvider: "uploadthing",
    uploadthingConfig: {
      apiKey:
        "eyJhcGlLZXkiOiJza19saXZlX2MzMGIzMDQyNDViZDBiOTFmYzc3ZTBiYTYwMTIxZWY3YmEzYTMzZThmZGU3NzlhYWY2NTJmNjgzYTlhYTE4N2IiLCJhcHBJZCI6Im5hZzRwdWZiNXMiLCJyZWdpb25zIjpbInNlYTEiXX0=",
    } as object,
  };
  const existingSettings = await prisma.adminSettings.findFirst();
  if (existingSettings) {
    await prisma.adminSettings.update({
      where: { id: existingSettings.id },
      data: ADMIN_SETTINGS,
    });
  } else {
    await prisma.adminSettings.create({ data: ADMIN_SETTINGS });
  }
  console.log("   Seeded admin settings (SMTP + Uploadthing storage)");

  // ── Store: Product Categories ──────────────────────────────────────────────
  console.log("🏪 Seeding store data for Acme Corp…");

  const catMap: Record<string, string> = {};

  const topLevelCats = [
    { key: "cat1", name: "Templates",        slug: "templates",        desc: "Digital templates for designers and developers.", sortOrder: 1 },
    { key: "cat2", name: "Subscriptions",    slug: "subscriptions",    desc: "Monthly and annual SaaS plans.",                  sortOrder: 2 },
    { key: "cat3", name: "Digital Downloads", slug: "digital-downloads", desc: "Ebooks, PDFs, and downloadable assets.",         sortOrder: 3 },
    { key: "cat4", name: "Merchandise",      slug: "merchandise",      desc: "Branded apparel and physical goods.",             sortOrder: 4 },
    { key: "cat5", name: "Services",         slug: "services",         desc: "Consulting and expert services.",                 sortOrder: 5 },
    { key: "cat6", name: "Gift Cards",       slug: "gift-cards",       desc: "Store gift cards and vouchers.",                  sortOrder: 6 },
  ];

  for (const c of topLevelCats) {
    const rec = await prisma.productCategory.upsert({
      where: { organizationId_slug: { organizationId: org.id, slug: c.slug } },
      update: { name: c.name, description: c.desc, sortOrder: c.sortOrder },
      create: { organizationId: org.id, name: c.name, slug: c.slug, description: c.desc, sortOrder: c.sortOrder, status: "active" },
    });
    catMap[c.key] = rec.id;
  }

  const childCats = [
    { key: "cat1a", parent: "cat1", name: "Dashboard UI",    slug: "dashboard-ui",    sortOrder: 1 },
    { key: "cat1b", parent: "cat1", name: "Landing Pages",   slug: "landing-pages",   sortOrder: 2 },
    { key: "cat1c", parent: "cat1", name: "Email Templates", slug: "email-templates-cat", sortOrder: 3 },
    { key: "cat3a", parent: "cat3", name: "Ebooks",          slug: "ebooks",          sortOrder: 1 },
    { key: "cat3b", parent: "cat3", name: "Design Assets",   slug: "design-assets",   sortOrder: 2 },
    { key: "cat3c", parent: "cat3", name: "Audio & Video",   slug: "audio-video",     sortOrder: 3 },
    { key: "cat4a", parent: "cat4", name: "Apparel",         slug: "apparel",         sortOrder: 1 },
    { key: "cat4b", parent: "cat4", name: "Accessories",     slug: "accessories",     sortOrder: 2 },
    { key: "cat5a", parent: "cat5", name: "Consulting",      slug: "consulting",      sortOrder: 1 },
    { key: "cat5b", parent: "cat5", name: "Development",     slug: "dev-services",    sortOrder: 2 },
  ];

  for (const c of childCats) {
    const rec = await prisma.productCategory.upsert({
      where: { organizationId_slug: { organizationId: org.id, slug: c.slug } },
      update: { name: c.name, sortOrder: c.sortOrder, parentId: catMap[c.parent] },
      create: { organizationId: org.id, name: c.name, slug: c.slug, parentId: catMap[c.parent], sortOrder: c.sortOrder, status: "active" },
    });
    catMap[c.key] = rec.id;
  }

  const grandchildCats = [
    { key: "cat3a1", parent: "cat3a", name: "Marketing",   slug: "ebooks-marketing", sortOrder: 1 },
    { key: "cat3a2", parent: "cat3a", name: "Development", slug: "ebooks-dev",       sortOrder: 2 },
    { key: "cat3a3", parent: "cat3a", name: "Design",      slug: "ebooks-design",    sortOrder: 3 },
  ];

  for (const c of grandchildCats) {
    const rec = await prisma.productCategory.upsert({
      where: { organizationId_slug: { organizationId: org.id, slug: c.slug } },
      update: { name: c.name, sortOrder: c.sortOrder, parentId: catMap[c.parent] },
      create: { organizationId: org.id, name: c.name, slug: c.slug, parentId: catMap[c.parent], sortOrder: c.sortOrder, status: "active" },
    });
    catMap[c.key] = rec.id;
  }

  console.log("   ✓ Product categories (19 records, 3-level tree)");

  // ── Store: Attributes ────────────────────────────────────────────────────
  const attrDefs = [
    {
      name: "Color", type: "color",
      values: ["Red", "Blue", "Black", "White", "Green", "Yellow"],
    },
    {
      name: "Size", type: "select",
      values: ["XS", "S", "M", "L", "XL", "XXL"],
    },
    {
      name: "Material", type: "select",
      values: ["Cotton", "Polyester", "Wool", "Silk", "Linen"],
    },
    {
      name: "Storage", type: "select",
      values: ["64GB", "128GB", "256GB", "512GB", "1TB"],
    },
    {
      name: "Warranty", type: "select",
      values: ["6 Months", "1 Year", "2 Years", "3 Years"],
    },
    {
      name: "Finish", type: "select",
      values: ["Matte", "Gloss", "Satin", "Brushed"],
    },
  ];

  for (const attr of attrDefs) {
    const existing = await prisma.storeAttribute.findFirst({
      where: { organizationId: org.id, name: attr.name },
    });
    let attrId: string;
    if (existing) {
      attrId = existing.id;
    } else {
      const created = await prisma.storeAttribute.create({
        data: { organizationId: org.id, name: attr.name, type: attr.type },
      });
      attrId = created.id;
    }
    for (let i = 0; i < attr.values.length; i++) {
      await prisma.storeAttributeValue.upsert({
        where: { attributeId_value: { attributeId: attrId, value: attr.values[i] } },
        update: { sortOrder: i },
        create: { attributeId: attrId, value: attr.values[i], sortOrder: i },
      });
    }
  }

  console.log("   ✓ Store attributes (6 attributes, 30+ values)");

  // ── Store: Products ───────────────────────────────────────────────────────
  const products = [
    {
      name: "Premium SaaS Dashboard Template",
      slug: "premium-saas-dashboard-template",
      sku: "TMPL-001",
      type: "digital",
      status: "active",
      shortDescription: "Production-ready Next.js 14 dashboard with analytics, auth, and dark mode.",
      description: "<h2>Overview</h2><p>The <strong>Premium SaaS Dashboard Template</strong> is a fully production-ready admin panel built with Next.js 14, TypeScript, and Tailwind CSS. Designed for SaaS founders who want to ship fast without sacrificing quality, this template gives you everything you need to launch a polished internal dashboard or customer-facing portal in days, not weeks.</p><h2>What's Included</h2><ul><li>Pre-built authentication flow (login, register, forgot password)</li><li>Role-based access control (admin, editor, viewer)</li><li>Analytics dashboard with Chart.js/Recharts integration</li><li>Data tables with sorting, filtering, and pagination</li><li>Dark mode and light mode support out of the box</li><li>Fully responsive — works on mobile, tablet, and desktop</li><li>Notification system and toast alerts</li><li>Settings and profile management pages</li></ul><h2>Tech Stack</h2><p>Built on Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui components, Prisma ORM, and NextAuth.js. Deployable to Vercel in one click.</p>",
      specification: "<h2>Technical Specifications</h2><table><thead><tr><th>Property</th><th>Detail</th></tr></thead><tbody><tr><td>Framework</td><td>Next.js 14 (App Router)</td></tr><tr><td>Language</td><td>TypeScript 5.x</td></tr><tr><td>Styling</td><td>Tailwind CSS 3.x + shadcn/ui</td></tr><tr><td>Auth</td><td>NextAuth.js v5</td></tr><tr><td>Database ORM</td><td>Prisma 5.x</td></tr><tr><td>Charts</td><td>Recharts 2.x</td></tr><tr><td>Node Version</td><td>18.x or higher</td></tr><tr><td>License</td><td>Single-project commercial use</td></tr><tr><td>Updates</td><td>Lifetime free updates</td></tr><tr><td>Support</td><td>6 months email support included</td></tr></tbody></table><h2>Browser Support</h2><p>Chrome 90+, Firefox 88+, Safari 14+, Edge 90+</p>",
      seoTitle: "Premium SaaS Dashboard Template — Next.js 14",
      seoDescription: "Production-ready Next.js 14 admin dashboard template with auth, analytics, dark mode, and role-based access. Ship your SaaS faster.",
      price: 79.0,
      compareAtPrice: 129.0,
      costPrice: 0,
      stockStatus: "in_stock",
      stock: 9999,
      lowStockThreshold: 0,
      categoryIds: [catMap["cat1a"]],
      tags: ["nextjs", "dashboard", "template", "saas"],
    },
    {
      name: "Annual Growth Plan",
      slug: "annual-growth-plan",
      sku: "SUB-GROWTH-Y",
      type: "subscription",
      status: "active",
      shortDescription: "Full access to all features. Billed annually.",
      description: "<h2>Everything You Need to Grow</h2><p>The <strong>Annual Growth Plan</strong> gives your team unlimited access to every feature on the platform — CRM, Store, CMS, Email Automations, SEO Tools, and more. Billed once per year, you save 17% compared to monthly billing while keeping your team fully productive year-round.</p><h2>What's Included</h2><ul><li>All modules: CRM, Store, CMS, Email, SEO, Lighthouse, Mail, Payments, Reports</li><li>Up to 10 team members</li><li>Priority email and chat support</li><li>API access with higher rate limits</li><li>Monthly product updates and new features</li><li>Custom branding and white-label options</li><li>Advanced analytics and reporting exports</li></ul><h2>Billing</h2><p>You will be charged once annually. Your subscription renews automatically on the same date each year. Cancel anytime — you keep access until your billing period ends.</p>",
      specification: "<h2>Plan Details</h2><table><thead><tr><th>Feature</th><th>Value</th></tr></thead><tbody><tr><td>Billing Cycle</td><td>Annual (12 months)</td></tr><tr><td>Team Members</td><td>Up to 10</td></tr><tr><td>Modules Included</td><td>All 9 modules</td></tr><tr><td>API Calls / Month</td><td>500,000</td></tr><tr><td>Storage</td><td>50 GB</td></tr><tr><td>Email Sends / Month</td><td>100,000</td></tr><tr><td>Support Level</td><td>Priority (24h response)</td></tr><tr><td>Custom Domain</td><td>Yes</td></tr><tr><td>White Label</td><td>Yes</td></tr><tr><td>SLA Uptime</td><td>99.9%</td></tr></tbody></table>",
      seoTitle: "Annual Growth Plan — Full Platform Access",
      seoDescription: "Get full access to all ERVFlow features with the Annual Growth Plan. CRM, Store, CMS, Email, SEO and more — billed annually at 17% savings.",
      price: 199.0,
      compareAtPrice: 240.0,
      costPrice: 20,
      stockStatus: "in_stock",
      stock: 9999,
      lowStockThreshold: 0,
      categoryIds: [catMap["cat2"]],
      tags: ["subscription", "saas", "annual"],
    },
    {
      name: "UI Component Bundle",
      slug: "ui-component-bundle",
      sku: "TMPL-COMP-001",
      type: "bundle",
      status: "active",
      shortDescription: "50+ reusable React components for building modern UIs faster.",
      description: "<h2>Build Faster with 50+ Production-Ready Components</h2><p>The <strong>UI Component Bundle</strong> is a handcrafted collection of over 50 React components built with Tailwind CSS and TypeScript. Whether you're building a SaaS dashboard, landing page, or admin panel, these components give you a rock-solid foundation so you can focus on your product logic instead of rebuilding the same UI patterns from scratch.</p><h2>What's in the Bundle</h2><ul><li><strong>Layout:</strong> Sidebar, Navbar, Footer, PageHeader, Breadcrumbs</li><li><strong>Data:</strong> DataTable, SortableList, KanbanBoard, Timeline</li><li><strong>Forms:</strong> Input, Select, Textarea, DatePicker, ColorPicker, TagInput</li><li><strong>Feedback:</strong> Toast, Alert, Modal, Drawer, Tooltip, Popover</li><li><strong>Charts:</strong> LineChart, BarChart, DonutChart, SparkLine (Recharts-based)</li><li><strong>E-commerce:</strong> ProductCard, CartDrawer, PriceDisplay, StockBadge</li><li><strong>Marketing:</strong> HeroSection, FeatureGrid, TestimonialCard, PricingTable</li></ul><h2>Bundle Contents</h2><p>Each component ships with full TypeScript typings, Storybook stories, and Tailwind class variants. Zero runtime dependencies beyond React and Tailwind.</p>",
      specification: "<h2>Bundle Specifications</h2><table><thead><tr><th>Property</th><th>Detail</th></tr></thead><tbody><tr><td>Total Components</td><td>52</td></tr><tr><td>Framework</td><td>React 18+</td></tr><tr><td>Language</td><td>TypeScript</td></tr><tr><td>Styling</td><td>Tailwind CSS 3.x</td></tr><tr><td>Storybook</td><td>Included</td></tr><tr><td>Test Coverage</td><td>Unit tests via Vitest</td></tr><tr><td>Bundle Size</td><td>Tree-shakeable (0 unused code shipped)</td></tr><tr><td>License</td><td>Unlimited projects</td></tr><tr><td>Updates</td><td>Lifetime</td></tr></tbody></table>",
      seoTitle: "UI Component Bundle — 50+ React Tailwind Components",
      seoDescription: "52 production-ready React + Tailwind CSS components including tables, forms, charts, modals, and e-commerce blocks. TypeScript included.",
      price: 149.0,
      compareAtPrice: 249.0,
      costPrice: 0,
      stockStatus: "in_stock",
      stock: 9999,
      lowStockThreshold: 0,
      categoryIds: [catMap["cat1"]],
      tags: ["react", "components", "ui", "bundle"],
    },
    {
      name: "SEO Audit Checklist PDF",
      slug: "seo-audit-checklist-pdf",
      sku: "DL-SEO-001",
      type: "digital",
      status: "active",
      shortDescription: "150-point SEO checklist used by agencies. Instant download.",
      description: "<h2>The Only SEO Checklist You'll Ever Need</h2><p>Used by over 200 marketing agencies worldwide, this <strong>150-point SEO Audit Checklist</strong> covers every dimension of modern search optimisation — from technical crawlability to content depth to Core Web Vitals. Download it once and use it on every client site, forever.</p><h2>What's Inside</h2><ul><li><strong>Technical SEO (40 checks):</strong> Crawl errors, robots.txt, sitemap, HTTPS, structured data, canonical tags, hreflang</li><li><strong>On-Page SEO (35 checks):</strong> Title tags, meta descriptions, heading hierarchy, keyword placement, image alt text, internal linking</li><li><strong>Content Quality (25 checks):</strong> E-E-A-T signals, duplicate content, thin content, content freshness</li><li><strong>Core Web Vitals (20 checks):</strong> LCP, FID/INP, CLS — with specific fix recommendations</li><li><strong>Off-Page SEO (15 checks):</strong> Backlink profile, anchor text distribution, brand mentions, local citations</li><li><strong>Bonus:</strong> Priority scoring matrix to decide what to fix first</li></ul><h2>Format</h2><p>Delivered as a beautifully designed 28-page PDF with fillable checkboxes. Colour-coded by priority (critical / important / nice-to-have). Compatible with Adobe Acrobat and all PDF readers.</p>",
      specification: "<h2>Document Specifications</h2><table><thead><tr><th>Property</th><th>Detail</th></tr></thead><tbody><tr><td>Format</td><td>PDF (fillable)</td></tr><tr><td>Pages</td><td>28</td></tr><tr><td>Checklist Items</td><td>150</td></tr><tr><td>File Size</td><td>~2.4 MB</td></tr><tr><td>Languages</td><td>English</td></tr><tr><td>Last Updated</td><td>Q1 2026</td></tr><tr><td>License</td><td>Personal &amp; agency use</td></tr><tr><td>Delivery</td><td>Instant download link</td></tr><tr><td>Re-downloads</td><td>Unlimited (lifetime)</td></tr></tbody></table>",
      seoTitle: "150-Point SEO Audit Checklist PDF — Agency Edition",
      seoDescription: "Download the definitive 150-point SEO audit checklist used by 200+ agencies. Covers technical SEO, on-page, Core Web Vitals, and off-page. Instant PDF download.",
      price: 19.0,
      compareAtPrice: 29.0,
      costPrice: 0,
      stockStatus: "in_stock",
      stock: 9999,
      lowStockThreshold: 0,
      categoryIds: [catMap["cat3a1"]],
      tags: ["seo", "pdf", "checklist", "marketing"],
    },
    {
      name: "Pro T-Shirt (Branded)",
      slug: "pro-t-shirt-branded",
      sku: "MERCH-TS-001",
      type: "variable",
      status: "active",
      shortDescription: "Soft cotton t-shirt with ERVFlow branding. Available in S–XXL.",
      description: "<h2>Wear Your Stack</h2><p>The <strong>ERVFlow Pro T-Shirt</strong> is made from 100% combed ring-spun cotton — the kind that feels better every time you wash it. Screenprinted with our minimalist ERVFlow logo on the chest and a subtle 'Build Something' wordmark on the back sleeve. Available in classic Black and clean White, in sizes S through XXL.</p><h2>Why You'll Love It</h2><ul><li>Ultra-soft 180gsm combed cotton — noticeably heavier than average promo tees</li><li>Pre-shrunk fabric so the fit stays consistent after washing</li><li>Reinforced shoulder seams for longer wear</li><li>Water-based inks that won't crack or peel after 50+ washes</li><li>Ethically manufactured — GOTS-certified cotton, fair-trade facility</li></ul><h2>Sizing</h2><p>Available in S, M, L, XL, and XXL. Runs true to size. See the size chart below for chest and length measurements.</p>",
      specification: "<h2>Product Specifications</h2><table><thead><tr><th>Property</th><th>Detail</th></tr></thead><tbody><tr><td>Material</td><td>100% combed ring-spun cotton</td></tr><tr><td>Weight</td><td>180 gsm</td></tr><tr><td>Colours</td><td>Black, White</td></tr><tr><td>Sizes</td><td>S, M, L, XL, XXL</td></tr><tr><td>Print Method</td><td>Water-based screen print</td></tr><tr><td>Care</td><td>Machine wash cold, tumble dry low</td></tr><tr><td>Country of Manufacture</td><td>Portugal</td></tr><tr><td>Certification</td><td>GOTS organic, fair-trade</td></tr></tbody></table><h2>Size Guide (inches)</h2><table><thead><tr><th>Size</th><th>Chest</th><th>Length</th></tr></thead><tbody><tr><td>S</td><td>34–36</td><td>27</td></tr><tr><td>M</td><td>38–40</td><td>28</td></tr><tr><td>L</td><td>42–44</td><td>29</td></tr><tr><td>XL</td><td>46–48</td><td>30</td></tr><tr><td>XXL</td><td>50–52</td><td>31</td></tr></tbody></table>",
      seoTitle: "ERVFlow Pro T-Shirt — Branded Merch",
      seoDescription: "Ultra-soft 180gsm branded ERVFlow t-shirt in black and white. Available S–XXL. GOTS certified cotton, water-based inks.",
      price: 29.0,
      compareAtPrice: 39.0,
      costPrice: 8.5,
      stockStatus: "low_stock",
      stock: 14,
      lowStockThreshold: 20,
      categoryIds: [catMap["cat4a"]],
      tags: ["merch", "apparel", "branded"],
    },
    {
      name: "1-on-1 Consulting Session",
      slug: "1-on-1-consulting-session",
      sku: "SVC-CONSULT-01",
      type: "service",
      status: "active",
      shortDescription: "60-minute Zoom strategy session with our team.",
      description: "<h2>Get Unstuck — Fast</h2><p>Sometimes you need a second brain on a hard problem. Book a <strong>60-minute 1-on-1 strategy session</strong> with one of our senior consultants and walk away with a clear action plan tailored to your specific challenge.</p><h2>What We Can Help With</h2><ul><li>Product strategy and roadmap prioritisation</li><li>Technical architecture review (NestJS, Next.js, Prisma, cloud infra)</li><li>SaaS growth and pricing strategy</li><li>Marketing funnel audit and CRO recommendations</li><li>ERVFlow platform setup, migration, and customisation</li><li>Team structure and hiring advice for early-stage startups</li></ul><h2>How It Works</h2><ol><li>Purchase this session and you'll receive a calendar link within 24 hours</li><li>Fill out a short pre-call form so we can prepare</li><li>Join the 60-minute Zoom call — recorded and shared with you afterwards</li><li>Receive a written summary of recommendations within 48 hours of the call</li></ol><h2>Satisfaction Guarantee</h2><p>If you don't find the session valuable, we'll refund you in full — no questions asked.</p>",
      specification: "<h2>Session Details</h2><table><thead><tr><th>Property</th><th>Detail</th></tr></thead><tbody><tr><td>Duration</td><td>60 minutes</td></tr><tr><td>Format</td><td>Video call (Zoom)</td></tr><tr><td>Participants</td><td>1 client + 1 consultant</td></tr><tr><td>Booking Window</td><td>Within 24h of purchase</td></tr><tr><td>Recording</td><td>Provided (MP4, 7-day link)</td></tr><tr><td>Written Summary</td><td>Delivered within 48h post-call</td></tr><tr><td>Reschedule Policy</td><td>Once, up to 24h before call</td></tr><tr><td>Refund Policy</td><td>Full refund if unsatisfied</td></tr><tr><td>Languages</td><td>English, Hindi</td></tr></tbody></table>",
      seoTitle: "1-on-1 Strategy Consulting Session — 60 Minutes",
      seoDescription: "Book a 60-minute expert consulting session for product strategy, tech architecture, SaaS growth, or ERVFlow setup. Recorded + written summary included.",
      price: 199.0,
      costPrice: 30,
      stockStatus: "in_stock",
      stock: 9999,
      lowStockThreshold: 0,
      categoryIds: [catMap["cat5a"]],
      tags: ["consulting", "service", "strategy"],
    },
    {
      name: "Mechanical Keyboard Wrist Rest",
      slug: "mechanical-keyboard-wrist-rest",
      sku: "PHYS-WR-001",
      type: "simple",
      status: "active",
      shortDescription: "Ergonomic memory foam wrist rest for mechanical keyboards. Available in black and grey.",
      description: "<h2>Type Longer, Hurt Less</h2><p>The <strong>ERVFlow Wrist Rest</strong> is a precision-cut memory foam pad designed specifically for full-size and tenkeyless mechanical keyboards. It cradles your wrists at the perfect angle to reduce strain during long coding sessions, keeping you in flow longer without the ache that comes from unsupported wrists.</p><h2>Key Features</h2><ul><li>High-density slow-rebound memory foam — conforms to your wrist shape in seconds</li><li>Non-slip rubber base keeps it locked in place on any desk surface</li><li>Vegan leather top surface that's easy to wipe clean</li><li>Precisely the right height (18mm) to match standard keycap profiles (Cherry, OEM)</li><li>Available in Midnight Black and Slate Grey</li><li>Compatible with 60%, 75%, TKL, and full-size layouts</li></ul><h2>What's in the Box</h2><p>1× Wrist Rest, 1× cleaning cloth, care instructions card.</p>",
      specification: "<h2>Product Specifications</h2><table><thead><tr><th>Property</th><th>Detail</th></tr></thead><tbody><tr><td>Dimensions</td><td>435 × 100 × 18 mm</td></tr><tr><td>Weight</td><td>280 g</td></tr><tr><td>Core Material</td><td>High-density memory foam (50D)</td></tr><tr><td>Surface</td><td>PU vegan leather</td></tr><tr><td>Base</td><td>Non-slip silicone rubber</td></tr><tr><td>Colours</td><td>Midnight Black, Slate Grey</td></tr><tr><td>Compatible Layouts</td><td>60%, 75%, TKL, Full-size</td></tr><tr><td>Keycap Profile Fit</td><td>Cherry, OEM, SA (low-profile)</td></tr><tr><td>Care</td><td>Wipe with damp cloth</td></tr><tr><td>Warranty</td><td>12 months</td></tr></tbody></table>",
      seoTitle: "Memory Foam Keyboard Wrist Rest — Mechanical Keyboard",
      seoDescription: "Ergonomic 18mm memory foam wrist rest for mechanical keyboards. Non-slip base, vegan leather surface. Available in black and grey.",
      price: 34.99,
      compareAtPrice: 49.99,
      costPrice: 9.5,
      stockStatus: "in_stock",
      stock: 87,
      lowStockThreshold: 15,
      categoryIds: [catMap["cat4b"]],
      tags: ["hardware", "ergonomic", "keyboard", "physical"],
    },
    {
      name: "Icon Pack — 1200 Line Icons",
      slug: "icon-pack-1200-line-icons",
      sku: "DL-ICONS-001",
      type: "downloadable",
      status: "active",
      shortDescription: "1,200 pixel-perfect SVG & PNG icons in 4 styles. Instant download, lifetime access.",
      description: "<h2>One Pack. Every Icon You'll Ever Need.</h2><p>The <strong>1200 Line Icons Pack</strong> is a comprehensive, professionally drawn icon library covering every UI category — navigation, e-commerce, social, file types, arrows, weather, devices, and more. Each icon is available in 4 distinct styles so you can match any design system.</p><h2>4 Styles Included</h2><ul><li><strong>Outline:</strong> Clean 1.5px strokes — the go-to for modern web UIs</li><li><strong>Filled:</strong> Solid shapes for emphasis and mobile-first designs</li><li><strong>Duotone:</strong> Two-layer colour icons for vibrant dashboards</li><li><strong>Thin:</strong> Ultra-lightweight 1px lines for minimal, editorial layouts</li></ul><h2>What You Get</h2><ul><li>1,200 icons × 4 styles = 4,800 individual SVG files</li><li>PNG exports at 16px, 24px, 32px, 48px, 64px, and 128px</li><li>Figma source file with auto-layout frames and organised components</li><li>React component library (TypeScript, tree-shakeable)</li><li>Sprite sheet for performance-optimised web use</li></ul>",
      specification: "<h2>File Specifications</h2><table><thead><tr><th>Property</th><th>Detail</th></tr></thead><tbody><tr><td>Total Icons</td><td>1,200</td></tr><tr><td>Styles</td><td>Outline, Filled, Duotone, Thin (4 total)</td></tr><tr><td>Total Files</td><td>4,800 SVGs + PNG exports</td></tr><tr><td>SVG Grid</td><td>24 × 24 px viewBox</td></tr><tr><td>PNG Sizes</td><td>16, 24, 32, 48, 64, 128 px</td></tr><tr><td>Figma File</td><td>Included (components + auto-layout)</td></tr><tr><td>React Library</td><td>TypeScript, tree-shakeable NPM package</td></tr><tr><td>License</td><td>Unlimited commercial projects</td></tr><tr><td>File Size (zip)</td><td>~145 MB</td></tr><tr><td>Re-download</td><td>Lifetime access</td></tr></tbody></table>",
      seoTitle: "1200 Line Icons Pack — SVG, PNG, Figma, React",
      seoDescription: "1,200 pixel-perfect icons in 4 styles (outline, filled, duotone, thin). Includes SVG, PNG, Figma source, and React component library.",
      price: 39.0,
      compareAtPrice: 59.0,
      costPrice: 0,
      stockStatus: "in_stock",
      stock: 9999,
      lowStockThreshold: 0,
      categoryIds: [catMap["cat3b"]],
      tags: ["icons", "svg", "design", "download"],
    },
    {
      name: "ERVFlow Gift Card",
      slug: "ervflow-gift-card",
      sku: "GIFT-CARD-001",
      type: "gift_card",
      status: "active",
      shortDescription: "Give the gift of great tools. Redeemable on any product in the store.",
      description: "<h2>The Perfect Gift for Builders</h2><p>Not sure what to get them? The <strong>ERVFlow Gift Card</strong> lets them choose exactly what they need — whether that's a template, an icon pack, a consulting session, or a SaaS subscription. Gift cards are delivered instantly by email and never expire.</p><h2>How It Works</h2><ol><li>Purchase the gift card and enter the recipient's email at checkout</li><li>The recipient receives a unique code by email within minutes</li><li>They apply the code at checkout on any product in the store</li><li>Any remaining balance stays on the card for future purchases</li></ol><h2>Available Denominations</h2><p>This listing is for a $50 gift card. Additional amounts ($25, $100, $200) are available as separate listings. Custom amounts are also available — contact us.</p><h2>Terms</h2><p>Gift cards do not expire. They cannot be exchanged for cash. Lost or stolen cards cannot be replaced.</p>",
      specification: "<h2>Gift Card Details</h2><table><thead><tr><th>Property</th><th>Detail</th></tr></thead><tbody><tr><td>Denomination</td><td>$50.00 USD</td></tr><tr><td>Delivery Method</td><td>Email (instant)</td></tr><tr><td>Redemption</td><td>Any product in the ERVFlow store</td></tr><tr><td>Expiry</td><td>Never expires</td></tr><tr><td>Transferable</td><td>Yes (share the code)</td></tr><tr><td>Refundable</td><td>No</td></tr><tr><td>Partial Use</td><td>Yes — balance carries over</td></tr><tr><td>Currency</td><td>USD</td></tr></tbody></table>",
      seoTitle: "ERVFlow Gift Card — $50",
      seoDescription: "Give the gift of great tools with an ERVFlow Gift Card. Redeemable on any product. Delivered instantly by email. Never expires.",
      price: 50.0,
      costPrice: 0,
      stockStatus: "in_stock",
      stock: 9999,
      lowStockThreshold: 0,
      categoryIds: [catMap["cat6"]],
      tags: ["gift", "gift-card"],
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { organizationId_slug: { organizationId: org.id, slug: p.slug } },
      update: {
        name: p.name, sku: p.sku, type: p.type, status: p.status,
        shortDescription: p.shortDescription,
        description: p.description,
        specification: p.specification,
        seoTitle: p.seoTitle,
        seoDescription: p.seoDescription,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        costPrice: p.costPrice ?? null,
        stockStatus: p.stockStatus, stock: p.stock,
        lowStockThreshold: p.lowStockThreshold,
        categoryIds: p.categoryIds, tags: p.tags,
      },
      create: {
        organizationId: org.id,
        name: p.name, slug: p.slug, sku: p.sku, type: p.type, status: p.status,
        shortDescription: p.shortDescription,
        description: p.description,
        specification: p.specification,
        seoTitle: p.seoTitle ?? null,
        seoDescription: p.seoDescription ?? null,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        costPrice: p.costPrice ?? null,
        stockStatus: p.stockStatus, stock: p.stock,
        lowStockThreshold: p.lowStockThreshold,
        categoryIds: p.categoryIds, tags: p.tags,
      },
    });
  }

  console.log("   ✓ Products (9 sample products — all 8 types covered)");

  const platformDomain = process.env.PLATFORM_DOMAIN ?? "lvh.me";
  console.log(`✅ Seed complete  (password for all accounts: ${PASSWORD})`);
  console.log("   SUPER_ADMIN : superadmin@vyntra.com");
  console.log("   ORG_ADMIN   : admin@acme.com    (Acme Corp · Pro)");
  console.log("   EDITOR      : editor@acme.com   (Acme Corp · Pro)");
  console.log("   USER        : user@acme.com     (Acme Corp · Pro)");
  console.log("   VIEWER      : viewer@acme.com   (Acme Corp · Pro)");
  console.log("   ORG_ADMIN   : admin@bloom.com   (Bloom Studio · Free)");
  console.log("   ORG_ADMIN   : founder@startup.io (Startup IO · Free)");
  console.log(
    "   ORG_ADMIN   : simranjeet1012@gmail.com (Ekam Infotech · CMS Only)",
  );
  console.log("");
  console.log("   CMS preview URLs (port 3000):");
  console.log(`   Acme  → http://acme.${platformDomain}:3000`);
  console.log(`   Bloom → http://bloom.${platformDomain}:3000`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
