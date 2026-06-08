import type { Metadata } from "next";
import dynamic from "next/dynamic";

const CompanyDetailView = dynamic(() =>
  import("@/modules/admin/CompanyDetailView").then((m) => ({ default: m.CompanyDetailView }))
);

export const metadata: Metadata = { title: "Company" };

export default async function AdminCompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CompanyDetailView companyId={id} />;
}
