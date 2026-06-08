import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { AdminGuard } from "@/modules/admin/AdminGuard";

const UsersView = dynamic(() =>
  import("@/modules/users/UsersView").then((m) => ({ default: m.UsersView }))
);

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
