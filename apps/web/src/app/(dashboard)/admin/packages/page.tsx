import type { Metadata } from "next";
import dynamic from "next/dynamic";

const PackagesAdminView = dynamic(() =>
  import("@/modules/admin/PackagesAdminView").then((m) => ({ default: m.PackagesAdminView }))
);

export const metadata: Metadata = { title: "Packages" };

export default function AdminPackagesPage() {
  return <PackagesAdminView />;
}
