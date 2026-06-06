import type { Metadata } from "next";
import { CompaniesAdminView } from "@/modules/admin/CompaniesAdminView";

export const metadata: Metadata = { title: "Companies" };

export default function AdminCompaniesPage() {
  return <CompaniesAdminView />;
}
