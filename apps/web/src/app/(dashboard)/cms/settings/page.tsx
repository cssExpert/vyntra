import type { Metadata } from "next";
import dynamic from "next/dynamic";

const CmsSettingsView = dynamic(() =>
  import("@/modules/cms/CmsSettingsView").then((m) => ({ default: m.CmsSettingsView }))
);

export const metadata: Metadata = { title: "Settings — CMS" };

export default function CmsSettingsPage() {
  return <CmsSettingsView />;
}
