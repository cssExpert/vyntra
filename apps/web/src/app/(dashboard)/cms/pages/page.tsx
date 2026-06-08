import type { Metadata } from "next";
import dynamic from "next/dynamic";

const PagesView = dynamic(() =>
  import("@/modules/cms/PagesView").then((m) => ({ default: m.PagesView }))
);

export const metadata: Metadata = { title: "Pages — CMS" };

export default function CmsPagesPage() {
  return <PagesView />;
}
