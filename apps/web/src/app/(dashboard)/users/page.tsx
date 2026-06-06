import type { Metadata } from "next";
import { UsersView } from "@/modules/users/UsersView";
import { AdminGuard } from "@/modules/admin/AdminGuard";

export const metadata: Metadata = {
  title: "Users",
};

export default function UsersPage() {
  return (
    <AdminGuard>
      <UsersView />
    </AdminGuard>
  );
}
