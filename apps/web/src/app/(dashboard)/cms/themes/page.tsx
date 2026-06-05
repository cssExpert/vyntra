import type { Metadata } from "next";
import { ThemesView } from "@/modules/cms/ThemesView";

export const metadata: Metadata = { title: "Themes — CMS" };

export default function CmsThemesPage() {
  return <ThemesView />;
}
