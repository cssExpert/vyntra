import type { Metadata } from "next";
import dynamic from "next/dynamic";

const AppSettingsView = dynamic(() =>
  import("@/modules/admin/SettingsAdminView").then((m) => ({ default: m.AppSettingsView }))
);

export const metadata: Metadata = { title: "Admin Settings - App Settings" };

export default function AdminSettingsPage() {
  return <AppSettingsView />;
}
