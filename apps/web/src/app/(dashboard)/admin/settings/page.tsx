import type { Metadata } from "next";
import { AppSettingsView } from "@/modules/admin/SettingsAdminView";

export const metadata: Metadata = { title: "Admin Settings - App Settings" };

export default function AdminSettingsPage() {
  return <AppSettingsView />;
}
