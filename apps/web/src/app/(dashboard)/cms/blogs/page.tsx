import type { Metadata } from "next";
import dynamic from "next/dynamic";

const BlogView = dynamic(() =>
  import("@/modules/cms/BlogView").then((m) => ({ default: m.BlogView }))
);

export const metadata: Metadata = { title: "Blog — CMS" };

export default function CmsBlogPage() {
  return <BlogView />;
}
