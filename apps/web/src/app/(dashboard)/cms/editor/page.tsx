import { Suspense } from "react";
import type { Metadata } from "next";
import EditorLayout from "@/components/editor/EditorLayout";

export const metadata: Metadata = {
  title: "Editor — CMS",
  description:
    "A powerful drag-and-drop visual website builder with Tailwind CSS",
};

export default function CmsEditorPage() {
  return (
    <Suspense>
      <EditorLayout />
    </Suspense>
  );
}
