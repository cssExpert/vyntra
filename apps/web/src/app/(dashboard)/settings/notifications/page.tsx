import type { Metadata } from "next";
import { NotificationsSettingsView } from "@/modules/settings/NotificationsSettingsView";

export const metadata: Metadata = { title: "Manage Notifications" };

export default function NotificationsSettingsPage() {
  return <NotificationsSettingsView />;
}
