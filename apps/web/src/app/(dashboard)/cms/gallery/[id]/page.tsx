import type { Metadata } from "next";
import dynamic from "next/dynamic";

const GalleryDetailView = dynamic(() =>
  import("@/modules/cms/gallery/GalleryDetailView").then((m) => ({ default: m.GalleryDetailView }))
);

export const metadata: Metadata = { title: "Gallery Items — CMS" };

export default function GalleryDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <GalleryDetailView galleryId={params.id} />;
}
