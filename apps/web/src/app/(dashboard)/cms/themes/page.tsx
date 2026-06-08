import type { Metadata } from "next";
import dynamic from "next/dynamic";

const ThemesView = dynamic(() =>
  import("@/modules/cms/ThemesView").then((m) => ({ default: m.ThemesView }))
);

export const metadata: Metadata = { title: "Themes — CMS" };

export default function CmsThemesPage() {
  return <ThemesView />;
}
