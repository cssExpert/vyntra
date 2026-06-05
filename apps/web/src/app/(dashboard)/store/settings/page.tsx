import type { Metadata } from "next";
import { StoreSettingsView } from "@/modules/store/settings/StoreSettingsView";
export const metadata: Metadata = { title: "Store Settings" };
export default function StoreSettingsPage() { return <StoreSettingsView />; }
