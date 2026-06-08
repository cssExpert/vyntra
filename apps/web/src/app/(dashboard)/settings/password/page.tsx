import type { Metadata } from "next";
import { PasswordSettingsView } from "@/modules/settings/PasswordSettingsView";

export const metadata: Metadata = { title: "Manage Password" };

export default function PasswordSettingsPage() {
  return <PasswordSettingsView />;
}
