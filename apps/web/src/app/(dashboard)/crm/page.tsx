import type { Metadata } from "next";
import { CRMView } from "@/modules/crm/CRMView";

export const metadata: Metadata = {
  title: "CRM",
};

export default function CRMPage() {
  return <CRMView />;
}
