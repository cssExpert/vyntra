import type { Metadata } from "next";
import dynamic from "next/dynamic";

const BlogEditor = dynamic(() =>
  import("@/modules/cms/blog-editor/BlogEditor").then((m) => ({ default: m.BlogEditor }))
);

export const metadata: Metadata = { title: "Add Blog — CMS" };

export default function NewBlogPage() {
  return <BlogEditor />;
}
