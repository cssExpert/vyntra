import type { Metadata } from "next";
import dynamic from "next/dynamic";

const CmsDashboard = dynamic(() =>
  import("@/modules/cms/CmsDashboard").then((m) => ({ default: m.CmsDashboard }))
);

export const metadata: Metadata = { title: "CMS Dashboard" };

export default function CMSPage() {
  return <CmsDashboard />;
}
