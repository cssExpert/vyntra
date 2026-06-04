import type { Metadata } from "next";
import { SeoView } from "@/modules/seo/SeoView";

export const metadata: Metadata = {
  title: "SEO Tool",
};

export default function SEOPage() {
  return <SeoView />;
}
