import type { Metadata } from "next";
import { BlogCategoriesView } from "@/modules/cms/blog-categories/BlogCategoriesView";

export const metadata: Metadata = { title: "Blog Categories — CMS" };

export default function BlogCategoriesPage() {
  return <BlogCategoriesView />;
}
