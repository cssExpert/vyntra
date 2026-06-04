import type { Metadata } from "next";
import { GalleryDetailView } from "@/modules/cms/gallery/GalleryDetailView";

export const metadata: Metadata = { title: "Gallery Items — CMS" };

export default function GalleryDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <GalleryDetailView galleryId={params.id} />;
}
