import type { Metadata } from "next";
import dynamic from "next/dynamic";

const GalleryView = dynamic(() =>
  import("@/modules/cms/GalleryView").then((m) => ({ default: m.GalleryView }))
);

export const metadata: Metadata = { title: "Gallery — CMS" };

export default function CmsGalleryPage() {
  return <GalleryView />;
}
