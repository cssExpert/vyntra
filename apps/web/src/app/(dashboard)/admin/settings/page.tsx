import type { Metadata } from "next";
import { SettingsAdminView } from "@/modules/admin/SettingsAdminView";

export const metadata: Metadata = { title: "Admin Settings" };

export default function AdminSettingsPage() {
  return <SettingsAdminView />;
}
