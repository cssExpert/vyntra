import type { Metadata } from "next";
import dynamic from "next/dynamic";

const StorageSettingsView = dynamic(() =>
  import("@/modules/admin/StorageSettingsView").then((m) => ({ default: m.StorageSettingsView }))
);

export const metadata: Metadata = { title: "Admin Settings - Storage" };

export default function StorageSettingsPage() {
  return <StorageSettingsView />;
}
