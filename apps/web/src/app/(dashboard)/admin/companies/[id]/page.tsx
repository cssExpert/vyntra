import type { Metadata } from "next";
import { CompanyDetailView } from "@/modules/admin/CompanyDetailView";

export const metadata: Metadata = { title: "Company" };

export default async function AdminCompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CompanyDetailView companyId={id} />;
}
