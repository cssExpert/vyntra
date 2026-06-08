import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { AdminGuard } from "@/modules/admin/AdminGuard";

const UserDetailView = dynamic(() =>
  import("@/modules/admin/UserDetailView").then((m) => ({ default: m.UserDetailView }))
);

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
