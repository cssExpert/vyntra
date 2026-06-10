import type { Metadata } from "next";
import dynamic from "next/dynamic";

const FormsView = dynamic(() =>
  import("@/modules/cms/forms/FormsView").then((m) => ({
    default: m.FormsView,
  })),
);

export const metadata: Metadata = { title: "Forms — CMS" };

export default function CmsFormsPage() {
  return <FormsView />;
}
