import type { Metadata } from "next";
import { SubscriptionSettingsView } from "@/modules/settings/SubscriptionSettingsView";

export const metadata: Metadata = { title: "Subscription" };

export default function SubscriptionSettingsPage() {
  return <SubscriptionSettingsView />;
}
