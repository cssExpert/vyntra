import type { Metadata } from "next";
import dynamic from "next/dynamic";

const AdminBlocksView = dynamic(() =>
  import("@/modules/admin/AdminBlocksView").then((m) => ({ default: m.AdminBlocksView }))
);

export const metadata: Metadata = { title: "Global Blocks — Admin" };

export default function AdminBlocksPage() {
  return <AdminBlocksView />;
}
