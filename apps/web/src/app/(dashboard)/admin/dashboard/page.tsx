import type { Metadata } from "next";
import { SuperAdminDashboardView } from "@/modules/dashboard/SuperAdminDashboardView";
import { AdminGuard } from "@/modules/admin/AdminGuard";

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
