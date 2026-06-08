import type { Metadata } from "next";
import dynamic from "next/dynamic";

const DashboardView = dynamic(() =>
  import("@/modules/dashboard/DashboardView").then((m) => ({ default: m.DashboardView }))
);

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return <DashboardView />;
}
