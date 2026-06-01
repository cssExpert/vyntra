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
      modules: ['CMS', 'CRM', 'EMAIL', 'SEO', 'REPORTS'],
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

  const editor = await prisma.user.upsert({
    where: { email: 'editor@acme.com' },
    update: { password: passwordHash, organizationId: org.id },
    create: {
      email: 'editor@acme.com',
      name: 'Acme Editor',
      password: passwordHash,
      organizationId: org.id,
    },
  });
  const existingEditorRole = await prisma.userRole.findFirst({
    where: { userId: editor.id, organizationId: org.id },
  });
  if (!existingEditorRole) {
    await prisma.userRole.create({
      data: { userId: editor.id, organizationId: org.id, role: Role.EDITOR },
    });
  }

  console.log('✅ Seed complete');
  console.log('   Super admin : superadmin@vyntra.com');
  console.log('   Org admin   : admin@acme.com (Acme Corp, Pro plan)');
  console.log('   Editor      : editor@acme.com');
  console.log(`   Password    : ${PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
