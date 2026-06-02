import type { Metadata } from "next";
import { UsersAdminView } from "@/modules/admin/UsersAdminView";

export const metadata: Metadata = { title: "Users" };

export default function AdminUsersPage() {
  return <UsersAdminView />;
}
