import type { Metadata } from "next";
import { PagesView } from "@/modules/cms/PagesView";

export const metadata: Metadata = { title: "Pages — CMS" };

export default function CmsPagesPage() {
  return <PagesView />;
}
