import type { Metadata } from "next";
import dynamic from "next/dynamic";

const CustomerDetailsView = dynamic(() =>
  import("@/modules/store/customers/CustomerDetailsView").then((m) => ({ default: m.CustomerDetailsView }))
);

export const metadata: Metadata = { title: "Customer Profile — Store" };

export default async function CustomerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CustomerDetailsView customerId={id} />;
}
