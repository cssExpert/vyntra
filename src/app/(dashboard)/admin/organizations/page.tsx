import type { Metadata } from "next";
import { OrganizationsAdminView } from "@/modules/admin/OrganizationsAdminView";

export const metadata: Metadata = { title: "Organizations" };

export default function AdminOrganizationsPage() {
  return <OrganizationsAdminView />;
}
