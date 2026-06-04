import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Default dev password for all seeded accounts. Override via SEED_PASSWORD.
const PASSWORD = process.env.SEED_PASSWORD ?? 'ChangeMe123!';

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  // ── Module catalog (every product feature is a module) ──
  const MODULES: Array<{ key: string; name: string; description: string }> = [
    { key: 'CMS', name: 'CMS / Editor', description: 'Pages, blogs, media & comments' },
    { key: 'CRM', name: 'CRM', description: 'Leads, contacts, campaigns & tasks' },
    { key: 'EMAIL', name: 'Email Automations', description: 'Campaigns & workflows' },
    { key: 'CALLING', name: 'Calling', description: 'Voice & call management' },
    { key: 'SEO', name: 'SEO Tools', description: 'SEO analysis & optimization' },
    { key: 'LIGHTHOUSE', name: 'Lighthouse', description: 'Performance audits' },
    { key: 'STORE', name: 'Store', description: 'Products & order management' },
    { key: 'PAYMENTS', name: 'Payments', description: 'Payment gateway integrations' },
    { key: 'REPORTS', name: 'Reports', description: 'Analytics & reporting' },
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
      name: 'Free',
      slug: 'free',
      description: 'CMS only — get started for free',
      priceCents: 0,
      maxUsers: 3,
      modules: ['CMS'],
    },
    {
      name: 'Pro',
      slug: 'pro',
      description: 'Content, CRM & marketing for growing teams',
      priceCents: 4900,
      maxUsers: 10,
      modules: ['CMS', 'CRM', 'EMAIL', 'SEO', 'LIGHTHOUSE', 'REPORTS'],
    },
    {
      name: 'Enterprise',
      slug: 'enterprise',
      description: 'Every module, with a high user cap',
      priceCents: 19900,
      maxUsers: 100,
      modules: MODULES.map((m) => m.key),
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
      data: p.modules.map((key) => ({ packageId: pkg.id, moduleId: moduleIdByKey[key] })),
    });
  }

  // ── Super admin (platform-level, no organization) ───────
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@vyntra.com' },
    update: { superAdmin: true, password: passwordHash },
    create: {
      email: 'superadmin@vyntra.com',
      name: 'Super Admin',
      password: passwordHash,
      superAdmin: true,
    },
  });
  // organizationId is null for the platform-wide SUPER_ADMIN role; Postgres
  // treats NULLs as distinct in the composite unique, so find-or-create.
  const existingSuperRole = await prisma.userRole.findFirst({
    where: { userId: superAdmin.id, role: Role.SUPER_ADMIN, organizationId: null },
  });
  if (!existingSuperRole) {
    await prisma.userRole.create({
      data: { userId: superAdmin.id, role: Role.SUPER_ADMIN },
    });
  }

  // ── Sample company on the Pro plan ──────────────────────
  const org = await prisma.organization.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      name: 'Acme Corp',
      slug: 'acme-corp',
      email: 'admin@acme.com',
      maxUsers: 10,
      subscription: {
        create: { packageId: bySlug['pro'], billingEmail: 'admin@acme.com' },
      },
    },
  });

  const orgAdmin = await prisma.user.upsert({
    where: { email: 'admin@acme.com' },
    update: { password: passwordHash, organizationId: org.id },
    create: {
      email: 'admin@acme.com',
      name: 'Acme Admin',
      password: passwordHash,
      organizationId: org.id,
    },
  });
  const existingAdminRole = await prisma.userRole.findFirst({
    where: { userId: orgAdmin.id, organizationId: org.id },
  });
  if (!existingAdminRole) {
    await prisma.userRole.create({
      data: { userId: orgAdmin.id, organizationId: org.id, role: Role.ORG_ADMIN },
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
      await prisma.userRole.create({ data: { userId: u.id, organizationId, role } });
    }
  };

  // One user per role inside Acme (Pro plan).
  await ensureMember('editor@acme.com', 'Acme Editor', org.id, Role.EDITOR);
  await ensureMember('user@acme.com', 'Acme User', org.id, Role.USER);
  await ensureMember('viewer@acme.com', 'Acme Viewer', org.id, Role.VIEWER);

  // ── Second company on the Free plan (shows package-based nav gating) ──
  const bloom = await prisma.organization.upsert({
    where: { slug: 'bloom-studio' },
    update: {},
    create: {
      name: 'Bloom Studio',
      slug: 'bloom-studio',
      email: 'admin@bloom.com',
      maxUsers: 3,
      subscription: {
        create: { packageId: bySlug['free'], billingEmail: 'admin@bloom.com' },
      },
    },
  });
  await ensureMember('admin@bloom.com', 'Bloom Admin', bloom.id, Role.ORG_ADMIN);

  console.log(`✅ Seed complete  (password for all accounts: ${PASSWORD})`);
  console.log('   SUPER_ADMIN : superadmin@vyntra.com');
  console.log('   ORG_ADMIN   : admin@acme.com    (Acme Corp · Pro)');
  console.log('   EDITOR      : editor@acme.com   (Acme Corp · Pro)');
  console.log('   USER        : user@acme.com     (Acme Corp · Pro)');
  console.log('   VIEWER      : viewer@acme.com   (Acme Corp · Pro)');
  console.log('   ORG_ADMIN   : admin@bloom.com   (Bloom Studio · Free)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
