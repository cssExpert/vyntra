import type { Metadata } from "next";
import { PackagesAdminView } from "@/modules/admin/PackagesAdminView";

export const metadata: Metadata = { title: "Packages" };

export default function AdminPackagesPage() {
  return <PackagesAdminView />;
}
