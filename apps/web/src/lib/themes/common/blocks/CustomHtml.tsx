"use client";
import type { CustomHtmlData } from "@/lib/themes/types";

export default function CustomHtml({ data }: { data: CustomHtmlData }) {
  return <div dangerouslySetInnerHTML={{ __html: data.html ?? "" }} />;
}
