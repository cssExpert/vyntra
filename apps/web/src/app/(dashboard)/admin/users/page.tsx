import type { Metadata } from "next";
import dynamic from "next/dynamic";

const UsersAdminView = dynamic(() =>
  import("@/modules/admin/UsersAdminView").then((m) => ({ default: m.UsersAdminView }))
);

export const metadata: Metadata = { title: "Users" };

export default function AdminUsersPage() {
  return <UsersAdminView />;
}
