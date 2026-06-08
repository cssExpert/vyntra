import type { Metadata } from "next";
import dynamic from "next/dynamic";

const PreviewWebsiteView = dynamic(() =>
  import("@/modules/cms/PreviewWebsiteView").then((m) => ({ default: m.PreviewWebsiteView }))
);

export const metadata: Metadata = { title: "Preview Website — CMS" };

export default function CmsPreviewPage() {
  return <PreviewWebsiteView />;
}
