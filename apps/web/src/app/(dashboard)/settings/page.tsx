import type { Metadata } from "next";
import dynamic from "next/dynamic";

const SettingsView = dynamic(() =>
  import("@/modules/settings/SettingsView").then((m) => ({ default: m.SettingsView }))
);

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return <SettingsView />;
}
