import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const ORG_ID = "cmq0mh313000ymcxoi84xasxz";

async function main() {
  // Remove any existing Shopingo menus for this org (idempotent)
  await prisma.menu.deleteMany({
    where: { organizationId: ORG_ID, slug: { in: ["shopingo-nav", "shopingo-explore", "shopingo-company", "shopingo-apps"] } },
  });

  // 1. Header navigation
  await prisma.menu.create({
    data: {
      name: "Shopingo Nav",
      slug: "shopingo-nav",
      menuType: "navigation",
      visibility: ["all"],
      organizationId: ORG_ID,
      items: {
        create: [
          { label: "Home",       url: "/",           target: "_self", visibility: ["all"], order: 0 },
          { label: "Categories", url: "/categories", target: "_self", visibility: ["all"], order: 1 },
          { label: "Shop",       url: "/shop",       target: "_self", visibility: ["all"], order: 2 },
          { label: "About",      url: "/about-us",   target: "_self", visibility: ["all"], order: 3 },
          { label: "Blog",       url: "/blog",       target: "_self", visibility: ["all"], order: 4 },
          { label: "Contact",    url: "/contact-us", target: "_self", visibility: ["all"], order: 5 },
        ],
      },
    },
  });

  // 2. Footer: Explore column
  await prisma.menu.create({
    data: {
      name: "Footer: Explore",
      slug: "shopingo-explore",
      menuType: "footer",
      visibility: ["all"],
      organizationId: ORG_ID,
      items: {
        create: [
          { label: "Fashion",   url: "/shop/fashion",   target: "_self", visibility: ["all"], order: 0 },
          { label: "Women",     url: "/shop/women",     target: "_self", visibility: ["all"], order: 1 },
          { label: "Furniture", url: "/shop/furniture", target: "_self", visibility: ["all"], order: 2 },
          { label: "Shoes",     url: "/shop/shoes",     target: "_self", visibility: ["all"], order: 3 },
          { label: "Topwear",   url: "/shop/topwear",   target: "_self", visibility: ["all"], order: 4 },
          { label: "Brands",    url: "/shop/brands",    target: "_self", visibility: ["all"], order: 5 },
          { label: "Kids",      url: "/shop/kids",      target: "_self", visibility: ["all"], order: 6 },
        ],
      },
    },
  });

  // 3. Footer: Company column
  await prisma.menu.create({
    data: {
      name: "Footer: Company",
      slug: "shopingo-company",
      menuType: "footer",
      visibility: ["all"],
      organizationId: ORG_ID,
      items: {
        create: [
          { label: "About Us",    url: "/about-us",    target: "_self", visibility: ["all"], order: 0 },
          { label: "Contact Us",  url: "/contact-us",  target: "_self", visibility: ["all"], order: 1 },
          { label: "FAQ",         url: "/faq",         target: "_self", visibility: ["all"], order: 2 },
          { label: "Privacy",     url: "/privacy",     target: "_self", visibility: ["all"], order: 3 },
          { label: "Terms",       url: "/terms",       target: "_self", visibility: ["all"], order: 4 },
          { label: "Complaints",  url: "/complaints",  target: "_self", visibility: ["all"], order: 5 },
        ],
      },
    },
  });

  // 4. Footer: Mobile Apps column
  await prisma.menu.create({
    data: {
      name: "Footer: Mobile Apps",
      slug: "shopingo-apps",
      menuType: "footer",
      visibility: ["all"],
      organizationId: ORG_ID,
      items: {
        create: [
          { label: "Play Store",  url: "https://play.google.com",  target: "_blank", visibility: ["all"], order: 0 },
          { label: "Apple Store", url: "https://apps.apple.com",   target: "_blank", visibility: ["all"], order: 1 },
        ],
      },
    },
  });

  // 5. Create (or update) a Shopingo layout wiring everything together
  const existing = await prisma.layout.findFirst({
    where: { organizationId: ORG_ID, name: "Shopingo" },
  });

  const [navMenu, exploreMenu, companyMenu, appsMenu] = await Promise.all([
    prisma.menu.findFirst({ where: { organizationId: ORG_ID, slug: "shopingo-nav" }, select: { id: true } }),
    prisma.menu.findFirst({ where: { organizationId: ORG_ID, slug: "shopingo-explore" }, select: { id: true } }),
    prisma.menu.findFirst({ where: { organizationId: ORG_ID, slug: "shopingo-company" }, select: { id: true } }),
    prisma.menu.findFirst({ where: { organizationId: ORG_ID, slug: "shopingo-apps" }, select: { id: true } }),
  ]);

  const footerColumns = [
    { title: "Explore",      menuId: exploreMenu!.id },
    { title: "Company",      menuId: companyMenu!.id },
    { title: "Mobile Apps",  menuId: appsMenu!.id },
  ];

  if (existing) {
    await prisma.layout.update({
      where: { id: existing.id },
      data: {
        navMenuId: navMenu!.id,
        footerColumns: footerColumns as object,
      },
    });
    console.log(`✓ Updated existing layout "${existing.id}"`);
  } else {
    const layout = await prisma.layout.create({
      data: {
        name: "Shopingo",
        isDefault: false,
        navMenuId: navMenu!.id,
        footerColumns: footerColumns as object,
        organizationId: ORG_ID,
      },
    });
    console.log(`✓ Created layout "${layout.id}"`);
  }

  console.log("✓ Shopingo Nav");
  console.log("✓ Footer: Explore (7 items)");
  console.log("✓ Footer: Company (6 items)");
  console.log("✓ Footer: Mobile Apps (2 items)");
  console.log("✓ Layout: Shopingo (shopingo header + shopingo footer)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
