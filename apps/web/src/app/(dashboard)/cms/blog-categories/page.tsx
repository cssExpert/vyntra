import type { Metadata } from "next";
import dynamic from "next/dynamic";

const BlogCategoriesView = dynamic(() =>
  import("@/modules/cms/blog-categories/BlogCategoriesView").then((m) => ({ default: m.BlogCategoriesView }))
);

export const metadata: Metadata = { title: "Blog Categories — CMS" };

export default function BlogCategoriesPage() {
  return <BlogCategoriesView />;
}
