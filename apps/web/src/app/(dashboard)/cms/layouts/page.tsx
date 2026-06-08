import type { Metadata } from "next";
import dynamic from "next/dynamic";

const LayoutsView = dynamic(() =>
  import("@/modules/cms/LayoutsView").then((m) => ({ default: m.LayoutsView }))
);

export const metadata: Metadata = { title: "Layouts — CMS" };

export default function CmsLayoutsPage() {
  return <LayoutsView />;
}
