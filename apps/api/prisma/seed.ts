import { PrismaClient, Role } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { DEFAULT_CUSTOMER_GROUP_NAMES } from "../src/store/utils/default-customer-groups";

const prisma = new PrismaClient();

// Default dev password for all seeded accounts. Override via SEED_PASSWORD.
const PASSWORD = process.env.SEED_PASSWORD ?? "ChangeMe123!";

function slugifyTag(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// Mirrors TagsService.syncAssignments (apps/api/src/tags/tags.service.ts) —
// the seed script talks to Prisma directly rather than the Nest app, so the
// same find-or-create + replace-assignments logic is duplicated here.
async function syncTags(organizationId: string, entityType: string, entityId: string, tagNames: string[]) {
  const uniqueNames = [...new Set(tagNames.map((n) => n.trim()).filter(Boolean))];
  const tagIds: string[] = [];
  for (const name of uniqueNames) {
    const slug = slugifyTag(name);
    let tag = await prisma.tag.findFirst({ where: { organizationId, slug } });
    if (!tag) {
      tag = await prisma.tag.create({ data: { name, slug, organizationId } });
    }
    tagIds.push(tag.id);
  }
  await prisma.tagAssignment.deleteMany({ where: { organizationId, entityType, entityId } });
  if (tagIds.length > 0) {
    await prisma.tagAssignment.createMany({
      data: tagIds.map((tagId) => ({ tagId, entityType, entityId, organizationId })),
      skipDuplicates: true,
    });
  }
}

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

  // ── Default customer groups for every seeded org ─────────
  for (const seededOrg of [org, bloom, startup, ekam]) {
    await prisma.customerGroup.createMany({
      data: DEFAULT_CUSTOMER_GROUP_NAMES.map((name) => ({
        organizationId: seededOrg.id,
        name,
        isDefault: true,
      })),
      skipDuplicates: true,
    });
  }

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

  // ── CMS Blog Categories for Acme Corp ────────────────────
  const blogCategoryNames = ["Technology", "Engineering", "Design", "Product", "Marketing", "Career", "Tutorials", "News"];
  for (const name of blogCategoryNames) {
    const slug = name.toLowerCase();
    await prisma.blogCategory.upsert({
      where: { organizationId_slug: { organizationId: org.id, slug } },
      update: { name },
      create: { name, slug, organizationId: org.id },
    });
  }

  // ── CMS Blogs for Acme Corp — 20 posts covering every field the editor
  // exposes: rich HTML body, cover image, tags (shared catalog), categories,
  // SEO fields, author, and every published/visibility/featured combination.
  const PRESET_COVERS = [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
  ];

  const blogs = [
    {
      slug: "10-must-have-tools-for-modern-saas-founders",
      title: "10 Must-Have Tools for Modern SaaS Founders in 2026",
      subtitle: "The stack we'd rebuild Acme with, if we started today.",
      excerpt: "From billing to analytics, here's the toolkit we actually rely on to run a lean, fast-moving SaaS business.",
      body: "<h2>Why the Stack Matters</h2><p>Every founder eventually learns that the tools you pick early on either compound your speed or quietly tax it for years. After three years of building Acme, we've settled on a stack that stays out of our way.</p><h2>The Shortlist</h2><ul><li><strong>Billing:</strong> Usage-based pricing engines that don't require an engineering sprint to change a plan</li><li><strong>Analytics:</strong> Product analytics wired directly into your onboarding funnel, not bolted on after launch</li><li><strong>Support:</strong> A shared inbox that doesn't feel like a ticketing system</li><li><strong>Docs:</strong> Documentation that ships from the same repo as your code</li></ul><p>None of these are glamorous. That's the point — boring infrastructure lets you spend your attention on the product.</p>",
      category: ["Product", "Technology"],
      tags: ["saas", "startups", "productivity"],
      author: "Acme Editor",
      seoTitle: "10 Must-Have Tools for Modern SaaS Founders (2026)",
      metaDesc: "The exact tools we use to run Acme Corp — billing, analytics, support, and docs — without slowing the team down.",
      keywords: "saas tools, founder stack, startup tools",
      publishedAt: "2026-01-12",
      isFeatured: true,
      allowComments: true,
      visibility: "public",
    },
    {
      slug: "redesigning-our-dashboard-template-for-conversions",
      title: "How We Redesigned Our Dashboard Template for Better Conversions",
      subtitle: "A/B tests, heatmaps, and the small changes that moved the needle.",
      excerpt: "We rebuilt our best-selling dashboard template's landing page and saw a 34% lift in trial signups. Here's what changed.",
      body: "<h2>Starting With Data</h2><p>Before touching a single pixel, we pulled six months of session recordings for our Premium SaaS Dashboard Template product page. The pattern was obvious: visitors were bouncing before reaching the feature list.</p><h2>What We Changed</h2><ul><li>Moved the live preview above the fold</li><li>Replaced a wall of text with a scannable feature grid</li><li>Added a comparison table against 'building it yourself'</li></ul><p>The result was a 34% lift in trial signups within four weeks, with no change to the underlying product.</p>",
      category: ["Design", "Product"],
      tags: ["design-systems", "ux", "dashboard"],
      author: "Acme Editor",
      seoTitle: "Redesigning a SaaS Dashboard Template for Conversions",
      metaDesc: "How a data-driven redesign of our dashboard template's landing page lifted trial signups by 34%.",
      keywords: "conversion design, ux, landing page redesign",
      publishedAt: "2026-01-28",
      isFeatured: false,
      allowComments: true,
      visibility: "public",
    },
    {
      slug: "complete-guide-to-subscription-pricing-models",
      title: "The Complete Guide to Subscription Pricing Models",
      subtitle: "Flat-rate, usage-based, and everything in between.",
      excerpt: "A practical breakdown of the pricing models available to digital product businesses, and when to use each.",
      body: "<h2>There's No One Right Model</h2><p>Every pricing model trades simplicity for precision. Flat-rate plans are easy to explain but leave money on the table with your heaviest users. Usage-based pricing captures value but adds billing complexity.</p><h2>A Quick Framework</h2><ul><li><strong>Flat-rate:</strong> best for early-stage products with unclear usage patterns</li><li><strong>Tiered:</strong> best once you have 2–3 distinct customer segments</li><li><strong>Usage-based:</strong> best when your cost to serve scales with customer usage</li></ul><p>We run our Annual Growth Plan as a tiered model precisely because our customers' needs vary so widely by team size.</p>",
      category: ["Marketing", "Product"],
      tags: ["pricing", "subscriptions", "saas"],
      author: "Acme Admin",
      seoTitle: "The Complete Guide to Subscription Pricing Models",
      metaDesc: "Flat-rate, tiered, and usage-based pricing explained — with a simple framework for choosing the right one.",
      keywords: "pricing models, subscription pricing, saas pricing",
      publishedAt: "2026-02-05",
      isFeatured: false,
      allowComments: true,
      visibility: "public",
    },
    {
      slug: "why-we-switched-to-a-component-driven-design-system",
      title: "Why We Switched to a Component-Driven Design System",
      subtitle: "Six months in, here's what actually changed for the team.",
      excerpt: "Consolidating around a single component library cut our design-to-ship time nearly in half.",
      body: "<h2>The Problem</h2><p>Before our design system, every new feature meant re-deciding what a button, a modal, and a data table should look like. Small inconsistencies piled up across the product.</p><h2>What We Built</h2><p>We standardized on a token-based system — colors, spacing, and typography defined once and consumed everywhere — paired with a documented component library in Storybook.</p><h2>The Payoff</h2><p>New features now ship in days instead of weeks, and our UI Component Bundle product exists because we productized exactly this system for other teams.</p>",
      category: ["Engineering", "Design"],
      tags: ["design-systems", "engineering-culture"],
      author: "Acme Editor",
      seoTitle: "Why We Adopted a Component-Driven Design System",
      metaDesc: "How standardizing on a token-based design system cut our design-to-ship time in half.",
      keywords: "design systems, component library, storybook",
      publishedAt: "2026-02-19",
      isFeatured: false,
      allowComments: true,
      visibility: "public",
    },
    {
      slug: "seo-in-2026-what-actually-moves-the-needle",
      title: "SEO in 2026: What Actually Moves the Needle",
      subtitle: "Less checklist theater, more of what actually ranks.",
      excerpt: "We audited 40 client sites this year. Here's what separated the ones that ranked from the ones that didn't.",
      body: "<h2>Beyond the Checklist</h2><p>Technical SEO checklists (like the one we sell) matter, but they're table stakes. What separated top performers in our audits was content depth and genuine topical authority.</p><h2>What Actually Worked</h2><ul><li>Consolidating thin pages into comprehensive guides</li><li>Internal linking that reflects genuine topical clusters, not just keyword stuffing</li><li>Core Web Vitals fixes that also improved bounce rate, not just Lighthouse scores</li></ul><p>If you want the full 150-point breakdown, our SEO Audit Checklist covers it — but start with content depth first.</p>",
      category: ["Marketing", "Tutorials"],
      tags: ["seo", "marketing", "content-strategy"],
      author: "Acme Admin",
      seoTitle: "SEO in 2026: What Actually Moves the Needle",
      metaDesc: "What 40 client SEO audits taught us about what actually drives rankings in 2026.",
      keywords: "seo 2026, seo audit, content strategy",
      publishedAt: "2026-03-02",
      isFeatured: true,
      allowComments: false,
      visibility: "public",
    },
    {
      slug: "building-a-remote-first-engineering-culture",
      title: "Building a Remote-First Engineering Culture",
      subtitle: "No offices, no time zone overlap requirements, no problem.",
      excerpt: "Our engineering team spans nine time zones. Here's how we keep it functioning without daily standups.",
      body: "<h2>Async by Default</h2><p>We don't require synchronous meetings for most decisions. Every proposal starts as a written document, gets asynchronous feedback for 48 hours, and only escalates to a call if there's genuine disagreement.</p><h2>What Makes It Work</h2><ul><li>Clear written decision records so context never lives only in someone's head</li><li>Overlap windows are recommended, not mandated</li><li>Documentation is treated as a first-class deliverable, not an afterthought</li></ul><p>It's slower for any single decision, but faster in aggregate because nobody is blocked waiting on a meeting.</p>",
      category: ["Career", "Engineering"],
      tags: ["remote-work", "engineering-culture", "productivity"],
      author: "Acme Editor",
      seoTitle: "Building a Remote-First Engineering Culture",
      metaDesc: "How a nine-timezone engineering team stays productive without daily standups.",
      keywords: "remote work, engineering culture, async work",
      publishedAt: "2026-03-15",
      isFeatured: false,
      allowComments: true,
      visibility: "members",
    },
    {
      slug: "5-lessons-from-selling-digital-products-for-3-years",
      title: "5 Lessons From Selling Digital Products for 3 Years",
      subtitle: "What we got wrong before we got it right.",
      excerpt: "Templates, checklists, component bundles — three years of selling digital products taught us these five lessons.",
      body: "<h2>1. Support Is the Product</h2><p>Buyers of digital products aren't paying for a file — they're paying for confidence that it'll work. Fast, generous support drives more repeat purchases than any feature.</p><h2>2. Bundle Later, Not First</h2><p>We launched bundles too early, before individual products had proven demand on their own. Validate first, bundle second.</p><h2>3–5: Pricing, Packaging, and Updates</h2><p>Round-number pricing outperforms psychological pricing for B2B digital goods, clear licensing terms reduce refund requests, and lifetime free updates are cheaper to promise than they sound.</p>",
      category: ["Product", "Marketing"],
      tags: ["ecommerce", "startups", "productivity"],
      author: "Acme Admin",
      seoTitle: "5 Lessons From 3 Years Selling Digital Products",
      metaDesc: "Real lessons from three years of selling templates, checklists, and component bundles online.",
      keywords: "digital products, ecommerce lessons, selling online",
      publishedAt: "2026-03-27",
      isFeatured: false,
      allowComments: true,
      visibility: "public",
    },
    {
      slug: "beginners-guide-to-headless-commerce",
      title: "A Beginner's Guide to Headless Commerce",
      subtitle: "What it is, when you need it, and when you don't.",
      excerpt: "Headless commerce isn't required for every store — here's how to tell if it's actually the right call for you.",
      body: "<h2>What 'Headless' Actually Means</h2><p>Headless commerce separates your storefront's front end from the commerce backend that handles products, carts, and checkout. You get flexibility in exchange for more moving parts.</p><h2>When You Need It</h2><ul><li>You need a genuinely custom storefront experience your platform's templates can't support</li><li>You're selling across multiple channels (web, app, in-store) from one product catalog</li></ul><h2>When You Don't</h2><p>If a themed storefront meets your needs, headless adds engineering overhead without a clear payoff. Start simple, migrate when the constraint is real.</p>",
      category: ["Technology", "Tutorials"],
      tags: ["headless-commerce", "ecommerce", "engineering-culture"],
      author: "Acme Editor",
      seoTitle: "A Beginner's Guide to Headless Commerce",
      metaDesc: "When headless commerce is worth the engineering overhead, and when a themed storefront is enough.",
      keywords: "headless commerce, ecommerce architecture",
      publishedAt: "2026-04-03",
      isFeatured: false,
      allowComments: true,
      visibility: "public",
    },
    {
      slug: "how-to-price-your-first-digital-product",
      title: "How to Price Your First Digital Product",
      subtitle: "A simple starting framework, not a spreadsheet of formulas.",
      excerpt: "Pricing your first template or download doesn't need to be complicated. Here's where we'd start today.",
      body: "<h2>Start With Comparables</h2><p>Find three similar products already selling successfully and price within their range. You can always adjust later — you can't easily recover from a launch that's priced so far off-market that nobody clicks.</p><h2>Anchor With a Compare-At Price</h2><p>A visible discount from a higher list price consistently outperforms an unanchored 'fair' price, even when the underlying value is identical.</p><p>Once you have real sales data, revisit pricing quarterly rather than constantly — frequent changes erode buyer trust.</p>",
      category: ["Marketing", "Product"],
      tags: ["pricing", "ecommerce", "startups"],
      author: "Acme Admin",
      seoTitle: "How to Price Your First Digital Product",
      metaDesc: "A simple, practical framework for pricing your first digital product or template.",
      keywords: "digital product pricing, pricing strategy",
      publishedAt: "2026-04-14",
      isFeatured: false,
      allowComments: true,
      visibility: "public",
    },
    {
      slug: "the-hidden-cost-of-poor-onboarding",
      title: "The Hidden Cost of Poor Onboarding",
      subtitle: "Churn shows up in month two, but it starts on day one.",
      excerpt: "Most churn isn't a pricing problem or a feature gap — it's an onboarding problem that surfaces weeks later.",
      body: "<h2>The Symptom Isn't the Cause</h2><p>When customers churn in month two citing 'not enough value,' the real story is usually that they never reached their first meaningful outcome in week one.</p><h2>What We Fixed</h2><ul><li>Replaced a generic welcome email with a checklist tied to a specific first win</li><li>Added in-app prompts at the exact point users historically got stuck</li><li>Shortened time-to-first-value from nine days to under two</li></ul><p>Retention improved more from this than from any feature we shipped that quarter.</p>",
      category: ["Product", "Design"],
      tags: ["onboarding", "ux", "productivity"],
      author: "Acme Editor",
      seoTitle: "The Hidden Cost of Poor Onboarding",
      metaDesc: "Why churn that shows up in month two is usually an onboarding problem from day one.",
      keywords: "onboarding, customer retention, churn",
      publishedAt: "2026-04-25",
      isFeatured: false,
      allowComments: true,
      visibility: "public",
    },
    {
      slug: "our-journey-to-multi-tenant-architecture",
      title: "Our Journey to Multi-Tenant Architecture",
      subtitle: "Rebuilding the foundation without stopping the business.",
      excerpt: "Migrating from single-tenant to multi-tenant infrastructure while staying live — the hard parts nobody tells you about.",
      body: "<h2>Why We Migrated</h2><p>Running a separate database per customer worked at ten customers. At two hundred, every schema change became a coordination problem across every tenant.</p><h2>The Hard Parts</h2><ul><li>Backfilling organizationId across every table without downtime</li><li>Rewriting every query to scope by tenant, and testing that isolation actually holds</li><li>Migrating customer data in batches during off-peak hours over several weeks</li></ul><p>Eighteen months later, shipping a schema change takes minutes instead of days.</p>",
      category: ["Engineering", "Technology"],
      tags: ["multi-tenant", "engineering-culture", "startups"],
      author: "Acme Admin",
      seoTitle: "Our Journey to Multi-Tenant Architecture",
      metaDesc: "How we migrated from single-tenant to multi-tenant infrastructure without stopping the business.",
      keywords: "multi-tenant architecture, saas infrastructure",
      publishedAt: "2026-05-06",
      isFeatured: true,
      allowComments: true,
      visibility: "public",
    },
    {
      slug: "design-systems-101-getting-buy-in-from-your-team",
      title: "Design Systems 101: Getting Buy-In From Your Team",
      subtitle: "The technical work is the easy part.",
      excerpt: "The hardest part of adopting a design system isn't building it — it's getting engineers and designers to actually use it.",
      body: "<h2>Start Small and Prove Value</h2><p>Don't propose a company-wide design system rollout on day one. Rebuild one high-visibility screen with the new components and let the before/after speak for itself.</p><h2>Make Adoption the Easy Path</h2><p>If using the design system is slower than writing custom CSS, people won't use it — no matter how good the documentation is. Invest in tooling that makes the right choice the fast choice.</p><p>Buy-in follows usage, not the other way around.</p>",
      category: ["Design", "Career"],
      tags: ["design-systems", "engineering-culture", "leadership"],
      author: "Acme Editor",
      seoTitle: "Design Systems 101: Getting Team Buy-In",
      metaDesc: "How to get engineers and designers to actually adopt a design system, not just tolerate it.",
      keywords: "design systems, team buy-in, adoption",
      publishedAt: "2026-05-18",
      isFeatured: false,
      allowComments: true,
      visibility: "public",
    },
    {
      slug: "what-we-learned-shipping-50-themes",
      title: "What We Learned Shipping 50 Themes",
      subtitle: "Patterns that held up, and a few that didn't.",
      excerpt: "Fifty storefront themes later, a few hard-won lessons about what makes a theme actually usable by non-developers.",
      body: "<h2>Constraints Are a Feature</h2><p>Our most successful themes had fewer configuration options, not more. Unlimited flexibility sounds appealing but overwhelms non-technical buyers.</p><h2>Defaults Matter More Than Options</h2><p>Most buyers never touch advanced settings. A theme that looks great with zero configuration outperforms one that looks great only after an hour of tweaking.</p><p>We now design every new theme around a single confident default, with customization as the exception rather than the expectation.</p>",
      category: ["Engineering", "Product"],
      tags: ["design-systems", "productivity", "ecommerce"],
      author: "Acme Admin",
      seoTitle: "What We Learned Shipping 50 Storefront Themes",
      metaDesc: "Hard-won lessons from building 50 storefront themes — why fewer options beat more flexibility.",
      keywords: "theme design, storefront themes, product lessons",
      publishedAt: "2026-05-29",
      isFeatured: false,
      allowComments: true,
      visibility: "public",
    },
    {
      slug: "the-creator-economy-trends-to-watch-this-year",
      title: "The Creator Economy: Trends to Watch This Year",
      subtitle: "Where independent sellers are actually winning right now.",
      excerpt: "From micro-niches to bundled memberships, here's what's actually working for independent digital creators in 2026.",
      body: "<h2>Micro-Niches Are Outperforming Broad Catalogs</h2><p>Sellers focused tightly on one audience — say, freelance illustrators, not 'designers' broadly — are converting at higher rates than generalist stores.</p><h2>Bundled Memberships Over One-Off Sales</h2><p>Recurring access to an evolving library of assets is outperforming single-purchase products for creators with steady output.</p><p>The through-line: narrower focus, recurring relationships, and fewer but better products.</p>",
      category: ["Marketing", "News"],
      tags: ["creator-economy", "marketing", "startups"],
      author: "Acme Editor",
      seoTitle: "The Creator Economy: Trends to Watch This Year",
      metaDesc: "What's actually working for independent digital creators in 2026 — micro-niches and bundled memberships.",
      keywords: "creator economy, digital creators, 2026 trends",
      publishedAt: "2026-06-08",
      isFeatured: false,
      allowComments: true,
      visibility: "public",
    },
    {
      slug: "why-ergonomics-matter-more-than-you-think",
      title: "Why Ergonomics Matter More Than You Think",
      subtitle: "The keyboard on your desk affects more than your wrists.",
      excerpt: "We surveyed our own team after switching to ergonomic keyboards company-wide. The results surprised us.",
      body: "<h2>Beyond Comfort</h2><p>We expected fewer complaints about wrist strain. We didn't expect a measurable uptick in reported focus during long coding sessions.</p><h2>What Changed</h2><ul><li>Split keyboards reduced reported wrist and shoulder discomfort by the majority of respondents</li><li>Several engineers reported longer uninterrupted focus blocks</li></ul><p>It's a small, unglamorous investment with an outsized effect on how a distributed team actually feels day to day.</p>",
      category: ["Career", "News"],
      tags: ["productivity", "engineering-culture"],
      author: "Acme Admin",
      seoTitle: "Why Ergonomics Matter More Than You Think",
      metaDesc: "What happened when our whole team switched to ergonomic keyboards, in their own words.",
      keywords: "ergonomics, workplace wellness, remote work",
      publishedAt: "2026-06-19",
      isFeatured: false,
      allowComments: true,
      visibility: "public",
    },
    {
      slug: "from-idea-to-launch-our-product-development-process",
      title: "From Idea to Launch: Our Product Development Process",
      subtitle: "How a product idea becomes a shipped feature at Acme.",
      excerpt: "Every feature we ship goes through the same four stages. Here's what each one actually involves.",
      body: "<h2>1. Problem Validation</h2><p>Before any design work, we confirm the problem exists for at least a handful of customers, not just our own intuition.</p><h2>2. Scoped Prototype</h2><p>We build the smallest version that tests the core hypothesis, deliberately cutting scope that doesn't affect the test.</p><h2>3. Limited Rollout</h2><p>New features ship to a subset of customers first, with clear success metrics defined in advance.</p><h2>4. General Availability</h2><p>Only after the metrics hold up does a feature graduate to every customer.</p>",
      category: ["Product", "Engineering"],
      tags: ["startups", "productivity", "engineering-culture"],
      author: "Acme Editor",
      seoTitle: "From Idea to Launch: Our Product Development Process",
      metaDesc: "The four-stage process every feature goes through before it reaches every Acme customer.",
      keywords: "product development, product process, feature rollout",
      publishedAt: "2026-06-27",
      isFeatured: false,
      allowComments: true,
      visibility: "public",
    },
    {
      slug: "accessibility-isnt-optional-a-practical-checklist",
      title: "Accessibility Isn't Optional: A Practical Checklist",
      subtitle: "Sixteen concrete checks you can run this week.",
      excerpt: "Accessibility work doesn't have to start with a full audit. Here are sixteen checks any team can run this week.",
      body: "<h2>Start With the Basics</h2><ul><li>Every interactive element is reachable by keyboard alone</li><li>Color is never the only signal for state (error, success, selected)</li><li>Images carry meaningful alt text, not filenames</li><li>Form fields have visible, associated labels</li></ul><h2>Then Go Deeper</h2><p>Screen reader testing, focus order, and reduced-motion support take longer but matter just as much. Treat accessibility as a continuous practice, not a one-time audit before launch.</p>",
      category: ["Design", "Tutorials"],
      tags: ["accessibility", "ux", "design-systems"],
      author: "Acme Admin",
      seoTitle: "Accessibility Isn't Optional: A Practical Checklist",
      metaDesc: "Sixteen concrete, practical accessibility checks any product team can run this week.",
      keywords: "web accessibility, a11y checklist, inclusive design",
      publishedAt: undefined,
      isFeatured: false,
      allowComments: true,
      visibility: "public",
      draft: true,
    },
    {
      slug: "how-small-teams-can-compete-with-enterprise-software",
      title: "How Small Teams Can Compete With Enterprise Software",
      subtitle: "You don't need feature parity to win the deal.",
      excerpt: "Small teams keep winning against much bigger competitors. Here's the pattern we keep seeing.",
      body: "<h2>Speed Beats Feature Count</h2><p>Buyers evaluating a small vendor against an enterprise incumbent rarely choose based on total feature count. They choose based on how fast a real problem gets solved during the trial.</p><h2>Support Is a Differentiator</h2><p>A same-day response from someone who actually understands the product outperforms a bigger roadmap you can't get help with. Small teams should lean into this instead of apologizing for it.</p>",
      category: ["Career", "Marketing"],
      tags: ["startups", "leadership", "marketing"],
      author: "Acme Editor",
      seoTitle: "How Small Teams Can Compete With Enterprise Software",
      metaDesc: "Why small vendors keep winning deals against enterprise incumbents, and how to lean into it.",
      keywords: "small business software, competing with enterprise",
      publishedAt: undefined,
      isFeatured: false,
      allowComments: true,
      visibility: "public",
      draft: true,
    },
    {
      slug: "the-future-of-no-code-and-low-code-platforms",
      title: "The Future of No-Code and Low-Code Platforms",
      subtitle: "Where the ceiling actually is, and where it's moving.",
      excerpt: "No-code platforms keep raising their ceiling. Here's where we think that ceiling lands next.",
      body: "<h2>The Ceiling Keeps Rising</h2><p>What required custom code two years ago — conditional logic, third-party integrations, even basic workflows — is now table stakes for no-code tools.</p><h2>What's Next</h2><p>The next frontier is composability: no-code platforms that can plug into a real codebase rather than existing as a walled garden. Expect the line between 'no-code' and 'low-code' to blur further this year.</p>",
      category: ["Technology", "News"],
      tags: ["no-code", "startups", "productivity"],
      author: "Acme Admin",
      seoTitle: "The Future of No-Code and Low-Code Platforms",
      metaDesc: "Where no-code and low-code platforms are headed next, and why the line between them is blurring.",
      keywords: "no-code, low-code, no-code platforms",
      publishedAt: "2026-07-15",
      isFeatured: false,
      allowComments: true,
      visibility: "public",
      scheduled: true,
    },
    {
      slug: "building-trust-through-transparent-pricing",
      title: "Building Trust With Customers Through Transparent Pricing",
      subtitle: "No hidden fees, no surprise upsells, no asterisks.",
      excerpt: "Transparent pricing costs you some short-term revenue tricks. It pays back in trust and lower churn.",
      body: "<h2>What Transparent Pricing Actually Means</h2><p>Every fee is visible before checkout. Every plan limit is stated plainly, not buried in a footnote. Upgrades are optional, never required to unlock a feature you were told was included.</p><h2>The Trade-Off Is Worth It</h2><p>We've left some short-term revenue on the table by not using dark patterns. Support tickets about billing surprises dropped to nearly zero, and referral rates went up.</p>",
      category: ["Marketing", "Career"],
      tags: ["pricing", "marketing", "leadership"],
      author: "Acme Editor",
      seoTitle: "Building Trust With Customers Through Transparent Pricing",
      metaDesc: "Why we chose transparent pricing over dark patterns, and what it did to churn and referrals.",
      keywords: "transparent pricing, customer trust, pricing strategy",
      publishedAt: "2026-08-01",
      isFeatured: false,
      allowComments: true,
      visibility: "public",
      scheduled: true,
    },
    {
      slug: "what-we-got-wrong-about-customer-feedback",
      title: "What We Got Wrong About Customer Feedback",
      subtitle: "Listening to everyone isn't the same as listening well.",
      excerpt: "We used to build whatever the loudest customers asked for. That turned out to be a mistake.",
      body: "<h2>The Loudest Voice Isn't the Most Representative</h2><p>Feature requests from our most vocal customers skewed toward advanced use cases that only applied to a small fraction of our base.</p><h2>What We Do Now</h2><p>We weight feedback by how representative the requester is of our broader customer base, and we validate every request against usage data before committing engineering time.</p><p>Still a work in progress, but a much better filter than volume alone.</p>",
      category: ["Product", "Career"],
      tags: ["startups", "leadership", "productivity"],
      author: "Acme Admin",
      seoTitle: "What We Got Wrong About Customer Feedback",
      metaDesc: "Why listening to your loudest customers isn't the same as listening well — and what we changed.",
      keywords: "customer feedback, product prioritization",
      publishedAt: undefined,
      isFeatured: false,
      allowComments: true,
      visibility: "private",
      scheduled: true,
      scheduledDate: "2026-08-20",
    },
  ] as Array<{
    slug: string;
    title: string;
    subtitle: string;
    excerpt: string;
    body: string;
    category: string[];
    tags: string[];
    author: string;
    seoTitle: string;
    metaDesc: string;
    keywords: string;
    publishedAt?: string;
    isFeatured: boolean;
    allowComments: boolean;
    visibility: string;
    draft?: boolean;
    scheduled?: boolean;
    scheduledDate?: string;
  }>;

  let coverIdx = 0;
  const blogIdBySlug: Record<string, string> = {};
  for (const b of blogs) {
    const isDraft = b.draft === true;
    const isScheduled = b.scheduled === true;
    const published = !isDraft && !isScheduled;
    const publishedAt = isScheduled
      ? new Date(b.scheduledDate ?? b.publishedAt!)
      : (b.publishedAt ? new Date(b.publishedAt) : null);

    const blog = await prisma.blog.upsert({
      where: { organizationId_slug: { organizationId: org.id, slug: b.slug } },
      update: {
        title: b.title, subtitle: b.subtitle, body: b.body, excerpt: b.excerpt,
        coverImage: PRESET_COVERS[coverIdx % PRESET_COVERS.length],
        author: b.author, category: b.category.join(","),
        seoTitle: b.seoTitle, metaDesc: b.metaDesc, keywords: b.keywords,
        published, publishedAt,
        visibility: b.visibility, allowComments: b.allowComments, isFeatured: b.isFeatured,
      },
      create: {
        organizationId: org.id,
        slug: b.slug, title: b.title, subtitle: b.subtitle, body: b.body, excerpt: b.excerpt,
        coverImage: PRESET_COVERS[coverIdx % PRESET_COVERS.length],
        author: b.author, category: b.category.join(","),
        seoTitle: b.seoTitle, metaDesc: b.metaDesc, keywords: b.keywords,
        published, publishedAt,
        visibility: b.visibility, allowComments: b.allowComments, isFeatured: b.isFeatured,
      },
    });
    await syncTags(org.id, "blog", blog.id, b.tags);
    blogIdBySlug[b.slug] = blog.id;
    coverIdx++;
  }

  // Pin exactly one published post to the top of the blog list.
  await prisma.blog.update({
    where: { organizationId_slug: { organizationId: org.id, slug: "our-journey-to-multi-tenant-architecture" } },
    data: { pinToTop: true },
  });

  // A few sample comments across different moderation states.
  const sampleComments: Array<{ slug: string; body: string; authorName: string; authorEmail: string; status: "PENDING" | "APPROVED" | "REJECTED" }> = [
    { slug: "10-must-have-tools-for-modern-saas-founders", body: "Solid list — we switched our billing tool after reading this and it's already paying off.", authorName: "Priya N.", authorEmail: "priya.n@example.com", status: "APPROVED" },
    { slug: "10-must-have-tools-for-modern-saas-founders", body: "Would love a follow-up on the analytics tooling specifically.", authorName: "Marcus T.", authorEmail: "marcus.t@example.com", status: "APPROVED" },
    { slug: "seo-in-2026-what-actually-moves-the-needle", body: "This matches what we're seeing too — content depth is doing more work than backlinks lately.", authorName: "Dana R.", authorEmail: "dana.r@example.com", status: "PENDING" },
    { slug: "our-journey-to-multi-tenant-architecture", body: "Curious how long the backfill actually took end to end?", authorName: "Sam K.", authorEmail: "sam.k@example.com", status: "APPROVED" },
    { slug: "our-journey-to-multi-tenant-architecture", body: "Check out my website for a totally unrelated product!!", authorName: "Spam Bot", authorEmail: "spam@example.com", status: "REJECTED" },
  ];
  for (const c of sampleComments) {
    const blogId = blogIdBySlug[c.slug];
    if (!blogId) continue;
    const existing = await prisma.comment.findFirst({
      where: { blogId, authorEmail: c.authorEmail, body: c.body },
    });
    if (!existing) {
      await prisma.comment.create({
        data: {
          blogId, organizationId: org.id, body: c.body,
          authorName: c.authorName, authorEmail: c.authorEmail, status: c.status,
        },
      });
    }
  }

  console.log("   ✓ Blog categories (8) + Blogs (21 posts: 16 published, 3 scheduled, 2 drafts) + sample comments");

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

  // Remove global themes that are no longer in the list
  const keepIds = GLOBAL_THEMES.map((t) => t.id);
  await prisma.theme.deleteMany({
    where: { isGlobal: true, id: { notIn: keepIds } },
  });

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
      name: "Color", attributeType: "color", fieldType: "dropdown", usedInVariation: true,
      values: [
        { name: "Red",    colorHex: "#EF4444" },
        { name: "Blue",   colorHex: "#3B82F6" },
        { name: "Black",  colorHex: "#111827" },
        { name: "White",  colorHex: "#F9FAFB" },
        { name: "Green",  colorHex: "#22C55E" },
        { name: "Yellow", colorHex: "#EAB308" },
      ],
    },
    {
      name: "Size", attributeType: "selection", fieldType: "buttons", usedInVariation: true,
      values: [
        { name: "XS" }, { name: "S" }, { name: "M" },
        { name: "L" },  { name: "XL" }, { name: "XXL" },
      ],
    },
    {
      name: "Material", attributeType: "selection", fieldType: "dropdown", usedInVariation: false,
      values: [
        { name: "Cotton" }, { name: "Polyester" }, { name: "Wool" },
        { name: "Silk" },   { name: "Linen" },
      ],
    },
    {
      name: "Storage", attributeType: "selection", fieldType: "buttons", usedInVariation: true,
      values: [
        { name: "64GB" }, { name: "128GB" }, { name: "256GB" },
        { name: "512GB" }, { name: "1TB" },
      ],
    },
    {
      name: "Warranty", attributeType: "selection", fieldType: "dropdown", usedInVariation: false,
      values: [
        { name: "6 Months" }, { name: "1 Year" },
        { name: "2 Years" },  { name: "3 Years" },
      ],
    },
    {
      name: "Finish", attributeType: "selection", fieldType: "dropdown", usedInVariation: false,
      values: [
        { name: "Matte" }, { name: "Gloss" },
        { name: "Satin" }, { name: "Brushed" },
      ],
    },
  ];

  for (const attr of attrDefs) {
    const existing = await prisma.storeAttribute.findFirst({
      where: { organizationId: org.id, name: attr.name },
    });
    let attrId: string;
    if (existing) {
      attrId = existing.id;
      await prisma.storeAttribute.update({
        where: { id: attrId },
        data: {
          attributeType:   attr.attributeType,
          fieldType:       attr.fieldType,
          usedInVariation: attr.usedInVariation,
        },
      });
    } else {
      const created = await prisma.storeAttribute.create({
        data: {
          organizationId:  org.id,
          name:            attr.name,
          attributeType:   attr.attributeType,
          fieldType:       attr.fieldType,
          usedInVariation: attr.usedInVariation,
        },
      });
      attrId = created.id;
    }
    for (let i = 0; i < attr.values.length; i++) {
      const v = attr.values[i];
      await prisma.storeAttributeValue.upsert({
        where: { attributeId_name: { attributeId: attrId, name: v.name } },
        update: { sortOrder: i, colorHex: (v as { name: string; colorHex?: string }).colorHex ?? null },
        create: {
          attributeId: attrId,
          name:        v.name,
          colorHex:    (v as { name: string; colorHex?: string }).colorHex ?? null,
          sortOrder:   i,
        },
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

  const prodMap: Record<string, string> = {};
  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { organizationId_slug: { organizationId: org.id, slug: p.slug } },
      update: {
        name: p.name, sku: p.sku, type: p.type, status: p.status,
        shortDescription: p.shortDescription,
        description: p.description,
        specification: p.specification,
        seoTitle: p.seoTitle,
        seoDescription: p.seoDescription,
        seoKeywords: (p as typeof p & { seoKeywords?: string }).seoKeywords ?? null,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        costPrice: p.costPrice ?? null,
        stockStatus: p.stockStatus, stock: p.stock,
        lowStockThreshold: p.lowStockThreshold,
        categoryIds: p.categoryIds,
      },
      create: {
        organizationId: org.id,
        name: p.name, slug: p.slug, sku: p.sku, type: p.type, status: p.status,
        shortDescription: p.shortDescription,
        description: p.description,
        specification: p.specification,
        seoTitle: p.seoTitle ?? null,
        seoDescription: p.seoDescription ?? null,
        seoKeywords: (p as typeof p & { seoKeywords?: string }).seoKeywords ?? null,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        costPrice: p.costPrice ?? null,
        stockStatus: p.stockStatus, stock: p.stock,
        lowStockThreshold: p.lowStockThreshold,
        categoryIds: p.categoryIds,
      },
    });
    prodMap[p.slug] = product.id;
    await syncTags(org.id, "product", product.id, p.tags);
  }

  console.log("   ✓ Products (9 sample products — all 8 types covered)");

  // ── Store customers (for Customers / Credits / Rewards pages) ──
  const storeCustomers = [
    { key: "cust1", name: "Sarah Mitchell", email: "sarah.mitchell@example.com", status: "active", segment: "vip", isVip: true, storeCredit: 25.0, rewardPoints: 2450, phone: "+1 555-0101" },
    { key: "cust2", name: "Priya Nair", email: "priya.nair@example.com", status: "active", segment: "regular", isVip: false, storeCredit: 50.0, rewardPoints: 680, phone: "+1 555-0102" },
    { key: "cust3", name: "Emma Davis", email: "emma.davis@example.com", status: "active", segment: "regular", isVip: false, storeCredit: 20.71, rewardPoints: 210, phone: "+1 555-0103" },
    { key: "cust4", name: "Aisha Johnson", email: "aisha.johnson@example.com", status: "active", segment: "at_risk", isVip: false, storeCredit: 10.0, rewardPoints: 90, phone: "+1 555-0104" },
    { key: "cust5", name: "James Cooper", email: "james.cooper@example.com", status: "active", segment: "new", isVip: false, storeCredit: 0, rewardPoints: 0, phone: "+1 555-0105" },
    { key: "cust6", name: "Wei Zhang", email: "wei.zhang@example.com", status: "unverified", segment: "new", isVip: false, storeCredit: 0, rewardPoints: 0, phone: null },
  ];
  const custMap: Record<string, string> = {};
  for (const c of storeCustomers) {
    const rec = await prisma.storeCustomer.upsert({
      where: { organizationId_email: { organizationId: org.id, email: c.email } },
      update: { name: c.name, status: c.status, segment: c.segment, isVip: c.isVip, storeCredit: c.storeCredit, rewardPoints: c.rewardPoints, phone: c.phone },
      create: { organizationId: org.id, name: c.name, email: c.email, status: c.status, segment: c.segment, isVip: c.isVip, storeCredit: c.storeCredit, rewardPoints: c.rewardPoints, phone: c.phone },
    });
    custMap[c.key] = rec.id;
  }
  console.log("   ✓ Store customers (6 sample customers with credit/reward balances)");

  // ── Coupons ──────────────────────────────────────────────
  const coupons = [
    { code: "WELCOME10", type: "percent", value: 10, minimumSpend: 25, usageLimit: 500, usageCount: 312, status: "active", freeShipping: false, expiresAt: new Date("2026-12-31") },
    { code: "SUMMER25", type: "percent", value: 25, usageLimit: 200, usageCount: 156, status: "active", freeShipping: false, expiresAt: new Date("2026-07-31") },
    { code: "FLAT20OFF", type: "fixed_cart", value: 20, usageLimit: 100, usageCount: 100, status: "expired", freeShipping: false, expiresAt: new Date("2026-01-31") },
    { code: "VIP2026", type: "percent", value: 30, usageLimitPerUser: 1, usageCount: 23, status: "active", freeShipping: true, expiresAt: new Date("2026-12-31") },
  ];
  for (const c of coupons) {
    await prisma.couponCode.upsert({
      where: { organizationId_code: { organizationId: org.id, code: c.code } },
      update: { type: c.type, value: c.value, minimumSpend: c.minimumSpend ?? null, usageLimit: c.usageLimit ?? null, usageLimitPerUser: c.usageLimitPerUser ?? null, usageCount: c.usageCount, status: c.status, freeShipping: c.freeShipping, expiresAt: c.expiresAt },
      create: { organizationId: org.id, code: c.code, type: c.type, value: c.value, minimumSpend: c.minimumSpend ?? null, usageLimit: c.usageLimit ?? null, usageLimitPerUser: c.usageLimitPerUser ?? null, usageCount: c.usageCount, status: c.status, freeShipping: c.freeShipping, expiresAt: c.expiresAt },
    });
  }
  console.log("   ✓ Coupons (4 sample discount codes)");

  // ── Inventory (separate warehouse-tracking rows for a few physical products) ──
  const inventoryRows = [
    { productSlug: "ui-component-bundle", stock: 9999, warehouseLocation: null },
    { productSlug: "pro-t-shirt-branded", stock: 14, warehouseLocation: "A-12" },
    { productSlug: "mechanical-keyboard-wrist-rest", stock: 87, warehouseLocation: "B-04" },
  ];
  for (const inv of inventoryRows) {
    const productId = prodMap[inv.productSlug];
    const existingInventory = await prisma.inventory.findFirst({
      where: { organizationId: org.id, productId, variantId: null },
    });
    if (existingInventory) {
      await prisma.inventory.update({
        where: { id: existingInventory.id },
        data: { stock: inv.stock, warehouseLocation: inv.warehouseLocation },
      });
    } else {
      await prisma.inventory.create({
        data: { organizationId: org.id, productId, stock: inv.stock, warehouseLocation: inv.warehouseLocation },
      });
    }
  }
  console.log("   ✓ Inventory (3 warehouse-tracked products)");

  // ── Orders (mix of statuses so Reports/Orders pages have real data) ──
  const sampleOrders = [
    {
      key: "ord1", customerKey: "cust1", status: "delivered", paymentStatus: "paid",
      items: [{ slug: "ui-component-bundle", quantity: 1, unitPrice: 149.0 }],
      shippingCost: 0, taxAmount: 0, daysAgo: 5,
    },
    {
      key: "ord2", customerKey: "cust2", status: "delivered", paymentStatus: "paid",
      items: [{ slug: "pro-t-shirt-branded", quantity: 2, unitPrice: 29.0 }, { slug: "mechanical-keyboard-wrist-rest", quantity: 1, unitPrice: 34.99 }],
      shippingCost: 5.0, taxAmount: 7.44, daysAgo: 12,
    },
    {
      key: "ord3", customerKey: "cust3", status: "processing", paymentStatus: "paid",
      items: [{ slug: "seo-audit-checklist-pdf", quantity: 1, unitPrice: 19.0 }],
      shippingCost: 0, taxAmount: 0, daysAgo: 1,
    },
    {
      key: "ord4", customerKey: "cust4", status: "pending", paymentStatus: "pending",
      items: [{ slug: "1-on-1-consulting-session", quantity: 1, unitPrice: 199.0 }],
      shippingCost: 0, taxAmount: 0, daysAgo: 0,
    },
    {
      key: "ord5", customerKey: "cust1", status: "cancelled", paymentStatus: "refunded",
      items: [{ slug: "icon-pack-1200-line-icons", quantity: 1, unitPrice: 39.0 }],
      shippingCost: 0, taxAmount: 0, daysAgo: 20,
    },
  ];
  for (const o of sampleOrders) {
    const customer = storeCustomers.find((c) => c.key === o.customerKey)!;
    const orderNumber = `ORD-SEED-${o.key.slice(3).padStart(4, "0")}`;
    const items = o.items.map((it) => {
      const product = products.find((p) => p.slug === it.slug)!;
      return {
        productId: prodMap[it.slug],
        productName: product.name,
        sku: product.sku,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        totalPrice: it.quantity * it.unitPrice,
      };
    });
    const subtotal = items.reduce((s, i) => s + i.totalPrice, 0);
    const total = subtotal + o.shippingCost + o.taxAmount;
    const createdAt = new Date(Date.now() - o.daysAgo * 24 * 60 * 60 * 1000);

    const existing = await prisma.order.findUnique({
      where: { organizationId_orderNumber: { organizationId: org.id, orderNumber } },
    });
    if (!existing) {
      await prisma.order.create({
        data: {
          organizationId: org.id,
          orderNumber,
          customerId: custMap[o.customerKey],
          customerName: customer.name,
          customerEmail: customer.email,
          subtotal, shippingCost: o.shippingCost, taxAmount: o.taxAmount, total,
          status: o.status, paymentStatus: o.paymentStatus,
          createdAt,
          items: { create: items },
          timeline: { create: { status: o.status, message: `Order ${o.status}`, createdAt } },
        },
      });
    }
  }
  console.log("   ✓ Orders (5 sample orders — delivered/processing/pending/cancelled)");

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
