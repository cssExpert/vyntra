import type { Metadata } from "next";
import dynamic from "next/dynamic";

const AdminThemesView = dynamic(() =>
  import("@/modules/admin/AdminThemesView").then((m) => ({ default: m.AdminThemesView }))
);

export const metadata: Metadata = { title: "Global Themes — Admin" };

export default function AdminThemesPage() {
  return <AdminThemesView />;
}
