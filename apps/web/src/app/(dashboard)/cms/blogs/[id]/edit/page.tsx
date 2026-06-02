import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogEditor } from "@/modules/cms/blog-editor/BlogEditor";
import { getBlogById } from "@/modules/cms/blog-data";

export const metadata: Metadata = { title: "Edit Blog — CMS" };

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const blog = getBlogById(id);
  if (!blog) notFound();
  return <BlogEditor blog={blog} />;
}
