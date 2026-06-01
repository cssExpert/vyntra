import type { Metadata } from "next";
import { BlogEditor } from "@/modules/cms/blog-editor/BlogEditor";

export const metadata: Metadata = { title: "Add Blog — CMS" };

export default function NewBlogPage() {
  return <BlogEditor />;
}
