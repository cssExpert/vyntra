import type { Metadata } from "next";
import dynamic from "next/dynamic";

const SeoView = dynamic(() =>
  import("@/modules/seo/SeoView").then((m) => ({ default: m.SeoView }))
);

export const metadata: Metadata = {
  title: "SEO Tool",
};

export default function SEOPage() {
  return <SeoView />;
}
