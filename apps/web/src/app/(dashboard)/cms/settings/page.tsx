import type { Metadata } from "next";
import { CmsSettingsView } from "@/modules/cms/CmsSettingsView";

export const metadata: Metadata = { title: "Settings — CMS" };

export default function CmsSettingsPage() {
  return <CmsSettingsView />;
}
