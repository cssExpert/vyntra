"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { BlogEditor } from "@/modules/cms/blog-editor/BlogEditor";
import { cmsBlogs, type CmsBlogDetail } from "@/lib/api";

export default function EditBlogPage() {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<CmsBlogDetail | null>(null);
  const [notFoundFlag, setNotFoundFlag] = useState(false);

  useEffect(() => {
    cmsBlogs
      .get(id)
      .then(setBlog)
      .catch(() => setNotFoundFlag(true));
  }, [id]);

  if (notFoundFlag) notFound();
  if (!blog) return null;

  return <BlogEditor blog={blog} />;
}
