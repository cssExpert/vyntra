import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { AdminGuard } from "@/modules/admin/AdminGuard";

const SuperAdminDashboardView = dynamic(() =>
  import("@/modules/dashboard/SuperAdminDashboardView").then((m) => ({ default: m.SuperAdminDashboardView }))
);

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <SuperAdminDashboardView />
    </AdminGuard>
  );
}
