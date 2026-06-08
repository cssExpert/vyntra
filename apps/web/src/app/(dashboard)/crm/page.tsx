import type { Metadata } from "next";
import dynamic from "next/dynamic";

const CRMView = dynamic(() =>
  import("@/modules/crm/CRMView").then((m) => ({ default: m.CRMView }))
);

export const metadata: Metadata = {
  title: "CRM",
};

export default function CRMPage() {
  return <CRMView />;
}
