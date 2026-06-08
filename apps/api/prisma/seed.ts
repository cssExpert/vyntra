import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Default dev password for all seeded accounts. Override via SEED_PASSWORD.
const PASSWORD = process.env.SEED_PASSWORD ?? "ChangeMe123!";

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

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
        variables: { ...t.variables, category: t.category, tags: t.tags } as object,
        isGlobal: true,
      },
      create: {
        id: t.id,
        name: t.name,
        description: t.description,
        thumbnail: t.thumbnail,
        variables: { ...t.variables, category: t.category, tags: t.tags } as object,
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
