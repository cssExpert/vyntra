import type { Metadata } from "next";
import { UserDetailView } from "@/modules/admin/UserDetailView";
import { AdminGuard } from "@/modules/admin/AdminGuard";

export const metadata: Metadata = {
  title: "User Details",
};

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <AdminGuard>
      <UserDetailView params={params} />
    </AdminGuard>
  );
}
