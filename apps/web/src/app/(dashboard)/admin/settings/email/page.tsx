import type { Metadata } from "next";
import dynamic from "next/dynamic";

const EmailSettingsView = dynamic(() =>
  import("@/modules/admin/EmailSettingsView").then((m) => ({ default: m.EmailSettingsView }))
);

export const metadata: Metadata = { title: "Admin Settings - Email" };

export default function EmailSettingsPage() {
  return <EmailSettingsView />;
}
