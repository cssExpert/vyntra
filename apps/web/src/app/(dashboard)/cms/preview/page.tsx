import type { Metadata } from "next";
import { PreviewWebsiteView } from "@/modules/cms/PreviewWebsiteView";

export const metadata: Metadata = { title: "Preview Website — CMS" };

export default function CmsPreviewPage() {
  return <PreviewWebsiteView />;
}
