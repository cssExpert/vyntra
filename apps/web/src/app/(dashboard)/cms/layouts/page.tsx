import type { Metadata } from "next";
import { LayoutsView } from "@/modules/cms/LayoutsView";

export const metadata: Metadata = { title: "Layouts — CMS" };

export default function CmsLayoutsPage() {
  return <LayoutsView />;
}
