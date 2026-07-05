// One-off backfill: seed the 3 default customer groups for organizations that
// existed before this feature shipped (new orgs get these via OrganizationsService.create).
// Run manually once: pnpm --filter @vyntra/api exec ts-node prisma/seed-customer-groups-backfill.ts
import { PrismaClient } from "@prisma/client";
import { DEFAULT_CUSTOMER_GROUP_NAMES } from "../src/store/utils/default-customer-groups";

const prisma = new PrismaClient();

async function main() {
  const orgs = await prisma.organization.findMany({ select: { id: true, name: true } });

  for (const org of orgs) {
    const { count } = await prisma.customerGroup.createMany({
      data: DEFAULT_CUSTOMER_GROUP_NAMES.map((name) => ({
        organizationId: org.id,
        name,
        isDefault: true,
      })),
      skipDuplicates: true,
    });
    console.log(`${org.name}: created ${count} default group(s)`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
