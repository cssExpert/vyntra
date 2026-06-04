import type { Metadata } from "next";
import { SettingsAdminView } from "@/modules/admin/SettingsAdminView";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return <SettingsAdminView />;
}
