import type { Metadata } from "next";
import { StorageSettingsView } from "@/modules/admin/StorageSettingsView";

export const metadata: Metadata = { title: "Admin Settings - Storage" };

export default function StorageSettingsPage() {
  return <StorageSettingsView />;
}
