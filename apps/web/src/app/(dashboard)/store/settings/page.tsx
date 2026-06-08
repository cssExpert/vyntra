import type { Metadata } from "next";
import dynamic from "next/dynamic";

const StoreSettingsView = dynamic(() =>
  import("@/modules/store/settings/StoreSettingsView").then((m) => ({ default: m.StoreSettingsView }))
);
export const metadata: Metadata = { title: "Store Settings" };
export default function StoreSettingsPage() { return <StoreSettingsView />; }
