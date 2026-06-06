import type { Metadata } from "next";
import { PaymentSettingsView } from "@/modules/admin/PaymentSettingsView";

export const metadata: Metadata = { title: "Admin Settings - Payment Methods" };

export default function PaymentSettingsPage() {
  return <PaymentSettingsView />;
}
