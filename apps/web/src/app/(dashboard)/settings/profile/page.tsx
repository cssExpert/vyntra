import type { Metadata } from "next";
import { ProfileSettingsView } from "@/modules/settings/ProfileSettingsView";

export const metadata: Metadata = { title: "Profile" };

export default function ProfileSettingsPage() {
  return <ProfileSettingsView />;
}
