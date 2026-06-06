import type { Metadata } from "next";
import { EmailSettingsView } from "@/modules/admin/EmailSettingsView";

export const metadata: Metadata = { title: "Admin Settings - Email" };

export default function EmailSettingsPage() {
  return <EmailSettingsView />;
}
