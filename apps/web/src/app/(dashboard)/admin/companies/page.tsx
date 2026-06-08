import type { Metadata } from "next";
import dynamic from "next/dynamic";

const CompaniesAdminView = dynamic(() =>
  import("@/modules/admin/CompaniesAdminView").then((m) => ({ default: m.CompaniesAdminView }))
);

export const metadata: Metadata = { title: "Companies" };

export default function AdminCompaniesPage() {
  return <CompaniesAdminView />;
}
