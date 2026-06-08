import type { Metadata } from "next";
import { BillingSettingsView } from "@/modules/settings/BillingSettingsView";

export const metadata: Metadata = { title: "Billing Info" };

export default function BillingSettingsPage() {
  return <BillingSettingsView />;
}
