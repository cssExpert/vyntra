import type { Metadata } from "next";
import { BlogView } from "@/modules/cms/BlogView";

export const metadata: Metadata = { title: "Blog — CMS" };

export default function CmsBlogPage() {
  return <BlogView />;
}
