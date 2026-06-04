import type { Metadata } from "next";
import { GalleryView } from "@/modules/cms/GalleryView";

export const metadata: Metadata = { title: "Gallery — CMS" };

export default function CmsGalleryPage() {
  return <GalleryView />;
}
