import type { Metadata } from "next";
import dynamic from "next/dynamic";

const PaymentSettingsView = dynamic(() =>
  import("@/modules/admin/PaymentSettingsView").then((m) => ({ default: m.PaymentSettingsView }))
);

export const metadata: Metadata = { title: "Admin Settings - Payment Methods" };

export default function PaymentSettingsPage() {
  return <PaymentSettingsView />;
}
